import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ArrowLeft, Calendar, ChevronDown, X, Search, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "../ui/utils";
import { toast } from "sonner";
import {
  useCaborKategoriOptions,
  useCaborOptions,
  useParameterPemeriksaanOptions,
  useTenagaPendukungOptions,
} from "@/hooks/use-options";
import {
  useCreatePemeriksaan,
  useUpdatePemeriksaan,
} from "@/hooks/use-pemeriksaan";
import {
  mapPemeriksaanItem,
  type PemeriksaanStatus,
} from "@/app/lib/pemeriksaan-mappers";
import type { Pemeriksaan } from "@/app/lib/pemeriksaan-mappers";
import { parseApiError } from "@/hooks/use-api-error";
import { toMasterDataOptions } from "@/app/lib/option-mappers";

const STATUS_CARD_CONFIG: { value: PemeriksaanStatus; label: string; desc: string; color: string; bg: string; border: string; icon: React.FC<any> }[] = [
  { value: "belum",    label: "Belum Dimulai", desc: "Pemeriksaan belum dilaksanakan",   color: "text-muted-foreground", bg: "bg-muted/30",               border: "border-muted-foreground/40", icon: Clock },
  { value: "sebagian", label: "Sebagian",      desc: "Input sedang berlangsung",          color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-400", icon: AlertCircle },
  { value: "selesai",  label: "Selesai",       desc: "Semua data telah diisi",            color: "text-success",          bg: "bg-success/10",             border: "border-success",             icon: CheckCircle },
];

interface PemeriksaanFormScreenProps {
  onBack: () => void;
  onSaved: (item: Pemeriksaan) => void;
  editItem?: Pemeriksaan;
}

export const PemeriksaanFormScreen: React.FC<PemeriksaanFormScreenProps> = ({ onBack, onSaved, editItem }) => {
  const isEdit = !!editItem;
  const [caborOpen, setCaborOpen] = React.useState(false);
  const [kategoriOpen, setKategoriOpen] = React.useState(false);
  const [tenagaOpen, setTenagaOpen] = React.useState(false);
  const [paramSearch, setParamSearch] = React.useState("");

  const createMutation = useCreatePemeriksaan();
  const updateMutation = useUpdatePemeriksaan();

  const [form, setForm] = React.useState({
    nama: editItem?.nama ?? "",
    cabor_id: editItem?.cabor_id ?? 0,
    cabor_kategori_id: editItem?.cabor_kategori_id ?? 0,
    tenaga_pendukung_id: editItem?.tenaga_pendukung_id ?? 0,
    tanggal: editItem ? editItem.tanggal.toISOString().split("T")[0] : "",
    status: (editItem?.status ?? "belum") as PemeriksaanStatus,
    parameter_ids: [] as number[],
  });

  const caborQuery = useCaborOptions();
  const kategoriQuery = useCaborKategoriOptions(form.cabor_id || null);
  const tenagaQuery = useTenagaPendukungOptions(
    form.cabor_kategori_id ? { cabor_kategori_id: form.cabor_kategori_id } : undefined
  );
  const parameterQuery = useParameterPemeriksaanOptions();

  const caborOptions = caborQuery.data ?? [];
  const kategoriOptions = kategoriQuery.data ?? [];
  const tenagaOptions = tenagaQuery.data ?? [];
  const parameterOptions = toMasterDataOptions(parameterQuery.data ?? []);

  const selectedCaborName = caborOptions.find((c) => c.id === form.cabor_id)?.nama ?? "";
  const selectedKategoriName = kategoriOptions.find((k) => k.id === form.cabor_kategori_id)?.nama ?? "";
  const selectedTenagaName = tenagaOptions.find((t) => t.id === form.tenaga_pendukung_id)?.nama ?? "";

  const filteredParams = parameterOptions.filter((p) =>
    !paramSearch || p.label.toLowerCase().includes(paramSearch.toLowerCase())
  );

  const toggleParam = (id: number) =>
    setForm((f) => ({
      ...f,
      parameter_ids: f.parameter_ids.includes(id)
        ? f.parameter_ids.filter((x) => x !== id)
        : [...f.parameter_ids, id],
    }));

  const isValid =
    form.nama &&
    form.cabor_id > 0 &&
    form.cabor_kategori_id > 0 &&
    form.tenaga_pendukung_id > 0 &&
    form.tanggal &&
    (isEdit || form.parameter_ids.length > 0);

  const loading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      const result = isEdit
        ? await updateMutation.mutateAsync({
            id: Number(editItem!.id),
            payload: {
              cabor_id: form.cabor_id,
              cabor_kategori_id: form.cabor_kategori_id,
              tenaga_pendukung_id: form.tenaga_pendukung_id,
              nama_pemeriksaan: form.nama,
              tanggal_pemeriksaan: form.tanggal,
              status: form.status,
            },
          })
        : await createMutation.mutateAsync({
            cabor_id: form.cabor_id,
            cabor_kategori_id: form.cabor_kategori_id,
            tenaga_pendukung_id: form.tenaga_pendukung_id,
            nama_pemeriksaan: form.nama,
            tanggal_pemeriksaan: form.tanggal,
            status: form.status,
            parameter_ids: form.parameter_ids,
          });

      toast.success(isEdit ? "Pemeriksaan diperbarui" : "Pemeriksaan dibuat");
      onSaved(mapPemeriksaanItem(result));
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const DropdownField = ({
    label, apiField, value, open, setOpen, options, onSelect, disabled,
  }: {
    label: string; apiField: string; value: string; open: boolean;
    setOpen: (v: boolean) => void;
    options: { id: number; nama: string }[];
    onSelect: (id: number) => void;
    disabled?: boolean;
  }) => (
    <FieldWrap label={label} apiField={apiField} required>
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || `Pilih ${label.toLowerCase()}`}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 rounded-xl border border-border bg-surface shadow-lg overflow-hidden max-h-48 overflow-y-auto z-10 relative">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => { onSelect(o.id); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-surface-2"
            >{o.nama}</button>
          ))}
        </div>
      )}
    </FieldWrap>
  );

  return (
    <div className="bg-background pb-tab-bar">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-base font-bold">{isEdit ? "Edit Pemeriksaan" : "Tambah Pemeriksaan"}</h1>
          <p className="text-xs text-muted-foreground">Pemeriksaan Kesehatan</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        <section>
          <SectionHeader label="Informasi Pemeriksaan" />
          <div className="space-y-3">
            <FieldWrap label="Nama Pemeriksaan" apiField="nama_pemeriksaan" required>
              <Input
                placeholder="Contoh: Pemeriksaan Fisik Renang Q1"
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                className="rounded-xl bg-input-background border-border text-sm"
              />
            </FieldWrap>
            <DropdownField
              label="Cabor" apiField="cabor_id" value={selectedCaborName}
              open={caborOpen} setOpen={setCaborOpen} options={caborOptions}
              onSelect={(id) => setForm((f) => ({ ...f, cabor_id: id, cabor_kategori_id: 0, tenaga_pendukung_id: 0 }))}
            />
            <DropdownField
              label="Kategori" apiField="cabor_kategori_id" value={selectedKategoriName}
              open={kategoriOpen} setOpen={setKategoriOpen} options={kategoriOptions}
              onSelect={(id) => setForm((f) => ({ ...f, cabor_kategori_id: id, tenaga_pendukung_id: 0 }))}
              disabled={!form.cabor_id}
            />
            <DropdownField
              label="Tenaga Pendukung" apiField="tenaga_pendukung_id" value={selectedTenagaName}
              open={tenagaOpen} setOpen={setTenagaOpen} options={tenagaOptions}
              onSelect={(id) => setForm((f) => ({ ...f, tenaga_pendukung_id: id }))}
              disabled={!form.cabor_kategori_id}
            />
          </div>
        </section>

        <section>
          <SectionHeader label="Jadwal" />
          <FieldWrap label="Tanggal Pemeriksaan" apiField="tanggal_pemeriksaan" required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
                className="pl-9 rounded-xl bg-input-background border-border text-sm"
              />
            </div>
          </FieldWrap>
        </section>

        {isEdit && (
          <section>
            <SectionHeader label="Status" />
            <div className="space-y-2">
              {STATUS_CARD_CONFIG.map((s) => {
                const Icon = s.icon;
                const selected = form.status === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setForm((f) => ({ ...f, status: s.value }))}
                    className={cn("w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3",
                      selected ? `${s.bg} ${s.border}` : "bg-surface border-border"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", selected ? s.color : "text-muted-foreground")} />
                    <div>
                      <p className={cn("text-sm font-semibold", selected ? s.color : "text-foreground")}>{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {!isEdit && (
          <section>
            <SectionHeader label="Parameter" />
            <div className="space-y-3">
              {form.parameter_ids.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.parameter_ids.map((id) => {
                    const label = parameterOptions.find((p) => Number(p.value) === id)?.label ?? String(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggleParam(id)}
                        className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1.5 rounded-full"
                      >
                        {label} <X className="h-3 w-3" />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari parameter..."
                  value={paramSearch}
                  onChange={(e) => setParamSearch(e.target.value)}
                  className="pl-8 h-9 text-sm bg-surface-2 border-0 rounded-xl"
                />
              </div>

              {parameterQuery.isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredParams.map((p) => {
                    const id = Number(p.value);
                    const selected = form.parameter_ids.includes(id);
                    return (
                      <button
                        key={p.value}
                        onClick={() => toggleParam(id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          selected ? "bg-primary text-white border-primary" : "bg-surface border-border text-foreground"
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{form.parameter_ids.length} parameter dipilih</p>
            </div>
          </section>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 rounded-button h-11" onClick={onBack}>Batal</Button>
          <Button className="flex-1 rounded-button h-11" disabled={!isValid || loading} onClick={handleSubmit}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-1 h-4 bg-primary rounded-full" />
    <h2 className="text-sm font-bold uppercase tracking-wide">{label}</h2>
  </div>
);

const FieldWrap: React.FC<{ label: string; apiField: string; required?: boolean; children: React.ReactNode }> = ({ label, apiField, required, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-foreground">{label} {required && <span className="text-primary">*</span>}</label>
      <span className="text-[10px] font-mono bg-surface-2 px-1.5 py-0.5 rounded text-muted-foreground">{apiField}</span>
    </div>
    {children}
  </div>
);
