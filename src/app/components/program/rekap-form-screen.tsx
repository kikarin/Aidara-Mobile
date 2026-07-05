import * as React from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  ArrowLeft, Camera, X, MapPin, Upload, Trash2, AlertCircle
} from "lucide-react";
import { cn } from "../ui/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { validateUploadFile } from "@/app/lib/file-validation";
import { GpsCameraModal, type CapturedPhoto } from "./gps-camera-modal";
import { JENIS_CONFIG } from "./rekap-home-screen";
import type { ProgramLatihan } from "@/app/lib/program-mappers";
import {
  getFileTypeFromName,
  getTodayDateString,
  mapJenisToApi,
  type JenisLatihan,
  type RekapHarian,
} from "@/app/lib/program-mappers";
import { buildFotoLokasiMetadata } from "@/api/rekap-absen";
import { useCreateRekapAbsen, useUpdateRekapAbsen } from "@/hooks/use-rekap-absen";
import { parseApiError } from "@/hooks/use-api-error";
import type { FotoAbsenApiItem } from "@/api/program-latihan-types";

const JENIS_OPTIONS = (Object.keys(JENIS_CONFIG) as JenisLatihan[]).map((k) => ({
  value: k,
  ...JENIS_CONFIG[k],
}));

interface NewFileNilai {
  id: string;
  file: File;
  name: string;
  size: string;
  type: "pdf" | "xls" | "xlsx";
}

interface ExistingFileNilai {
  id: number;
  name: string;
  size: string;
  type: "pdf" | "xls" | "xlsx";
  url: string;
}

interface RekapFormScreenProps {
  program: ProgramLatihan;
  editRekap?: RekapHarian;
  onBack: () => void;
  onSaved: () => void;
}

