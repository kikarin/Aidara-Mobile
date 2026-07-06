import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  CheckCircle, Loader2, Users,
} from "lucide-react";
import { cn } from "../ui/utils";
import { toast } from "sonner";
import type { Pemeriksaan } from "@/app/lib/pemeriksaan-mappers";
import {
  buildBulkUpdateEntry,
  getParticipantCompletionStatus,
  getParticipantParameterFields,
  mapPesertaTypeToRole,
  mapRoleToJenisPeserta,
  mapTrendFromApi,
  type ParticipantRole,
  type TrendUi,
} from "@/app/lib/pemeriksaan-mappers";
import { useBulkUpdatePesertaParameter, usePemeriksaanPeserta } from "@/hooks/use-pemeriksaan";
import { ErrorState } from "../ui/error-state";
import { EmptyState } from "../ui/empty-state";
import { SportsAvatar } from "../ui/sports-avatar";
import { parseApiError } from "@/hooks/use-api-error";
import { filterNumericTestInput, pesertaInitials, resolvePesertaAvatar } from "@/app/lib/peserta-utils";
import type { PemeriksaanPesertaApiItem } from "@/api/pemeriksaan-types";
import { usePemeriksaanAccess } from "@/hooks/use-pemeriksaan-access";

const TREND_OPTIONS: { value: Exclude<TrendUi, "">; label: string; icon: React.FC<any>; color: string; bg: string }[] = [
  { value: "naik",   label: "Naik",   icon: TrendingUp,   color: "text-success",          bg: "bg-success/10 border-success" },
  { value: "stabil", label: "Stabil", icon: Minus,        color: "text-muted-foreground", bg: "bg-muted border-muted-foreground/30" },
  { value: "turun",  label: "Turun",  icon: TrendingDown, color: "text-destructive",      bg: "bg-destructive/10 border-destructive" },
];

const ROLE_TABS: { value: ParticipantRole | "semua"; label: string }[] = [
  { value: "semua",             label: "Semua" },
  { value: "atlet",             label: "Atlet" },
  { value: "pelatih",           label: "Pelatih" },
  { value: "tenaga-pendukung",  label: "Tendik" },
];

type ParamValues = Record<number, { nilai: string; trend: TrendUi }>;
type ParticipantValues = Record<number, { params: ParamValues; catatan: string }>;

function initValuesFromPeserta(peserta: PemeriksaanPesertaApiItem[]): ParticipantValues {
  const result: ParticipantValues = {};
  peserta.forEach((p) => {
    const params: ParamValues = {};
    p.parameters.forEach((param) => {
      params[param.parameter_id] = {
        nilai: param.nilai ?? "",
        trend: mapTrendFromApi(param.trend),
      };
    });
    result[p.id] = { params, catatan: p.catatan_umum ?? "" };
  });
  return result;
}

interface InputNilaiScreenProps {
  pemeriksaan: Pemeriksaan;
  onBack: () => void;
}

