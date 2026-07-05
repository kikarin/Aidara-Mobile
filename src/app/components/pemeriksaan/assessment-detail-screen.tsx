import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  ArrowLeft, Info, Settings, ClipboardList, BarChart2, ChevronRight,
  ChevronDown, ChevronUp, Plus, Trash2, ArrowUp, ArrowDown,
  CheckCircle, Zap, GripVertical, Loader2,
} from "lucide-react";
import { cn } from "../ui/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import type { Assessment } from "@/app/lib/pk-mappers";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import {
  useClonePkTemplate,
  usePkHasilTes,
  usePkPesertaHasilTes,
  usePkPesertaVisualisasi,
  usePkSetup,
  usePkSetupPeserta,
  usePkVisualisasi,
  useSavePkHasilTes,
  useSavePkSetup,
} from "@/hooks/use-pemeriksaan-khusus";
import {
  buildBarChartData,
  buildRadarChartData,
  buildSaveHasilTesPayload,
  buildSaveSetupPayload,
  buildVisualisasiInsights,
  getPkStatusLabel,
  mapAspekFromApi,
  type AspekUi,
  type ItemTesUi,
  type PerformanceDirUi,
} from "@/app/lib/pk-mappers";
import { ErrorState } from "../ui/error-state";
import { EmptyState } from "../ui/empty-state";
import { SportsAvatar } from "../ui/sports-avatar";
import { parseApiError } from "@/hooks/use-api-error";
import { filterNumericTestInput, pesertaInitials, resolvePesertaAvatar } from "@/app/lib/peserta-utils";
import { usePemeriksaanAccess } from "@/hooks/use-pemeriksaan-access";
import { PkVisualisasiSkeleton } from "./pk-visualisasi-skeleton";

type Step = 0 | 1 | 2 | 3;

const STEPS = [
  { label: "Info", icon: Info },
  { label: "Setup", icon: Settings },
  { label: "Input Hasil", icon: ClipboardList },
  { label: "Visualisasi", icon: BarChart2 },
];

interface AssessmentDetailScreenProps {
  assessment: Assessment;
  onBack: () => void;
  viewOnly?: boolean;
}