export const RekapFormScreen: React.FC<RekapFormScreenProps> = ({
  program,
  editRekap,
  onBack,
  onSaved,
}) => {
  const isEdit = !!editRekap;
  const [cameraOpen, setCameraOpen] = React.useState(false);

  const createMutation = useCreateRekapAbsen(program.id);
  const updateMutation = useUpdateRekapAbsen(program.id);

  const [jenis, setJenis] = React.useState<JenisLatihan | "">(editRekap?.jenis_latihan ?? "");
  const [keterangan, setKeterangan] = React.useState(editRekap?.keterangan ?? "");
  const [newPhotos, setNewPhotos] = React.useState<CapturedPhoto[]>([]);
  const [existingPhotos, setExistingPhotos] = React.useState<FotoAbsenApiItem[]>(
    editRekap?.foto_absen ?? []
  );
  const [deletedMediaIds, setDeletedMediaIds] = React.useState<number[]>([]);
  const [newFiles, setNewFiles] = React.useState<NewFileNilai[]>([]);
  const [existingFiles, setExistingFiles] = React.useState<ExistingFileNilai[]>(
    (editRekap?.file_nilai ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      size: "-",
      type: getFileTypeFromName(f.name),
      url: f.url,
    }))
  );
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const allPhotoPreviews = React.useMemo(() => {
    const existing = existingPhotos.map((p) => ({
      id: `existing-${p.id}`,
      dataUrl: p.url,
      isExisting: true,
    }));
    const added = newPhotos.map((p) => ({
      id: p.id,
      dataUrl: p.dataUrl,
      isExisting: false,
    }));
    return [...existing, ...added];
  }, [existingPhotos, newPhotos]);

  const handleCapture = (photo: CapturedPhoto) => {
    const validationError = validateUploadFile(photo.file, "rekapPhoto");
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setNewPhotos((p) => [...p, photo]);
    toast.success("Foto berhasil diambil");
  };

  const removePhoto = (id: string) => {
    if (id.startsWith("existing-")) {
      const mediaId = Number(id.replace("existing-", ""));
      setExistingPhotos((p) => p.filter((ph) => ph.id !== mediaId));
      setDeletedMediaIds((ids) => [...ids, mediaId]);
      return;
    }
    setNewPhotos((p) => p.filter((ph) => ph.id !== id));
  };

  const removeExistingFile = (id: number) => {
    setExistingFiles((f) => f.filter((fi) => fi.id !== id));
    setDeletedMediaIds((ids) => [...ids, id]);
  };

  const removeNewFile = (id: string) => {
    setNewFiles((f) => f.filter((fi) => fi.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateUploadFile(file, "rekapDocument");
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() as NewFileNilai["type"];
    setNewFiles((f) => [
      ...f,
      {
        id: Date.now().toString(),
        file,
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: ext,
      },
    ]);
    toast.success("File berhasil diunggah");
    e.target.value = "";
  };

  const isValid = jenis && keterangan.trim().length > 0;
  const loading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!isValid) return;

    const fotoFiles = newPhotos.map((p) => p.file);
    const fotoLokasi = newPhotos.map((p) =>
      buildFotoLokasiMetadata({
        lat: p.lat,
        lng: p.lng,
        address: p.address,
        timestamp: p.timestamp,
      })
    );
    const fileNilai = newFiles.map((f) => f.file);

    try {
      if (isEdit && editRekap) {
        await updateMutation.mutateAsync({
          rekapId: Number(editRekap.id),
          payload: {
            jenis_latihan: mapJenisToApi(jenis as JenisLatihan),
            keterangan: keterangan.trim(),
            foto_absen: fotoFiles.length > 0 ? fotoFiles : undefined,
            foto_lokasi: fotoLokasi.length > 0 ? fotoLokasi : undefined,
            file_nilai: fileNilai.length > 0 ? fileNilai : undefined,
            deleted_media_ids: deletedMediaIds.length > 0 ? deletedMediaIds : undefined,
          },
        });
        toast.success("Rekap berhasil diperbarui");
      } else {
        await createMutation.mutateAsync({
          program_latihan_id: Number(program.id),
          tanggal: getTodayDateString(),
          jenis_latihan: mapJenisToApi(jenis as JenisLatihan),
          keterangan: keterangan.trim(),
          foto_absen: fotoFiles.length > 0 ? fotoFiles : undefined,
          foto_lokasi: fotoLokasi.length > 0 ? fotoLokasi : undefined,
          file_nilai: fileNilai.length > 0 ? fileNilai : undefined,
        });
        toast.success("Rekap berhasil disimpan");
      }
      onSaved();
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
            <h1 className="text-base font-bold">{isEdit ? "Edit Rekap" : "Rekap Latihan Hari Ini"}</h1>
            <p className="text-xs text-muted-foreground">{program.nama_program}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-6 pb-32">
        <section>
          <SectionHeader label="Informasi Sesi" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Tanggal</label>
                <span className="text-[10px] font-mono bg-surface-2 px-1.5 py-0.5 rounded text-muted-foreground">tanggal</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-2 border border-border">
                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">Read only</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Jenis Latihan <span className="text-primary">*</span>
                </label>
                <span className="text-[10px] font-mono bg-surface-2 px-1.5 py-0.5 rounded text-muted-foreground">jenis_latihan</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {JENIS_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = jenis === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setJenis(opt.value)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                        isSelected
                          ? `${opt.bg} ${opt.bgDark} border-current ${opt.color}`
                          : "bg-surface border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", opt.bg, opt.bgDark)}>
                        <Icon className={cn("h-5 w-5", opt.color)} />
                      </div>
                      <span className={cn("text-sm font-semibold", isSelected ? opt.color : "text-foreground")}>
                        Latihan {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader label="Catatan Pelatih" />
          <div className="space-y-1.5">
            <Textarea
              placeholder="Deskripsikan sesi latihan hari ini..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={4}
              className="rounded-xl bg-input-background border-border text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{keterangan.length} karakter</p>
          </div>
        </section>

        <section>
          <SectionHeader label="Foto Absen GPS" />
          <div className="space-y-3">
            {allPhotoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {allPhotoPreviews.map((photo, idx) => (
                  <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-surface-2 group">
                    <img
                      src={photo.dataUrl}
                      alt="Foto absen"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setLightboxIdx(idx)}
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setCameraOpen(true)}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary active:scale-[0.98] transition-transform"
            >
              <Camera className="h-5 w-5" />
              <div className="text-left">
                <p className="text-sm font-semibold">Ambil Foto dengan Kamera</p>
                <p className="text-xs text-primary/70">Aktifkan GPS sebelum mengambil foto</p>
              </div>
            </button>

            {allPhotoPreviews.length === 0 && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>Foto harus diambil menggunakan kamera GPS. Waktu dan alamat lengkap akan tercetak di foto seperti geo photo.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <SectionHeader label="File Nilai Atlet" />
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <FileNilaiCard key={file.id} name={file.name} size={file.size} type={file.type} onRemove={() => removeExistingFile(file.id)} />
            ))}
            {newFiles.map((file) => (
              <FileNilaiCard key={file.id} name={file.name} size={file.size} type={file.type} onRemove={() => removeNewFile(file.id)} />
            ))}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xls,.xlsx"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-colors"
            >
              <Upload className="h-4 w-4 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium">Unggah File</p>
                <p className="text-xs">PDF, XLS, XLSX</p>
              </div>
            </button>
          </div>
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

      <GpsCameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCapture}
      />

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <X className="h-5 w-5 text-white" />
          </button>
          <img
            src={allPhotoPreviews[lightboxIdx]?.dataUrl}
            alt="Foto"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

const FileNilaiCard: React.FC<{
  name: string;
  size: string;
  type: "pdf" | "xls" | "xlsx";
  onRemove: () => void;
}> = ({ name, size, type, onRemove }) => {
  const iconConfig = {
    pdf: { color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label: "PDF" },
    xls: { color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", label: "XLS" },
    xlsx: { color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", label: "XLSX" },
  };
  const cfg = iconConfig[type];

  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border bg-surface">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
        <span className={cn("text-xs font-bold", cfg.color)}>{cfg.label}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{size}</p>
      </div>
      <button
        onClick={onRemove}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-1 h-4 bg-primary rounded-full" />
    <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{label}</h2>
  </div>
);