export const InputNilaiScreen: React.FC<InputNilaiScreenProps> = ({ pemeriksaan, onBack }) => {
  const { isViewOnly, biodataId } = usePemeriksaanAccess();
  const [activeRole, setActiveRole] = React.useState<ParticipantRole | "semua">("semua");
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  const jenisFilter = isViewOnly ? "atlet" : mapRoleToJenisPeserta(activeRole);
  const pesertaQuery = usePemeriksaanPeserta(pemeriksaan.id, jenisFilter);
  const bulkMutation = useBulkUpdatePesertaParameter(pemeriksaan.id, jenisFilter);

  const apiPeserta = pesertaQuery.data?.peserta ?? [];
  const parameters = pesertaQuery.data?.parameters ?? [];

  const visiblePeserta = React.useMemo(() => {
    if (!isViewOnly || biodataId == null) return apiPeserta;
    return apiPeserta.filter((p) => p.peserta?.id === biodataId);
  }, [apiPeserta, biodataId, isViewOnly]);

  React.useEffect(() => {
    if (isViewOnly && visiblePeserta.length > 0) {
      setExpandedId(visiblePeserta[0].id);
    }
  }, [isViewOnly, visiblePeserta]);

  const [values, setValues] = React.useState<ParticipantValues>({});

  React.useEffect(() => {
    if (apiPeserta.length > 0) {
      setValues(initValuesFromPeserta(apiPeserta));
    }
  }, [apiPeserta]);

  const getParamVal = (pesertaId: number, paramId: number) =>
    values[pesertaId]?.params[paramId] ?? { nilai: "", trend: "" as TrendUi };

  const setParamVal = (pesertaId: number, paramId: number, field: "nilai" | "trend", v: string) =>
    setValues((prev) => ({
      ...prev,
      [pesertaId]: {
        ...prev[pesertaId],
        params: {
          ...prev[pesertaId]?.params,
          [paramId]: { ...getParamVal(pesertaId, paramId), [field]: v },
        },
        catatan: prev[pesertaId]?.catatan ?? "",
      },
    }));

  const setCatatan = (pesertaId: number, catatan: string) =>
    setValues((prev) => ({
      ...prev,
      [pesertaId]: { ...prev[pesertaId], catatan, params: prev[pesertaId]?.params ?? {} },
    }));

  const getCompletionStatus = (peserta: PemeriksaanPesertaApiItem) => {
    const paramVals = getParticipantParameterFields(peserta, parameters).map((p) => ({
      nilai: getParamVal(peserta.id, p.parameter_id).nilai,
    }));
    return getParticipantCompletionStatus(paramVals);
  };

  const completedCount = visiblePeserta.filter((p) => getCompletionStatus(p) === "selesai").length;
  const progressPct = visiblePeserta.length > 0 ? Math.round((completedCount / visiblePeserta.length) * 100) : 0;

  const handleSaveOne = async (peserta: PemeriksaanPesertaApiItem) => {
    try {
      const entry = buildBulkUpdateEntry(
        peserta,
        values[peserta.id]?.params ?? {},
        peserta.ref_status_pemeriksaan_id ?? undefined,
        values[peserta.id]?.catatan
      );
      await bulkMutation.mutateAsync({ data: [entry] });
      await pesertaQuery.refetch();
      toast.success(`Nilai ${peserta.peserta.nama} disimpan`);
      setExpandedId(null);
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleSaveAll = async () => {
    if (apiPeserta.length === 0) return;
    try {
      const data = apiPeserta.map((p) =>
        buildBulkUpdateEntry(
          p,
          values[p.id]?.params ?? {},
          p.ref_status_pemeriksaan_id ?? undefined,
          values[p.id]?.catatan
        )
      );
      await bulkMutation.mutateAsync({ data });
      await pesertaQuery.refetch();
      toast.success("Semua nilai berhasil disimpan");
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const roleColor: Record<ParticipantRole, string> = {
    atlet: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    pelatih: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "tenaga-pendukung": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };

  const statusColor = {
    belum: "bg-muted text-muted-foreground",
    sebagian: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    selesai: "bg-success/10 text-success",
  };

  const error = pesertaQuery.error ? parseApiError(pesertaQuery.error) : null;

  if (pesertaQuery.isLoading) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Memuat data peserta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-4">
        <ErrorState message={error.message} onRetry={() => pesertaQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-background pb-tab-bar">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">{isViewOnly ? "Nilai Saya" : "Input Nilai Peserta"}</h1>
            <p className="text-xs text-muted-foreground truncate">{pemeriksaan.nama}</p>
          </div>
        </div>

        {!isViewOnly && (
          <>
            <div className="px-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{completedCount} dari {visiblePeserta.length} peserta selesai</span>
                <span className="font-semibold text-foreground">{progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {ROLE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setActiveRole(tab.value); setExpandedId(null); }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors border",
                    activeRole === tab.value ? "bg-primary text-white border-primary" : "bg-surface border-border text-muted-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-4 pt-4 space-y-3">
        {visiblePeserta.length === 0 ? (
          <EmptyState
            icon={Users}
            title={isViewOnly ? "Belum ada nilai" : "Belum ada peserta"}
            description={isViewOnly ? "Nilai pemeriksaan Anda belum tersedia." : "Tambahkan peserta pemeriksaan terlebih dahulu melalui web admin."}
          />
        ) : (
          visiblePeserta.map((participant) => {
            const role = mapPesertaTypeToRole(participant.peserta_type);
            const status = getCompletionStatus(participant);
            const isExpanded = isViewOnly || expandedId === participant.id;
            const nama = participant.peserta.nama;
            const jk = participant.peserta.jenis_kelamin;
            const usia = participant.peserta.usia;

            return (
              <Card key={participant.id} className="border border-border overflow-hidden shadow-sm">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => !isViewOnly && setExpandedId(isExpanded ? null : participant.id)}
                  disabled={isViewOnly}
                >
                  <SportsAvatar
                    src={resolvePesertaAvatar(participant.peserta)}
                    alt={nama}
                    fallback={pesertaInitials(nama)}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{nama}</p>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", roleColor[role])}>
                        {role === "tenaga-pendukung" ? "tendik" : role}
                      </span>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", statusColor[status])}>
                        {status === "selesai" ? "✓ Selesai" : status === "sebagian" ? "Sebagian" : "Belum"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {usia != null ? `${usia} th` : "-"} · {jk === "L" ? "Laki-laki" : jk === "P" ? "Perempuan" : "-"}
                    </p>
                  </div>
                  {isViewOnly ? null : isExpanded
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border bg-surface-2 px-4 py-3 space-y-4">
                    {getParticipantParameterFields(participant, parameters).map((param) => {
                      const paramId = param.parameter_id;
                      const paramNama = param.nama_parameter;
                      const satuan = param.satuan;
                      const pv = getParamVal(participant.id, paramId);

                      return (
                        <div key={paramId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-foreground">{paramNama}</label>
                            <span className="text-[10px] font-mono text-muted-foreground bg-surface px-1.5 py-0.5 rounded">
                              {satuan}
                            </span>
                          </div>
                          {isViewOnly ? (
                            <div className="rounded-xl bg-surface border border-border px-3 py-2 text-sm font-semibold text-foreground">
                              {pv.nilai || "-"}
                            </div>
                          ) : (
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder={`Nilai (${satuan})`}
                              value={pv.nilai}
                              onChange={(e) => setParamVal(participant.id, paramId, "nilai", filterNumericTestInput(e.target.value))}
                              className="rounded-xl bg-surface border-border text-sm h-9"
                            />
                          )}
                          <div className="flex gap-2">
                            {TREND_OPTIONS.map((t) => {
                              const Icon = t.icon;
                              const selected = pv.trend === t.value;
                              if (isViewOnly) {
                                if (!selected) return null;
                                return (
                                  <span
                                    key={t.value}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium",
                                      t.bg
                                    )}
                                  >
                                    <Icon className={cn("h-3.5 w-3.5", t.color)} />
                                    {t.label}
                                  </span>
                                );
                              }
                              return (
                                <button
                                  key={t.value}
                                  onClick={() => setParamVal(participant.id, paramId, "trend", selected ? "" : t.value)}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-colors",
                                    selected ? t.bg : "bg-surface border-border text-muted-foreground"
                                  )}
                                >
                                  <Icon className={cn("h-3.5 w-3.5", selected ? t.color : "")} />
                                  {t.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {(values[participant.id]?.catatan || !isViewOnly) && (
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1.5">
                          Catatan <span className="text-[10px] font-mono text-muted-foreground ml-1">catatan</span>
                        </label>
                        {isViewOnly ? (
                          <p className="text-sm text-muted-foreground">{values[participant.id]?.catatan || "-"}</p>
                        ) : (
                          <Textarea
                            placeholder="Tambahkan catatan untuk peserta ini..."
                            rows={2}
                            value={values[participant.id]?.catatan ?? ""}
                            onChange={(e) => setCatatan(participant.id, e.target.value)}
                            className="rounded-xl bg-surface border-border text-sm resize-none"
                          />
                        )}
                      </div>
                    )}

                    {!isViewOnly && (
                      <button
                        onClick={() => handleSaveOne(participant)}
                        disabled={bulkMutation.isPending}
                        className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {bulkMutation.isPending ? "Menyimpan..." : "Simpan Nilai"}
                      </button>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}

        {!isViewOnly && visiblePeserta.length > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={bulkMutation.isPending}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60 mt-2"
          >
            {bulkMutation.isPending ? "Menyimpan..." : "Simpan Semua"}
          </button>
        )}
      </div>
    </div>
  );
};
