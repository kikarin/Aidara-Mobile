import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ArrowLeft, Calendar, ChevronDown, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "../ui/utils";
import { toast } from "sonner";
import { useCaborKategoriOptions, useCaborOptions } from "@/hooks/use-options";
import { useCreatePk, useUpdatePk } from "@/hooks/use-pemeriksaan-khusus";
import { mapPkItem, type Assessment } from "@/app/lib/pk-mappers";
import type { PkStatus } from "@/api/pemeriksaan-khusus-types";
import { parseApiError } from "@/hooks/use-api-error";

const STATUS_CARD_CONFIG: {
  value: PkStatus; label: string; desc: string; color: string; bg: string; border: string; icon: React.FC<any>;
}[] = [
  { value: "belum",    label: "Belum Dimulai", desc: "Pemeriksaan belum dilaksanakan", color: "text-muted-foreground", bg: "bg-muted/30", border: "border-muted-foreground/40", icon: Clock },
  { value: "sebagian", label: "Berjalan",      desc: "Input sedang berlangsung",      color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-400", icon: AlertCircle },
  { value: "selesai",  label: "Selesai",       desc: "Semua data telah diisi",        color: "text-success", bg: "bg-success/10", border: "border-success", icon: CheckCircle },
];

interface PkFormScreenProps {
  onBack: () => void;
  onSaved: (item: Assessment) => void;
  editItem?: Assessment;
}

export const PkFormScreen: React.FC<PkFormScreenProps> = ({ onBack, onSaved, editItem }) => {
  const isEdit = !!editItem;
  const [caborOpen, setCaborOpen] = React.useState(false);
  const [kategoriOpen, setKategoriOpen] = React.useState(false);

  const createMutation = useCreatePk();
  const updateMutation = useUpdatePk();

  const [form, setForm] = React.useState({
    nama: editItem?.nama ?? "",
    cabor_id: editItem?.cabor_id ?? 0,
    cabor_kategori_id: editItem?.cabor_kategori_id ?? 0,
    tanggal: editItem ? editItem.tanggal.toISOString().split("T")[0] : "",
    status: (editItem?.status ?? "belum") as PkStatus,
  });

  const caborQuery = useCaborOptions();
  const kategoriQuery = useCaborKategoriOptions(form.cabor_id || null);

  const caborOptions = caborQuery.data ?? [];
  const kategoriOptions = kategoriQuery.data ?? [];
  const selectedCaborName = caborOptions.find((c) => c.id === form.cabor_id)?.nama ?? "";
  const selectedKategoriName = kategoriOptions.find((k) => k.id === form.cabor_kategori_id)?.nama ?? "";

  const isValid = form.nama && form.cabor_id > 0 && form.cabor_kategori_id > 0 && form.tanggal;
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
              nama_pemeriksaan: form.nama,
              tanggal_pemeriksaan: form.tanggal,
              status: form.status,
            },
          })
        : await createMutation.mutateAsync({
            cabor_id: form.cabor_id,
            cabor_kategori_id: form.cabor_kategori_id,
            nama_pemeriksaan: form.nama,
            tanggal_pemeriksaan: form.tanggal,
            status: form.status,
          });

      toast.success(isEdit ? "Pemeriksaan fisik diperbarui" : "Pemeriksaan fisik dibuat");
      onSaved(mapPkItem(result));
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const DropdownField = ({
    label, value, open, setOpen, options, onSelect, disabled,
  }: {
    label: string; value: string; open: boolean; setOpen: (v: boolean) => void;
    options: { id: number; nama: string }[]; onSelect: (id: number) => void; disabled?: boolean;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label} <span className="text-primary">*</span></label>
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
            <button key={o.id} onClick={() => { onSelect(o.id); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-surface-2">{o.nama}</button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-background pb-tab-bar">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-base font-bold">{isEdit ? "Edit Pemeriksaan Fisik" : "Buat Pemeriksaan Fisik"}</h1>
          <p className="text-xs text-muted-foreground">Evaluasi kondisi fisik atlet</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        <section>
          <SectionHeader label="Informasi Pemeriksaan" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nama Pemeriksaan <span className="text-primary">*</span></label>
              <Input
                placeholder="Contoh: Pemeriksaan Fisik Renang Q1"
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                className="rounded-xl bg-input-background border-border text-sm"
              />
            </div>
            <DropdownField
              label="Cabor" value={selectedCaborName}
              open={caborOpen} setOpen={setCaborOpen} options={caborOptions}
              onSelect={(id) => setForm((f) => ({ ...f, cabor_id: id, cabor_kategori_id: 0 }))}
            />
            <DropdownField
              label="Kategori" value={selectedKategoriName}
              open={kategoriOpen} setOpen={setKategoriOpen} options={kategoriOptions}
              onSelect={(id) => setForm((f) => ({ ...f, cabor_kategori_id: id }))}
              disabled={!form.cabor_id}
            />
          </div>
        </section>

        <section>
          <SectionHeader label="Jadwal" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tanggal Pemeriksaan <span className="text-primary">*</span></label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
                className="pl-9 rounded-xl bg-input-background border-border text-sm"
              />
            </div>
          </div>
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
                      selected ? `${s.bg} ${s.border}` : "bg-surface border-border")}
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
