import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, MapPin, Clock, FileText, Download, Info, X, ExternalLink } from "lucide-react";
import { cn } from "../ui/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { JENIS_CONFIG } from "./rekap-home-screen";
import type { ProgramLatihan } from "@/app/lib/program-mappers";
import { getFileTypeFromName, parseCoordinate } from "@/app/lib/program-mappers";
import type { RekapHarian } from "@/app/lib/program-mappers";

interface RekapDetailScreenProps {
  rekap: RekapHarian;
  program: ProgramLatihan;
  onBack: () => void;
}

export const RekapDetailScreen: React.FC<RekapDetailScreenProps> = ({
  rekap,
  program,
  onBack,
}) => {
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  const cfg = JENIS_CONFIG[rekap.jenis_latihan];
  const Icon = cfg.icon;

  const photos = rekap.foto_absen.map((photo) => {
    const lat = parseCoordinate(photo.latitude);
    const lng = parseCoordinate(photo.longitude);
    return {
      id: String(photo.id),
      dataUrl: photo.url,
      timestamp: photo.waktu_foto ? new Date(photo.waktu_foto.replace(" ", "T")) : rekap.tanggal,
      lat: lat ?? 0,
      lng: lng ?? 0,
      address: photo.lokasi ?? "Lokasi tidak tersedia",
    };
  });

  const files = rekap.file_nilai.map((file) => ({
    id: String(file.id),
    name: file.name,
    size: "-",
    type: getFileTypeFromName(file.name),
    url: file.url,
  }));

  const firstPhotoWithCoords = photos.find((p) => p.lat && p.lng);
  const mapsUrl = firstPhotoWithCoords
    ? `https://maps.google.com/?q=${firstPhotoWithCoords.lat},${firstPhotoWithCoords.lng}`
    : null;

  return (
    <div className="flex flex-col min-h-full bg-background pb-8">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 pt-4 pb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold">Detail Rekap</h1>
            <p className="text-xs text-muted-foreground truncate">{program.nama_program}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <Info className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Rekap tanggal lampau tidak dapat diubah atau dihapus.
          </p>
        </div>

        <Card className="p-4 border border-border bg-surface shadow-sm">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Informasi Latihan</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cfg.bg, cfg.bgDark)}>
                <Icon className={cn("h-5 w-5", cfg.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jenis Latihan</p>
                <p className={cn("text-sm font-semibold", cfg.color)}>Latihan {cfg.label}</p>
              </div>
            </div>

            <div className="pl-1 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>{format(rekap.tanggal, "EEEE, d MMMM yyyy", { locale: idLocale })}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1.5">Keterangan</p>
              <p className="text-sm text-foreground leading-relaxed">{rekap.keterangan || "-"}</p>
            </div>
          </div>
        </Card>

        {photos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Galeri Foto ({photos.length})
              </h3>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary"
                >
                  <MapPin className="h-3.5 w-3.5" /> Lihat di Maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setLightboxIdx(idx)}
                  className="relative aspect-square rounded-xl overflow-hidden bg-surface-2"
                >
                  <img src={photo.dataUrl} alt="Foto absen" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1">
                    <p className="text-white text-[10px] font-mono">{format(photo.timestamp, "HH:mm")}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              File Nilai ({files.length})
            </h3>
            <div className="space-y-2">
              {files.map((file) => {
                const iconConfig = {
                  pdf:  { color: "text-red-500",   bg: "bg-red-50 dark:bg-red-900/20",   label: "PDF" },
                  xls:  { color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", label: "XLS" },
                  xlsx: { color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", label: "XLSX" },
                };
                const fc = iconConfig[file.type];
                return (
                  <div key={file.id} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border bg-surface">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", fc.bg)}>
                      <span className={cn("text-xs font-bold", fc.color)}>{fc.label}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {photos.length === 0 && files.length === 0 && (
          <Card className="p-6 border border-dashed border-border text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Tidak ada media untuk rekap ini</p>
          </Card>
        )}
      </div>

      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
          onClick={() => setLightboxIdx(null)}
        >
          <div className="flex items-center justify-between p-4">
            <p className="text-white text-sm font-semibold">Foto {lightboxIdx + 1} dari {photos.length}</p>
            <button
              onClick={() => setLightboxIdx(null)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightboxIdx].dataUrl}
              alt="Foto"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>

          <div className="p-4 bg-black/60 backdrop-blur">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-white/60" />
                <span className="text-white/80 text-xs font-mono">
                  {format(photos[lightboxIdx].timestamp, "HH:mm:ss", { locale: idLocale })} WIB
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-white/60 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/80 text-xs leading-relaxed">
                    {photos[lightboxIdx].address !== "Lokasi tidak tersedia"
                      ? photos[lightboxIdx].address
                      : "Alamat tidak tersedia"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