export const AssessmentDetailScreen: React.FC<AssessmentDetailScreenProps> = ({
  assessment,
  onBack,
  viewOnly = false,
}) => {
  const { biodataId } = usePemeriksaanAccess();
  const [step, setStep] = React.useState<Step>(viewOnly ? 3 : 0);
  const pkId = assessment.id;

  const setupQuery = usePkSetup(pkId);
  const saveSetupMutation = useSavePkSetup(pkId);
  const cloneMutation = useClonePkTemplate(pkId);

  const [aspek, setAspek] = React.useState<AspekUi[]>([]);
  const setupSynced = React.useRef(false);

  React.useEffect(() => {
    if (setupQuery.data?.aspek && !setupSynced.current) {
      setAspek(mapAspekFromApi(setupQuery.data.aspek));
      setupSynced.current = true;
    }
  }, [setupQuery.data]);

  React.useEffect(() => {
    setupSynced.current = false;
  }, [pkId]);

  const handleCloneTemplate = async () => {
    try {
      await cloneMutation.mutateAsync({
        pemeriksaan_khusus_id: Number(pkId),
        cabor_id: assessment.cabor_id,
      });
      toast.success("Template berhasil di-clone");
      const refreshed = await setupQuery.refetch();
      if (refreshed.data?.aspek) {
        setAspek(mapAspekFromApi(refreshed.data.aspek));
      }
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleSaveSetup = async () => {
    if (aspek.length === 0) {
      toast.error("Tambahkan minimal satu aspek");
      return false;
    }
    try {
      await saveSetupMutation.mutateAsync(buildSaveSetupPayload(Number(pkId), aspek));
      toast.success("Setup berhasil disimpan");
      return true;
    } catch (error) {
      toast.error(parseApiError(error).message);
      return false;
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      const ok = await handleSaveSetup();
      if (!ok) return;
    }
    setStep((s) => Math.min(3, s + 1) as Step);
  };

  return (
    <div className="bg-background pb-tab-bar">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Pemeriksaan Fisik</p>
            <h1 className="text-base font-bold truncate">{assessment.nama}</h1>
          </div>
        </div>

        {!viewOnly && (
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === i;
              const isDone = step > i;
              return (
                <React.Fragment key={i}>
                  <button onClick={() => setStep(i as Step)} className="flex flex-col items-center gap-1 flex-1">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                      isDone ? "bg-success text-white" : isActive ? "bg-primary text-white" : "bg-surface-2 text-muted-foreground"
                    )}>
                      {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>
                    <span className={cn("text-[10px] font-medium leading-tight text-center",
                      isActive ? "text-primary" : isDone ? "text-success" : "text-muted-foreground")}>{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mb-4 mx-1", step > i ? "bg-success" : "bg-border")} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {!viewOnly && step === 0 && <StepInfo assessment={assessment} jumlahAspek={aspek.length || setupQuery.data?.aspek.length || 0} />}
      {!viewOnly && step === 1 && (
        <StepSetup
          aspek={aspek}
          setAspek={setAspek}
          loading={setupQuery.isLoading}
          saving={saveSetupMutation.isPending || cloneMutation.isPending}
          onClone={handleCloneTemplate}
          onSave={handleSaveSetup}
          error={setupQuery.error ? parseApiError(setupQuery.error).message : undefined}
          onRetry={() => setupQuery.refetch()}
        />
      )}
      {!viewOnly && step === 2 && <StepInputHasil pkId={pkId} />}
      {step === 3 && <StepVisualisasi pkId={pkId} viewOnly={viewOnly} biodataId={biodataId} />}

      <div className="px-4 py-3 flex gap-3 border-t border-border">
        {viewOnly ? (
          <Button className="flex-1 rounded-button h-11" onClick={onBack}>Kembali</Button>
        ) : (
          <>
            <Button variant="outline" className="flex-1 rounded-button h-11" onClick={() => setStep((s) => Math.max(0, s - 1) as Step)} disabled={step === 0}>
              Sebelumnya
            </Button>
            {step < 3 ? (
              <Button className="flex-1 rounded-button h-11" onClick={handleNext} disabled={saveSetupMutation.isPending}>
                {saveSetupMutation.isPending ? "Menyimpan..." : "Selanjutnya"} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button className="flex-1 rounded-button h-11" onClick={onBack}>Selesai</Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const StepInfo: React.FC<{ assessment: Assessment; jumlahAspek: number }> = ({ assessment, jumlahAspek }) => (
  <div className="px-4 pt-4 space-y-4">
    <Card className="p-4 border border-border bg-surface shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-sm font-bold shrink-0">
          {assessment.cabor_icon}
        </div>
        <div>
          <h2 className="font-bold text-foreground">{assessment.nama}</h2>
          <p className="text-sm text-muted-foreground">{assessment.cabor} · {assessment.cabor_kategori}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(assessment.tanggal, "d MMMM yyyy", { locale: idLocale })}
          </p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        {[
          { label: "Status", value: getPkStatusLabel(assessment.status) },
          { label: "Jumlah Peserta", value: `${assessment.jumlah_peserta} peserta` },
          { label: "Atlet", value: String(assessment.jumlah_atlet) },
          { label: "Aspek Tes", value: `${jumlahAspek} aspek` },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-semibold text-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const StepSetup: React.FC<{
  aspek: AspekUi[];
  setAspek: React.Dispatch<React.SetStateAction<AspekUi[]>>;
  loading: boolean;
  saving: boolean;
  onClone: () => void;
  onSave: () => Promise<boolean>;
  error?: string;
  onRetry: () => void;
}> = ({ aspek, setAspek, loading, saving, onClone, onSave, error, onRetry }) => {
  const toggleAspek = (id: string) =>
    setAspek((a) => a.map((x) => x.id === id ? { ...x, expanded: !x.expanded } : x));

  const addAspek = () =>
    setAspek((a) => [...a, { id: `asp-${Date.now()}`, nama: "Aspek Baru", expanded: true, items: [] }]);

  const deleteAspek = (id: string) => setAspek((a) => a.filter((x) => x.id !== id));
  const updateAspekName = (id: string, nama: string) =>
    setAspek((a) => a.map((x) => x.id === id ? { ...x, nama } : x));

  const addItem = (aspekId: string) =>
    setAspek((a) => a.map((x) => x.id === aspekId ? {
      ...x, items: [...x.items, { id: `i${Date.now()}`, nama: "", satuan: "", target_l: "", target_p: "", arah: "higher" as PerformanceDirUi }],
    } : x));

  const updateItem = (aspekId: string, itemId: string, field: keyof ItemTesUi, value: string) =>
    setAspek((a) => a.map((asp) => asp.id === aspekId ? {
      ...asp, items: asp.items.map((it) => it.id === itemId ? { ...it, [field]: value } : it),
    } : asp));

  const deleteItem = (aspekId: string, itemId: string) =>
    setAspek((a) => a.map((asp) => asp.id === aspekId ? { ...asp, items: asp.items.filter((it) => it.id !== itemId) } : asp));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Memuat setup...</p>
      </div>
    );
  }

  if (error) {
    return <div className="px-4 pt-4"><ErrorState message={error} onRetry={onRetry} /></div>;
  }

  return (
    <div className="px-4 pt-4 space-y-3">
      <button
        onClick={onClone}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-surface-2 text-foreground font-medium text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
      >
        <Zap className="h-4 w-4" />
        {saving ? "Memproses..." : "Clone dari Template Cabor"}
      </button>

      {aspek.length === 0 ? (
        <EmptyState icon={Settings} title="Belum ada setup" description="Clone template cabor atau tambah aspek manual." />
      ) : (
        aspek.map((a) => (
          <Card key={a.id} className="border border-border overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-2 border-b border-border">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={a.nama}
                onChange={(e) => updateAspekName(a.id, e.target.value)}
                className="flex-1 h-8 text-sm font-semibold border-0 bg-transparent p-0 focus-visible:ring-0"
              />
              <span className="text-xs text-muted-foreground shrink-0">{a.items.length} item</span>
              <button onClick={() => deleteAspek(a.id)} className="text-destructive/60 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
              <button onClick={() => toggleAspek(a.id)} className="shrink-0">
                {a.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
            {a.expanded && (
              <div className="divide-y divide-border">
                {a.items.map((item) => (
                  <div key={item.id} className="px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Nama item tes" value={item.nama} onChange={(e) => updateItem(a.id, item.id, "nama", e.target.value)} className="h-8 text-xs rounded-xl bg-surface-2" />
                      <Input placeholder="Satuan" value={item.satuan} onChange={(e) => updateItem(a.id, item.id, "satuan", e.target.value)} className="h-8 text-xs rounded-xl bg-surface-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Target L" value={item.target_l} onChange={(e) => updateItem(a.id, item.id, "target_l", e.target.value)} className="h-8 text-xs rounded-xl bg-surface-2" />
                      <Input placeholder="Target P" value={item.target_p} onChange={(e) => updateItem(a.id, item.id, "target_p", e.target.value)} className="h-8 text-xs rounded-xl bg-surface-2" />
                    </div>
                    <div className="flex rounded-xl overflow-hidden border border-border">
                      {(["higher", "lower"] as const).map((opt) => {
                        const sel = item.arah === opt;
                        const Icon = opt === "higher" ? ArrowUp : ArrowDown;
                        return (
                          <button key={opt} onClick={() => updateItem(a.id, item.id, "arah", opt)}
                            className={cn("flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium",
                              sel ? "bg-primary text-white" : "bg-surface text-muted-foreground")}>
                            <Icon className="h-3 w-3" />{opt === "higher" ? "↑ Tinggi" : "↓ Rendah"}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => deleteItem(a.id, item.id)} className="text-xs text-destructive/70 flex items-center gap-1">
                      <Trash2 className="h-3 w-3" /> Hapus item
                    </button>
                  </div>
                ))}
                <div className="px-4 py-3">
                  <button onClick={() => addItem(a.id)} className="w-full py-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Tambah Item Tes
                  </button>
                </div>
              </div>
            )}
          </Card>
        ))
      )}

      <button onClick={addAspek} className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Plus className="h-4 w-4" /> Tambah Aspek
      </button>

      <Button className="w-full rounded-button h-11" onClick={() => onSave()} disabled={saving}>
        {saving ? "Menyimpan..." : "Simpan Setup"}
      </Button>
    </div>
  );
};

const StepInputHasil: React.FC<{ pkId: string }> = ({ pkId }) => {
  const pesertaQuery = usePkPesertaHasilTes(pkId);
  const hasilQuery = usePkHasilTes(pkId);
  const saveMutation = useSavePkHasilTes(pkId);

  const pesertaList = pesertaQuery.data?.peserta ?? [];
  const hasilMap = React.useMemo(() => {
    const map = new Map<number, boolean>();
    (hasilQuery.data?.data ?? []).forEach((h) => {
      const hasNilai = h.item_tes.some((it) => it.nilai);
      map.set(h.peserta_id, hasNilai);
    });
    return map;
  }, [hasilQuery.data]);

  const [selectedPId, setSelectedPId] = React.useState<number>(0);
  React.useEffect(() => {
    if (pesertaList.length > 0 && selectedPId === 0) {
      setSelectedPId(pesertaList[0].id);
    }
  }, [pesertaList, selectedPId]);

  const setupPesertaQuery = usePkSetupPeserta(pkId, selectedPId);
  const [values, setValues] = React.useState<Record<number, string>>({});

  React.useEffect(() => {
    if (!setupPesertaQuery.data) return;
    const next: Record<number, string> = {};
    setupPesertaQuery.data.aspek.forEach((a) => {
      a.item_tes.forEach((item) => {
        if (item.id && item.nilai) next[item.id] = item.nilai;
      });
    });
    setValues(next);
  }, [setupPesertaQuery.data, selectedPId]);

  const completedCount = pesertaList.filter((p) => hasilMap.get(p.id)).length;
  const progressPct = pesertaList.length > 0 ? Math.round((completedCount / pesertaList.length) * 100) : 0;

  const handleSave = async () => {
    if (!selectedPId || !setupPesertaQuery.data) return;
    const items = setupPesertaQuery.data.aspek.flatMap((a) =>
      a.item_tes.map((item) => ({ itemTesId: item.id, nilai: values[item.id] ?? "" }))
    );
    try {
      await saveMutation.mutateAsync(buildSaveHasilTesPayload(Number(pkId), selectedPId, items));
      toast.success("Hasil berhasil disimpan");
      hasilQuery.refetch();
      setupPesertaQuery.refetch();
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  if (pesertaQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Memuat peserta...</p>
      </div>
    );
  }

  if (pesertaList.length === 0) {
    return (
      <div className="px-4 pt-4">
        <EmptyState icon={ClipboardList} title="Belum ada peserta" description="Peserta otomatis ditambahkan saat assessment dibuat." />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 space-y-4">
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{completedCount} dari {pesertaList.length} peserta selesai</span>
          <span className="font-semibold text-foreground">{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {pesertaList.map((p) => (
          <button key={p.id} onClick={() => setSelectedPId(p.id)}
            className={cn("flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-colors shrink-0",
              selectedPId === p.id ? "border-primary bg-primary/10" : "border-border bg-surface")}>
            <SportsAvatar
              src={resolvePesertaAvatar(p)}
              alt={p.nama}
              fallback={pesertaInitials(p.nama)}
              size="md"
            />
            <p className={cn("text-[10px] font-medium max-w-[4rem] truncate", selectedPId === p.id ? "text-primary" : "text-muted-foreground")}>
              {p.nama.split(" ")[0]}
            </p>
            {hasilMap.get(p.id) && <CheckCircle className="h-3 w-3 text-success" />}
          </button>
        ))}
      </div>

      {setupPesertaQuery.isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        setupPesertaQuery.data?.aspek.map((a) => (
          <Card key={a.id} className="border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-surface-2 border-b border-border">
              <p className="text-sm font-bold text-foreground">{a.nama}</p>
            </div>
            <div className="px-4 py-3 space-y-3">
              {a.item_tes.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">{item.nama}</label>
                    <span className="text-[10px] text-muted-foreground">Target: {item.target ?? "-"} {item.satuan}</span>
                  </div>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder={`Nilai (${item.satuan})`}
                    value={values[item.id] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [item.id]: filterNumericTestInput(e.target.value) }))}
                    className="h-9 rounded-xl bg-surface-2 border-border text-sm"
                  />
                  {item.predikat_label && (
                    <p className="text-[10px] text-muted-foreground">Predikat: {item.predikat_label}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))
      )}

      <button onClick={handleSave} disabled={saveMutation.isPending}
        className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60">
        {saveMutation.isPending ? "Menyimpan..." : "Simpan Hasil"}
      </button>
    </div>
  );
};

const StepVisualisasi: React.FC<{ pkId: string; viewOnly?: boolean; biodataId?: number }> = ({
  pkId,
  viewOnly = false,
  biodataId,
}) => {
  const pesertaQuery = usePkPesertaVisualisasi(pkId);
  const allPeserta = pesertaQuery.data ?? [];
  const pesertaList = React.useMemo(() => {
    if (!viewOnly || biodataId == null) return allPeserta;
    return allPeserta.filter((p) => p.peserta.id === biodataId);
  }, [allPeserta, biodataId, viewOnly]);

  const [selectedPId, setSelectedPId] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (pesertaList.length === 0) return;
    if (viewOnly) {
      setSelectedPId(pesertaList[0].peserta_id);
      return;
    }
    if (selectedPId === 0) {
      setSelectedPId(pesertaList[0].peserta_id);
    }
  }, [pesertaList, selectedPId, viewOnly]);

  const visualisasiQuery = usePkVisualisasi(pkId, selectedPId);
  const filtered = pesertaList.filter((p) =>
    !search || p.peserta.nama.toLowerCase().includes(search.toLowerCase())
  );

  const radarData = visualisasiQuery.data ? buildRadarChartData(visualisasiQuery.data) : [];
  const barData = visualisasiQuery.data ? buildBarChartData(visualisasiQuery.data) : [];
  const insights = visualisasiQuery.data ? buildVisualisasiInsights(visualisasiQuery.data) : null;

  const ranking = viewOnly
    ? []
    : [...pesertaList]
        .filter((p) => p.nilai_keseluruhan != null)
        .sort((a, b) => (b.nilai_keseluruhan ?? 0) - (a.nilai_keseluruhan ?? 0));

  const isChartLoading = selectedPId === 0 || visualisasiQuery.isLoading;

  if (pesertaQuery.isLoading) {
    return <PkVisualisasiSkeleton viewOnly={viewOnly} />;
  }

  if (pesertaList.length === 0) {
    return (
      <div className="px-4 pt-4">
        <EmptyState icon={BarChart2} title="Belum ada data visualisasi" description={viewOnly ? "Hasil pemeriksaan fisik Anda belum tersedia." : "Input hasil tes atlet terlebih dahulu."} />
      </div>
    );
  }

  const selected = pesertaList.find((p) => p.peserta_id === selectedPId);

  return (
    <div className="px-4 pt-4 space-y-4">
      {!viewOnly && (
        <Card className="p-4 border border-border bg-surface shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Pilih Atlet</p>
          <Input placeholder="Cari peserta..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="mb-3 h-9 text-sm rounded-xl bg-surface-2 border-0" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filtered.map((p) => (
              <button key={p.peserta_id} onClick={() => setSelectedPId(p.peserta_id)}
                className={cn("flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all shrink-0",
                  selectedPId === p.peserta_id ? "border-primary bg-primary/10" : "border-border bg-surface-2")}>
                <SportsAvatar
                  src={resolvePesertaAvatar(p.peserta)}
                  alt={p.peserta.nama}
                  fallback={pesertaInitials(p.peserta.nama)}
                  size="md"
                />
                <p className="text-[10px] font-medium text-foreground max-w-[4rem] truncate">{p.peserta.nama.split(" ")[0]}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {selected && (
        <Card className="p-4 border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-4">
            <SportsAvatar
              src={resolvePesertaAvatar(selected.peserta)}
              alt={selected.peserta.nama}
              fallback={pesertaInitials(selected.peserta.nama)}
              size="xl"
              className="shrink-0"
            />
            <div>
              <h3 className="font-bold text-foreground">{selected.peserta.nama}</h3>
              <p className="text-sm text-muted-foreground">{selected.peserta.posisi} · {selected.peserta.cabor}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-foreground">{selected.nilai_keseluruhan?.toFixed(1) ?? "-"}</span>
                <span className="text-xs text-muted-foreground">{selected.predikat_keseluruhan_label ?? ""}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {isChartLoading ? (
        <PkVisualisasiSkeleton variant="charts" />
      ) : visualisasiQuery.data && radarData.length > 0 ? (
        <>
          <Card className="p-4 border border-border bg-surface shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">Radar Performa</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="aspek" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Radar dataKey="nilai" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} strokeWidth={2} />
                <Radar dataKey="target" stroke="var(--color-accent-2)" fill="var(--color-accent-2)" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">Skor per Aspek</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="opacity-30" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="aspek" tick={{ fontSize: 11 }} width={72} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: 12 }} />
                <Bar dataKey="target" fill="var(--color-accent-2)" fillOpacity={0.3} radius={[0, 4, 4, 0]} barSize={8} />
                <Bar dataKey="nilai" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {insights && (
            <div className="grid grid-cols-2 gap-3">
              {[
                insights.best && { label: "Terbaik", value: insights.best.nama, sub: `${insights.best.nilai_performa?.toFixed(1)}%`, color: "text-success", bg: "bg-success/10" },
                insights.worst && { label: "Perlu Ditingkatkan", value: insights.worst.nama, sub: `${insights.worst.nilai_performa?.toFixed(1)}%`, color: "text-destructive", bg: "bg-destructive/10" },
                { label: "Rata-rata Aspek", value: insights.average.toFixed(1), sub: "persentase performa", color: "text-primary", bg: "bg-primary/10" },
                { label: "Nilai Keseluruhan", value: insights.overall.toFixed(1), sub: "skor total", color: "text-accent", bg: "bg-accent/10" },
              ].filter(Boolean).map((ins) => ins && (
                <Card key={ins.label} className={cn("p-3 border border-border shadow-sm", ins.bg)}>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">{ins.label}</p>
                  <p className={cn("text-base font-bold leading-tight", ins.color)}>{ins.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{ins.sub}</p>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : null}

      {ranking.length > 0 && (
        <Card className="p-4 border border-border bg-surface shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-3">Ranking Peserta</h3>
          <div className="space-y-2">
            {ranking.map((p, i) => (
              <div key={p.peserta_id} className="flex items-center gap-3 py-1">
                <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                <SportsAvatar
                  src={resolvePesertaAvatar(p.peserta)}
                  alt={p.peserta.nama}
                  fallback={pesertaInitials(p.peserta.nama)}
                  size="sm"
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.peserta.nama}</p>
                </div>
                <p className="text-sm font-bold text-foreground">{p.nilai_keseluruhan?.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
