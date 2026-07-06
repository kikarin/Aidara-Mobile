import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DateInput } from "../ui/date-input";
import { Textarea } from "../ui/textarea";
import { ArrowLeft, ChevronDown, Clock } from "lucide-react";
import { cn } from "../ui/utils";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  useCreateProgramLatihan,
  useProgramFilterCabor,
  useProgramFilterKategori,
  useProgramFilterPelatih,
  useUpdateProgramLatihan,
} from "@/hooks/use-program-latihan";
import {
  mapProgramLatihanItem,
  mapTahapToApi,
  type ProgramLatihan,
  type TahapProgram,
} from "@/app/lib/program-mappers";
import { parseApiError } from "@/hooks/use-api-error";

const TAHAP_OPTIONS: { value: TahapProgram; label: string; desc: string; color: string; bg: string; border: string }[] = [
  {
    value: "persiapan-umum",
    label: "Persiapan Umum",
    desc: "Membangun fondasi fisik dan teknik dasar",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-400",
  },
  {
    value: "persiapan-khusus",
    label: "Persiapan Khusus",
    desc: "Latihan spesifik sesuai kebutuhan kompetisi",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-400",
  },
  {
    value: "pra-pertandingan",
    label: "Pra Pertandingan",
    desc: "Pemantapan dan simulasi kondisi pertandingan",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-400",
  },
  {
    value: "pertandingan",
    label: "Pertandingan",
    desc: "Periode kompetisi aktif",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-400",
  },
  {
    value: "transisi",
    label: "Transisi",
    desc: "Pemulihan dan evaluasi pasca kompetisi",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-400",
  },
];

interface ProgramFormScreenProps {
  onBack: () => void;
  onSaved: (program: ProgramLatihan) => void;
  editProgram?: ProgramLatihan;
}

