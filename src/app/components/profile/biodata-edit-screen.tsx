import * as React from "react";
import { ArrowLeft, Camera } from "lucide-react";
import type { Biodata, PesertaRole, UpdateBiodataPayload } from "@/api/profile-types";
import { mapBiodataToFormValues } from "@/app/lib/profile-mappers";
import {
  AGAMA_OPTIONS,
  DISABILITAS_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KELAS_SEKOLAH_OPTIONS,
  KLASIFIKASI_NPCI_OPTIONS,
  UKURAN_BAJU_OPTIONS,
  UKURAN_CELANA_OPTIONS,
  UKURAN_SEPATU_OPTIONS,
  type BiodataOption,
} from "@/app/lib/biodata-options";
import { KecamatanKelurahanPicker } from "@/app/components/ui/kecamatan-kelurahan-picker";
import type { CascadeLevel } from "@/app/components/ui/cascade-picker";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { getValidationErrors, parseApiError } from "@/hooks/use-api-error";
import { validateUploadFile } from "@/app/lib/file-validation";
import { toast } from "sonner";

interface BiodataEditScreenProps {
  role: PesertaRole;
  biodata: Biodata;
  loading?: boolean;
  onBack: () => void;
  onSave: (payload: UpdateBiodataPayload, file?: File) => Promise<void>;
}

