import * as React from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import {
  ArrowLeft, Camera, MapPin, Clock, CheckCircle, Loader2, AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { GpsCameraModal, type CapturedPhoto } from "./gps-camera-modal";
import type { ProgramLatihan } from "@/app/lib/program-mappers";
import { getTodayDateString } from "@/app/lib/program-mappers";
import { buildFotoLokasiMetadata } from "@/api/absen-atlet";
import { useAbsenAtletToday, useCreateAbsenAtlet } from "@/hooks/use-absen-atlet";
import { parseApiError } from "@/hooks/use-api-error";

interface AbsenAtletScreenProps {
  program: ProgramLatihan;
  onBack: () => void;
  onSaved: () => void;
}

export const AbsenAtletScreen: React.FC<AbsenAtletScreenProps> = ({
  program,
  onBack,
  onSaved,
}) => {
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [photo, setPhoto] = React.useState<CapturedPhoto | null>(null);
  const [catatan, setCatatan] = React.useState("");

  const todayQuery = useAbsenAtletToday(program.id);
  const createMutation = useCreateAbsenAtlet(program.id);

  const alreadyAbsen = !!todayQuery.data;
  const todayLabel = format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale });

  const handleCapture = (captured: CapturedPhoto) => {
    setPhoto(captured);
    toast.success("Foto absen berhasil diambil");
  };

  const handleSubmit = async () => {
    if (!photo) {
      toast.error("Ambil foto absen terlebih dahulu");
      return;
    }

    try {
      await createMutation.mutateAsync({
        tanggal: getTodayDateString(),
        status: "hadir",
        catatan: catatan.trim() || undefined,
        foto_absen: photo.file,
        foto_lokasi: buildFotoLokasiMetadata({
          lat: photo.lat,
          lng: photo.lng,
          address: photo.address,
          timestamp: photo.timestamp,
        }),
      });
      toast.success("Absen berhasil disimpan");
      onSaved();
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  if (todayQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-background pb-28">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 pt-4 pb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">Absen dengan Foto</h1>
            <p className="text-xs text-muted-foreground truncate">{program.nama_program}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        <Card className="p-4 border border-border">
          <p className="text-sm font-semibold">{todayLabel}</p>
          <p className="text-xs text-muted-foreground mt-1">{program.cabor} · {program.kategori}</p>
        </Card>

        {alreadyAbsen ? (
          <Card className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Sudah Absen Hari Ini</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  Absen tercatat pukul {todayQuery.data?.waktu_foto ?? "-"}
                </p>
                {todayQuery.data?.foto?.url && (
                  <img
                    src={todayQuery.data.foto.url}
                    alt="Foto absen"
                    className="mt-3 w-full max-h-48 object-cover rounded-xl border"
                  />
                )}
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card className="p-4 border border-border space-y-3">
              <p className="text-sm font-semibold">Foto Absen *</p>
              {photo ? (
                <div className="space-y-3">
                  <img src={photo.dataUrl} alt="Preview absen" className="w-full rounded-xl border object-cover max-h-64" />
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {photo.address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{photo.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{format(photo.timestamp, "HH:mm:ss")} WIB</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCameraOpen(true)}>
                    <Camera className="h-4 w-4 mr-1.5" />
                    Ambil Ulang Foto
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCameraOpen(true)}
                  className="w-full py-10 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <Camera className="h-8 w-8 text-primary" />
                  <span className="text-sm font-semibold text-primary">Ambil Foto dengan GPS</span>
                  <span className="text-xs text-muted-foreground">Timestamp & lokasi otomatis</span>
                </button>
              )}
            </Card>

            <Card className="p-4 border border-border space-y-2">
              <p className="text-sm font-semibold">Catatan (opsional)</p>
              <Textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tambahkan catatan jika perlu..."
                rows={3}
              />
            </Card>

            <div className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Absen hanya dapat dilakukan sekali per hari selama program berlangsung.</span>
            </div>
          </>
        )}
      </div>

      <GpsCameraModal open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCapture} />

      {!alreadyAbsen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-3 bg-background/95 backdrop-blur border-t border-border">
          <Button
            className="w-full h-12 rounded-2xl text-base font-bold"
            disabled={!photo || createMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Absen"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