export const ProgramFormScreen: React.FC<ProgramFormScreenProps> = ({
  onBack,
  onSaved,
  editProgram,
}) => {
  const isEdit = !!editProgram;
  const [caborOpen, setCaborOpen] = React.useState(false);
  const [kategoriOpen, setKategoriOpen] = React.useState(false);
  const [pelatihOpen, setPelatihOpen] = React.useState(false);

  const caborQuery = useProgramFilterCabor();
  const createMutation = useCreateProgramLatihan();
  const updateMutation = useUpdateProgramLatihan();

  const [form, setForm] = React.useState({
    cabor_id: editProgram?.cabor_id ?? 0,
    cabor_kategori_id: editProgram?.cabor_kategori_id ?? 0,
    mode_pelatih: (editProgram?.mode_pelatih ?? "single") as "single" | "multiple",
    pelatih_ids: editProgram?.pelatih_ids ?? (editProgram?.pelatih_id ? [editProgram.pelatih_id] : []),
    wajib_absen_atlet: editProgram?.wajib_absen_atlet ?? false,
    absen_jam_mulai: editProgram?.absen_jam_mulai ?? "",
    absen_jam_selesai: editProgram?.absen_jam_selesai ?? "",
    nama_program: editProgram?.nama_program ?? "",
    periode_mulai: editProgram ? editProgram.periode_mulai.toISOString().split("T")[0] : "",
    periode_selesai: editProgram ? editProgram.periode_selesai.toISOString().split("T")[0] : "",
    tahap: (editProgram?.tahap ?? "") as TahapProgram | "",
    keterangan: editProgram?.keterangan ?? "",
  });

  const kategoriQuery = useProgramFilterKategori(form.cabor_id || undefined);
  const pelatihQuery = useProgramFilterPelatih(
    form.cabor_kategori_id || undefined,
    form.cabor_id || undefined
  );
  const caborOptions = caborQuery.data ?? [];
  const kategoriOptions = kategoriQuery.data ?? [];
  const pelatihOptions = pelatihQuery.data ?? [];

  const selectedCaborName = caborOptions.find((c) => c.id === form.cabor_id)?.nama ?? "";
  const selectedKategoriName = kategoriOptions.find((k) => k.id === form.cabor_kategori_id)?.nama ?? "";
  const selectedPelatihNames = pelatihOptions
    .filter((p) => form.pelatih_ids.includes(p.id))
    .map((p) => p.nama)
    .join(", ");

  const durasi = React.useMemo(() => {
    if (!form.periode_mulai || !form.periode_selesai) return null;
    const diff = differenceInDays(new Date(form.periode_selesai), new Date(form.periode_mulai));
    return diff > 0 ? diff : null;
  }, [form.periode_mulai, form.periode_selesai]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const isValid =
    form.cabor_id > 0 &&
    form.cabor_kategori_id > 0 &&
    form.pelatih_ids.length > 0 &&
    form.nama_program &&
    form.periode_mulai &&
    form.periode_selesai &&
    form.tahap;

  const togglePelatih = (id: number) => {
    setForm((f) => {
      if (f.mode_pelatih === "single") {
        return { ...f, pelatih_ids: [id] };
      }
      const exists = f.pelatih_ids.includes(id);
      return {
        ...f,
        pelatih_ids: exists ? f.pelatih_ids.filter((item) => item !== id) : [...f.pelatih_ids, id],
      };
    });
    if (form.mode_pelatih === "single") {
      setPelatihOpen(false);
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!isValid) return;

    const payload = {
      cabor_id: form.cabor_id,
      cabor_kategori_id: form.cabor_kategori_id,
      mode_pelatih: form.mode_pelatih,
      pelatih_ids: form.pelatih_ids,
      pelatih_id: form.pelatih_ids[0],
      wajib_absen_atlet: form.wajib_absen_atlet,
      absen_jam_mulai: form.absen_jam_mulai || null,
      absen_jam_selesai: form.absen_jam_selesai || null,
      nama_program: form.nama_program,
      periode_mulai: form.periode_mulai,
      periode_selesai: form.periode_selesai,
      tahap: mapTahapToApi(form.tahap as TahapProgram),
      keterangan: form.keterangan || null,
    };

    try {
      const result = isEdit
        ? await updateMutation.mutateAsync({ id: Number(editProgram!.id), payload })
        : await createMutation.mutateAsync(payload);

      toast.success(isEdit ? "Program berhasil diperbarui" : "Program berhasil dibuat");
      onSaved(mapProgramLatihanItem(result, editProgram?.jumlah_rekap ?? 0));
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 pt-4 pb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base font-bold">{isEdit ? "Edit Program" : "Tambah Program"}</h1>
            <p className="text-xs text-muted-foreground">Program Latihan</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-6 pb-32">
        <section>
          <SectionHeader label="Informasi Program" />
          <div className="space-y-3">
            <FieldWrapper label="Cabang Olahraga" apiField="cabor_id" required>
              <button
                onClick={() => setCaborOpen(!caborOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors",
                  form.cabor_id ? "text-foreground border-border bg-input-background" : "text-muted-foreground border-border bg-input-background"
                )}
              >
                {selectedCaborName || "Pilih cabang olahraga"}
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", caborOpen && "rotate-180")} />
              </button>
              {caborOpen && (
                <div className="mt-1 rounded-xl border border-border bg-surface shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {caborOptions.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setForm((f) => ({ ...f, cabor_id: c.id, cabor_kategori_id: 0, pelatih_ids: [] }));
                        setCaborOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-sm transition-colors",
                        form.cabor_id === c.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-surface-2"
                      )}
                    >
                      {c.nama}
                    </button>
                  ))}
                </div>
              )}
            </FieldWrapper>

            <FieldWrapper label="Kategori" apiField="cabor_kategori_id" required>
              <button
                onClick={() => form.cabor_id && setKategoriOpen(!kategoriOpen)}
                disabled={!form.cabor_id}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors",
                  form.cabor_kategori_id ? "text-foreground border-border bg-input-background" : "text-muted-foreground border-border bg-input-background",
                  !form.cabor_id && "opacity-50 cursor-not-allowed"
                )}
              >
                {selectedKategoriName || (form.cabor_id ? "Pilih kategori" : "Pilih cabor terlebih dahulu")}
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", kategoriOpen && "rotate-180")} />
              </button>
              {kategoriOpen && (
                <div className="mt-1 rounded-xl border border-border bg-surface shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {kategoriOptions.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => {
                        setForm((f) => ({ ...f, cabor_kategori_id: k.id, pelatih_ids: [] }));
                        setKategoriOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-sm transition-colors",
                        form.cabor_kategori_id === k.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-surface-2"
                      )}
                    >
                      {k.nama}
                    </button>
                  ))}
                </div>
              )}
            </FieldWrapper>

            <FieldWrapper label="Mode Pelatih" apiField="mode_pelatih" required>
              <div className="grid grid-cols-2 gap-2">
                {(["single", "multiple"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        mode_pelatih: mode,
                        pelatih_ids: mode === "single" ? f.pelatih_ids.slice(0, 1) : f.pelatih_ids,
                      }))
                    }
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      form.mode_pelatih === mode
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-input-background text-muted-foreground"
                    )}
                  >
                    {mode === "single" ? "Satu pelatih" : "Lebih dari satu"}
                  </button>
                ))}
              </div>
            </FieldWrapper>

            <FieldWrapper
              label={form.mode_pelatih === "single" ? "Pelatih" : "Pelatih (bisa lebih dari satu)"}
              apiField="pelatih_ids"
              required
            >
              <button
                onClick={() => form.cabor_kategori_id && setPelatihOpen(!pelatihOpen)}
                disabled={!form.cabor_kategori_id}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors",
                  form.pelatih_ids.length ? "text-foreground border-border bg-input-background" : "text-muted-foreground border-border bg-input-background",
                  !form.cabor_kategori_id && "opacity-50 cursor-not-allowed"
                )}
              >
                {selectedPelatihNames || (form.cabor_kategori_id ? "Pilih pelatih" : "Pilih kategori terlebih dahulu")}
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", pelatihOpen && "rotate-180")} />
              </button>
              {pelatihOpen && (
                <div className="mt-1 rounded-xl border border-border bg-surface shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {pelatihOptions.length === 0 ? (
                    <p className="px-3 py-2.5 text-sm text-muted-foreground">Belum ada pelatih di kategori ini</p>
                  ) : (
                    pelatihOptions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePelatih(p.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between",
                          form.pelatih_ids.includes(p.id) ? "bg-primary/10 text-primary font-semibold" : "hover:bg-surface-2"
                        )}
                      >
                        <span>{p.nama}</span>
                        {form.pelatih_ids.includes(p.id) && <span>✓</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </FieldWrapper>

            <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.wajib_absen_atlet}
                onChange={(e) => setForm((f) => ({ ...f, wajib_absen_atlet: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-border"
              />
              <span>
                <span className="text-sm font-semibold block">Atlet wajib absen</span>
                <span className="text-xs text-muted-foreground">
                  Atlet harus absen harian dengan foto + GPS via aplikasi mobile
                </span>
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <FieldWrapper label="Jam Absen Mulai" apiField="absen_jam_mulai">
                <Input
                  type="time"
                  value={form.absen_jam_mulai}
                  onChange={set("absen_jam_mulai")}
                  className="rounded-xl bg-input-background border-border text-sm"
                />
              </FieldWrapper>
              <FieldWrapper label="Jam Absen Selesai" apiField="absen_jam_selesai">
                <Input
                  type="time"
                  value={form.absen_jam_selesai}
                  onChange={set("absen_jam_selesai")}
                  className="rounded-xl bg-input-background border-border text-sm"
                />
              </FieldWrapper>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Opsional. Batasi jam absen pelatih dan atlet jika diperlukan.
            </p>

            <FieldWrapper label="Nama Program" apiField="nama_program" required>
              <Input
                placeholder="Contoh: Program Renang PON 2025"
                value={form.nama_program}
                onChange={set("nama_program")}
                className="rounded-xl bg-input-background border-border text-sm"
              />
            </FieldWrapper>
          </div>
        </section>

        <section>
          <SectionHeader label="Periode Program" />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FieldWrapper label="Tanggal Mulai" apiField="periode_mulai" required>
                <DateInput
                  value={form.periode_mulai}
                  onChange={set("periode_mulai")}
                  className="rounded-xl text-sm"
                />
              </FieldWrapper>
              <FieldWrapper label="Tanggal Selesai" apiField="periode_selesai" required>
                <DateInput
                  value={form.periode_selesai}
                  onChange={set("periode_selesai")}
                  className="rounded-xl text-sm"
                />
              </FieldWrapper>
            </div>

            {durasi !== null && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="text-sm font-semibold">Durasi program: {durasi} hari</span>
              </div>
            )}
            {durasi !== null && durasi < 0 && (
              <p className="text-xs text-destructive">Tanggal selesai harus setelah tanggal mulai</p>
            )}
          </div>
        </section>

        <section>
          <SectionHeader label="Tahap Program" />
          <div className="space-y-2">
            {TAHAP_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm((f) => ({ ...f, tahap: t.value }))}
                className={cn(
                  "w-full text-left p-3 rounded-xl border-2 transition-all",
                  form.tahap === t.value
                    ? `${t.bg} ${t.border}`
                    : "bg-surface border-border hover:border-muted-foreground/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 transition-all shrink-0",
                    form.tahap === t.value ? `${t.border} bg-current` : "border-muted-foreground/40"
                  )} />
                  <div>
                    <p className={cn("text-sm font-semibold", form.tahap === t.value ? t.color : "text-foreground")}>
                      {t.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader label="Keterangan" />
          <FieldWrapper label="" apiField="keterangan">
            <Textarea
              placeholder="Tambahkan catatan atau deskripsi program latihan..."
              value={form.keterangan}
              onChange={set("keterangan")}
              rows={4}
              className="rounded-xl bg-input-background border-border text-sm resize-none"
            />
          </FieldWrapper>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border px-4 py-3 flex gap-3">
        <Button variant="outline" className="flex-1 rounded-button h-11" onClick={onBack}>
          Batal
        </Button>
        <Button
          className="flex-1 rounded-button h-11"
          disabled={!isValid || loading}
          onClick={handleSubmit}
        >
          {loading ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
        </Button>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-1 h-4 bg-primary rounded-full" />
    <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{label}</h2>
  </div>
);

const FieldWrapper: React.FC<{
  label: string;
  apiField: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, apiField, required, children }) => (
  <div className="space-y-1.5">
    {label && (
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        <span className="text-[10px] text-muted-foreground font-mono bg-surface-2 px-1.5 py-0.5 rounded">
          {apiField}
        </span>
      </div>
    )}
    {children}
  </div>
);