export const BiodataEditScreen: React.FC<BiodataEditScreenProps> = ({
  role,
  biodata,
  loading,
  onBack,
  onSave,
}) => {
  const initial = React.useMemo(() => mapBiodataToFormValues(biodata), [biodata]);
  const [form, setForm] = React.useState(initial);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(
    biodata.foto_thumbnail || biodata.foto || null
  );
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [wilayahOpen, setWilayahOpen] = React.useState(false);
  const [selectedWilayah, setSelectedWilayah] = React.useState<{
    kecamatan?: CascadeLevel;
    kelurahan?: CascadeLevel;
  }>({
    kecamatan: biodata.kecamatan
      ? { id: String(biodata.kecamatan.id), label: biodata.kecamatan.nama }
      : undefined,
    kelurahan: biodata.kelurahan
      ? { id: String(biodata.kelurahan.id), label: biodata.kelurahan.nama }
      : undefined,
  });

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const setSelectField = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateUploadFile(file, "profilePhoto");
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setFieldErrors({});

    const payload: UpdateBiodataPayload = {
      nik: form.nik || null,
      nama: form.nama,
      jenis_kelamin: form.jenis_kelamin ? (form.jenis_kelamin as "L" | "P") : null,
      tempat_lahir: form.tempat_lahir || null,
      tanggal_lahir: form.tanggal_lahir || null,
      tanggal_bergabung: form.tanggal_bergabung || null,
      alamat: form.alamat || null,
      kecamatan_id: form.kecamatan_id ? Number.parseInt(form.kecamatan_id, 10) : null,
      kelurahan_id: form.kelurahan_id ? Number.parseInt(form.kelurahan_id, 10) : null,
      no_hp: form.no_hp || null,
      email: form.email || null,
    };

    if (role === "atlet") {
      Object.assign(payload, {
        nisn: form.nisn || null,
        agama: form.agama || null,
        sekolah: form.sekolah || null,
        kelas_sekolah: form.kelas_sekolah || null,
        ukuran_baju: form.ukuran_baju || null,
        ukuran_celana: form.ukuran_celana || null,
        ukuran_sepatu: form.ukuran_sepatu || null,
        disabilitas: form.disabilitas || null,
        klasifikasi: form.klasifikasi || null,
        iq: form.iq || null,
      });
    }

    if (role === "pelatih") {
      payload.pekerjaan_selain_melatih = form.pekerjaan_selain_melatih || null;
    }

    try {
      await onSave(payload, photoFile ?? undefined);
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setSubmitError(parseApiError(error).message);
    }
  };

  const renderError = (field: string) => {
    const message = fieldErrors[field]?.[0];
    if (!message) return null;
    return <p className="text-xs text-destructive mt-1">{message}</p>;
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">Edit Biodata</h2>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-surface-2 border border-border">
            {photoPreview ? (
              <img src={photoPreview} alt="Foto profil" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                <Camera className="h-8 w-8" />
              </div>
            )}
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
            <span className="text-sm text-primary font-medium">Ubah Foto</span>
          </label>
        </div>

        <div className="space-y-4">
          <Field label="Nama Lengkap" error={renderError("nama")}>
            <Input value={form.nama} onChange={setField("nama")} placeholder="Masukkan nama lengkap" />
          </Field>
          <Field label="NIK" error={renderError("nik")}>
            <Input value={form.nik} onChange={setField("nik")} placeholder="16 digit NIK" inputMode="numeric" />
          </Field>
          <SelectField
            label="Jenis Kelamin"
            value={form.jenis_kelamin}
            onChange={setSelectField("jenis_kelamin")}
            options={JENIS_KELAMIN_OPTIONS}
            placeholder="Pilih jenis kelamin"
            error={renderError("jenis_kelamin")}
          />
          <Field label="Tempat Lahir" error={renderError("tempat_lahir")}>
            <Input value={form.tempat_lahir} onChange={setField("tempat_lahir")} placeholder="Masukkan tempat lahir" />
          </Field>
          <Field label="Tanggal Lahir" error={renderError("tanggal_lahir")}>
            <Input type="date" value={form.tanggal_lahir} onChange={setField("tanggal_lahir")} />
          </Field>
          <Field label="Tanggal Bergabung" error={renderError("tanggal_bergabung")}>
            <Input type="date" value={form.tanggal_bergabung} onChange={setField("tanggal_bergabung")} />
          </Field>
          <Field label="Alamat" error={renderError("alamat")}>
            <Textarea value={form.alamat} onChange={setField("alamat")} rows={3} placeholder="Masukkan alamat lengkap" />
          </Field>
          <Field label="Kecamatan & Kelurahan" error={renderError("kecamatan_id") || renderError("kelurahan_id")}>
            <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setWilayahOpen(true)}>
              {selectedWilayah.kecamatan && selectedWilayah.kelurahan
                ? `${selectedWilayah.kecamatan.label}, ${selectedWilayah.kelurahan.label}`
                : "Pilih kecamatan & kelurahan"}
            </Button>
          </Field>
          <Field label="No. HP" error={renderError("no_hp")}>
            <Input value={form.no_hp} onChange={setField("no_hp")} placeholder="08xxxxxxxxxx" inputMode="tel" />
          </Field>
          <Field label="Email" error={renderError("email")}>
            <Input type="email" value={form.email} onChange={setField("email")} placeholder="nama@email.com" />
          </Field>

          {role === "atlet" && (
            <>
              <Field label="NISN" error={renderError("nisn")}>
                <Input value={form.nisn} onChange={setField("nisn")} placeholder="Masukkan NISN" inputMode="numeric" />
              </Field>
              <SelectField
                label="Agama"
                value={form.agama}
                onChange={setSelectField("agama")}
                options={AGAMA_OPTIONS}
                placeholder="Pilih agama"
                error={renderError("agama")}
              />
              <Field label="Sekolah" error={renderError("sekolah")}>
                <Input value={form.sekolah} onChange={setField("sekolah")} placeholder="Nama sekolah" />
              </Field>
              <SelectField
                label="Kelas"
                value={form.kelas_sekolah}
                onChange={setSelectField("kelas_sekolah")}
                options={KELAS_SEKOLAH_OPTIONS}
                placeholder="Pilih kelas"
                error={renderError("kelas_sekolah")}
              />
              <SelectField
                label="Ukuran Baju"
                value={form.ukuran_baju}
                onChange={setSelectField("ukuran_baju")}
                options={UKURAN_BAJU_OPTIONS}
                placeholder="Pilih ukuran baju"
                error={renderError("ukuran_baju")}
              />
              <SelectField
                label="Ukuran Celana"
                value={form.ukuran_celana}
                onChange={setSelectField("ukuran_celana")}
                options={UKURAN_CELANA_OPTIONS}
                placeholder="Pilih ukuran celana"
                error={renderError("ukuran_celana")}
              />
              <SelectField
                label="Ukuran Sepatu"
                value={form.ukuran_sepatu}
                onChange={setSelectField("ukuran_sepatu")}
                options={UKURAN_SEPATU_OPTIONS}
                placeholder="Pilih ukuran sepatu"
                error={renderError("ukuran_sepatu")}
              />
              <SelectField
                label="Disabilitas"
                value={form.disabilitas}
                onChange={setSelectField("disabilitas")}
                options={DISABILITAS_OPTIONS}
                placeholder="Pilih jenis disabilitas"
                error={renderError("disabilitas")}
              />
              <SelectField
                label="Klasifikasi"
                value={form.klasifikasi}
                onChange={setSelectField("klasifikasi")}
                options={KLASIFIKASI_NPCI_OPTIONS}
                placeholder="Pilih klasifikasi"
                error={renderError("klasifikasi")}
              />
              <Field label="IQ" error={renderError("iq")}>
                <Input value={form.iq} onChange={setField("iq")} placeholder="Masukkan nilai IQ" inputMode="numeric" />
              </Field>
            </>
          )}

          {role === "pelatih" && (
            <Field label="Pekerjaan Selain Melatih" error={renderError("pekerjaan_selain_melatih")}>
              <Input
                value={form.pekerjaan_selain_melatih}
                onChange={setField("pekerjaan_selain_melatih")}
                placeholder="Contoh: Guru, PNS, Wiraswasta"
              />
            </Field>
          )}
        </div>

        {submitError && (
          <div className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
            {submitError}
          </div>
        )}

        <Button className="w-full" size="lg" onClick={() => void handleSubmit()} loading={loading} disabled={!form.nama}>
          Simpan Perubahan
        </Button>
      </div>

      <KecamatanKelurahanPicker
        open={wilayahOpen}
        onOpenChange={setWilayahOpen}
        selected={selectedWilayah}
        onSelect={(kecamatan, kelurahan) => {
          setSelectedWilayah({ kecamatan, kelurahan });
          setForm((prev) => ({
            ...prev,
            kecamatan_id: kecamatan.id,
            kelurahan_id: kelurahan.id,
            kecamatan_label: kecamatan.label,
            kelurahan_label: kelurahan.label,
          }));
        }}
      />
    </div>
  );
};

const Field: React.FC<{ label: string; error?: React.ReactNode; children: React.ReactNode }> = ({
  label,
  error,
  children,
}) => (
  <div>
    <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
    {children}
    {error}
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: BiodataOption[];
  placeholder: string;
  error?: React.ReactNode;
}> = ({ label, value, onChange, options, placeholder, error }) => (
  <Field label={label} error={error}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-sm text-foreground"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </Field>
);
