import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  ArrowLeft, MapPin, Clock, Camera, CheckCircle2, AlertCircle, ExternalLink, Loader2,
} from "lucide-react";
import { cn } from "../ui/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { ProgramLatihan } from "@/app/lib/program-mappers";
import type { AbsenAtletApiItem } from "@/api/absen-atlet";
import { useAbsenAtletList } from "@/hooks/use-absen-atlet";
import { getTodayDateString } from "@/app/lib/program-mappers";
import { ErrorState } from "../ui/error-state";
import { EmptyState } from "../ui/empty-state";

interface AbsenMonitorScreenProps {
  program: ProgramLatihan;
  onBack: () => void;
}

function hasGps(item: AbsenAtletApiItem) {
  const lat = item.latitude ?? item.foto?.latitude;
  const lng = item.longitude ?? item.foto?.longitude;
  return lat != null && lng != null && lat !== "" && lng !== "";
}

function getMapsUrl(item: AbsenAtletApiItem) {
  const lat = item.latitude ?? item.foto?.latitude;
  const lng = item.longitude ?? item.foto?.longitude;
  if (lat == null || lng == null || lat === "" || lng === "") return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function getLokasiLabel(item: AbsenAtletApiItem) {
  if (item.lokasi) return item.lokasi;
  if (item.foto?.lokasi) return item.foto.lokasi;
  const lat = item.latitude ?? item.foto?.latitude;
  const lng = item.longitude ?? item.foto?.longitude;
  if (lat != null && lng != null) return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
  return null;
}

export const AbsenMonitorScreen: React.FC<AbsenMonitorScreenProps> = ({ program, onBack }) => {
  const [tanggal, setTanggal] = React.useState(getTodayDateString());
  const absenQuery = useAbsenAtletList(program.id, { tanggal, enabled: !!tanggal });
  const records = absenQuery.data ?? [];

  const verifiedCount = records.filter((item) => hasGps(item)).length;

  return (
    <div className="flex flex-col min-h-full bg-background pb-8">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 pt-4 pb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">Monitoring Absen Atlet</h1>
            <p className="text-xs text-muted-foreground truncate">{program.nama_program}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        <Card className="p-4 border border-border bg-surface shadow-sm space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Filter Tanggal
            </p>
            <Input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="rounded-xl bg-surface-2 border-border text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-primary/10 px-3 py-2">
              <p className="text-xl font-bold text-primary">{records.length}</p>
              <p className="text-[11px] text-muted-foreground">Absen tercatat</p>
            </div>
            <div className="rounded-xl bg-success/10 px-3 py-2">
              <p className="text-xl font-bold text-success">{verifiedCount}</p>
              <p className="text-[11px] text-muted-foreground">Lokasi terverifikasi (GPS)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Validasi lokasi: absen dengan foto + koordinat GPS dapat dibuka di peta untuk memastikan atlet berada di lokasi latihan.
          </p>
        </Card>

        {absenQuery.isLoading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Memuat data absen...</p>
          </div>
        ) : absenQuery.error ? (
          <ErrorState message="Gagal memuat monitoring absen" onRetry={() => absenQuery.refetch()} />
        ) : records.length === 0 ? (
          <EmptyState
            icon={Camera}
            title="Belum ada absen"
            description={`Tidak ada absen atlet pada tanggal ${format(new Date(`${tanggal}T12:00:00`), "d MMMM yyyy", { locale: idLocale })}.`}
          />
        ) : (
          <div className="space-y-3">
            {records.map((item) => {
              const mapsUrl = getMapsUrl(item);
              const lokasi = getLokasiLabel(item);
              const gpsOk = hasGps(item);

              return (
                <Card key={item.id} className="overflow-hidden border border-border bg-surface shadow-sm">
                  <div className="flex gap-0">
                    {item.foto?.url ? (
                      <a href={item.foto.url} target="_blank" rel="noreferrer" className="w-28 h-28 shrink-0">
                        <img src={item.foto.url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ) : (
                      <div className="w-28 h-28 shrink-0 bg-surface-2 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 p-3 space-y-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{item.atlet_nama ?? "Atlet"}</p>
                          <p className="text-xs text-muted-foreground">{item.status_label}</p>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full shrink-0",
                            gpsOk
                              ? "bg-success/10 text-success"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          )}
                        >
                          {gpsOk ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          {gpsOk ? "GPS OK" : "Tanpa GPS"}
                        </span>
                      </div>

                      {item.waktu_foto && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {item.waktu_foto} WIB
                        </p>
                      )}

                      {lokasi && (
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="break-words">{lokasi}</span>
                        </p>
                      )}

                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary"
                        >
                          Buka di Peta
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
