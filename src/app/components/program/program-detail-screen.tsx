import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  ArrowLeft, Calendar, BarChart2, Clock, CheckCircle, Edit2, Trash2,
  ChevronRight, Activity, AlertTriangle
} from "lucide-react";
import { cn } from "../ui/utils";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import type { ProgramLatihan } from "@/app/lib/program-mappers";
import { ProgramStageBadge } from "./program-list-screen";
import { useDeleteProgramLatihan } from "@/hooks/use-program-latihan";
import { useRekapAbsenList } from "@/hooks/use-rekap-absen";
import { useAbsenAtletList, useAbsenAtletToday } from "@/hooks/use-absen-atlet";
import { useProgramAccess } from "@/hooks/use-program-access";
import { parseApiError } from "@/hooks/use-api-error";
import { ConfirmDeleteDialog } from "../ui/confirm-delete-dialog";

interface ProgramDetailScreenProps {
  program: ProgramLatihan;
  onBack: () => void;
  onEdit: () => void;
  onOpenRekap: () => void;
  onOpenAbsen?: () => void;
  onOpenMonitoring?: () => void;
  onDeleted: () => void;
}

export const ProgramDetailScreen: React.FC<ProgramDetailScreenProps> = ({
  program,
  onBack,
  onEdit,
  onOpenRekap,
  onOpenAbsen,
  onOpenMonitoring,
  onDeleted,
}) => {
  const deleteMutation = useDeleteProgramLatihan();
  const { isAtlet, canManageProgram } = useProgramAccess();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const rekapQuery = useRekapAbsenList(program.id);
  const absenTodayQuery = useAbsenAtletToday(program.id);
  const absenListQuery = useAbsenAtletList(program.id);
  const rekapCount = rekapQuery.data?.items.length ?? program.jumlah_rekap;
  const absenRecords = absenListQuery.data ?? [];
  const absenSummary = React.useMemo(() => ({
    hadir: absenRecords.filter((item) => item.status === "hadir").length,
    izin: absenRecords.filter((item) => item.status === "izin").length,
    sakit: absenRecords.filter((item) => item.status === "sakit").length,
    alpha: absenRecords.filter((item) => item.status === "alpha").length,
  }), [absenRecords]);
  const today = new Date();
  const totalDays = differenceInDays(program.periode_selesai, program.periode_mulai);
  const elapsed = Math.max(0, differenceInDays(today, program.periode_mulai));
  const remaining = Math.max(0, totalDays - elapsed);
  const progress = Math.min(100, Math.round((elapsed / totalDays) * 100));
  const isActive = !isFuture(program.periode_mulai) && !isPast(program.periode_selesai);
  const isFinished = isPast(program.periode_selesai);
  const isUpcoming = isFuture(program.periode_mulai);

  const statusLabel = isActive ? "Sedang Berjalan" : isFinished ? "Selesai" : "Akan Datang";
  const statusColor = isActive ? "text-success" : isFinished ? "text-muted-foreground" : "text-amber-600";
  const statusDot = isActive ? "bg-success" : isFinished ? "bg-muted-foreground" : "bg-amber-500";

  const summaryCards = isAtlet
    ? [
        { label: "Hadir", value: absenSummary.hadir, icon: CheckCircle, color: "text-success" },
        { label: "Izin", value: absenSummary.izin, icon: Clock, color: "text-amber-600" },
        { label: "Sakit", value: absenSummary.sakit, icon: Activity, color: "text-blue-600" },
        { label: "Alpha", value: absenSummary.alpha, icon: AlertTriangle, color: "text-destructive" },
      ]
    : [
        { label: "Total Rekap", value: rekapCount, icon: BarChart2, color: "text-primary" },
        { label: "Hari Berjalan", value: isUpcoming ? 0 : elapsed, icon: Activity, color: "text-success" },
        { label: "Hari Tersisa", value: isFinished ? 0 : remaining, icon: Clock, color: "text-amber-600" },
        { label: "Persentase", value: `${isFinished ? 100 : isUpcoming ? 0 : progress}%`, icon: CheckCircle, color: "text-accent-2" },
      ];

  return (
    <div className="flex flex-col min-h-full bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 pt-4 pb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">{isAtlet ? "Program Saya" : "Detail Program"}</h1>
            <p className="text-xs text-muted-foreground">Program Latihan</p>
          </div>
          {canManageProgram && (
            <Button variant="ghost" size="icon" onClick={onEdit} className="rounded-xl h-9 w-9 text-muted-foreground">
              <Edit2 className="h-4.5 w-4.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        {/* Hero Card */}
        <Card className="p-4 border border-border bg-surface shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              {program.cabor_icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("w-2 h-2 rounded-full", statusDot)} />
                <span className={cn("text-xs font-medium", statusColor)}>{statusLabel}</span>
              </div>
              <h2 className="font-bold text-foreground leading-tight">{program.nama_program}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{program.cabor} · {program.kategori}</p>
            </div>
          </div>
          <ProgramStageBadge tahap={program.tahap} />
          {program.keterangan && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{program.keterangan}</p>
          )}
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4 border border-border bg-surface shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("h-4 w-4", s.color)} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Timeline — hanya pelatih/admin */}
        {!isAtlet && (
        <Card className="p-4 border border-border bg-surface shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Timeline Program</h3>
          <div className="relative">
            {/* Track */}
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden mb-3">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  isFinished ? "bg-muted-foreground" : "bg-primary"
                )}
                style={{ width: `${isFinished ? 100 : isUpcoming ? 0 : progress}%` }}
              />
            </div>

            {/* Today marker */}
            {isActive && (
              <div
                className="absolute -top-0.5 w-3 h-3 bg-primary border-2 border-white dark:border-surface rounded-full shadow-sm"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            )}

            {/* Labels */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex flex-col items-start">
                <span className="font-semibold text-foreground text-xs">Mulai</span>
                <span>{format(program.periode_mulai, "d MMM yyyy", { locale: idLocale })}</span>
              </div>
              {isActive && (
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-primary text-xs">Hari Ini</span>
                  <span className="text-primary">{format(today, "d MMM", { locale: idLocale })}</span>
                </div>
              )}
              <div className="flex flex-col items-end">
                <span className="font-semibold text-foreground text-xs">Selesai</span>
                <span>{format(program.periode_selesai, "d MMM yyyy", { locale: idLocale })}</span>
              </div>
            </div>
          </div>

          {isActive && (
            <div className="mt-4 p-3 rounded-xl bg-primary/5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progress Program</span>
              <span className="text-sm font-bold text-primary">{progress}% dari {totalDays} hari</span>
            </div>
          )}
        </Card>
        )}

        {/* Out of period warning for rekap */}
        {!isAtlet && isFinished && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Program Selesai</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                Program ini telah berakhir. Rekap tidak dapat ditambahkan.
              </p>
            </div>
          </div>
        )}

        {!isAtlet && isUpcoming && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <Calendar className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Program Belum Dimulai</p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                Dimulai {format(program.periode_mulai, "d MMMM yyyy", { locale: idLocale })}
              </p>
            </div>
          </div>
        )}

        {canManageProgram && program.wajib_absen_atlet && onOpenMonitoring && (
          <Card className="p-4 border border-border bg-surface shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-2">Monitoring Absen Atlet</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Verifikasi foto absen atlet beserta lokasi GPS dan waktu check-in.
            </p>
            <Button variant="outline" className="w-full rounded-xl" onClick={onOpenMonitoring}>
              Buka Monitoring Foto Absen
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Card>
        )}

        {isAtlet && program.wajib_absen_atlet && (
          <Card className="p-4 border border-border bg-surface shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Riwayat Absen Saya</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {absenTodayQuery.data
                    ? `Hari ini sudah absen (${absenTodayQuery.data.status_label})`
                    : "Belum absen hari ini"}
                </p>
              </div>
              {program.absen_window_label && (
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  Jam: {program.absen_window_label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Hadir", value: absenSummary.hadir, color: "text-success" },
                { label: "Izin", value: absenSummary.izin, color: "text-amber-600" },
                { label: "Sakit", value: absenSummary.sakit, color: "text-blue-600" },
                { label: "Alpha", value: absenSummary.alpha, color: "text-destructive" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-surface-2 px-2 py-2">
                  <p className={cn("text-lg font-bold", item.color)}>{item.value}</p>
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>

            {absenListQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Memuat riwayat absen...</p>
            ) : absenRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada riwayat absen pada program ini.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {absenRecords.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    {item.foto?.url ? (
                      <img src={item.foto.url} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-surface-2 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {format(new Date(`${item.tanggal}T12:00:00`), "d MMM yyyy", { locale: idLocale })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.status_label}
                        {item.waktu_foto ? ` · ${item.waktu_foto} WIB` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Created info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Dibuat:{" "}
            {Number.isNaN(program.created_at.getTime())
              ? "-"
              : format(program.created_at, "d MMMM yyyy", { locale: idLocale })}
          </span>
        </div>

        {canManageProgram && (
        <button
          onClick={() => setDeleteOpen(true)}
          disabled={deleteMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Hapus Program
        </button>
        )}
      </div>

      {/* Main CTA */}
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus program latihan?"
        description="Program dan data rekap terkait akan dihapus permanen."
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(Number(program.id));
            toast.success("Program berhasil dihapus");
            onDeleted();
          } catch (error) {
            toast.error(parseApiError(error).message);
          }
        }}
        loading={deleteMutation.isPending}
      />

      {isActive && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-3 bg-background/95 backdrop-blur border-t border-border space-y-2">
          {isAtlet && onOpenAbsen && program.wajib_absen_atlet ? (
            <button
              onClick={onOpenAbsen}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
            >
              <Activity className="h-5 w-5" />
              Absen dengan Foto
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : canManageProgram ? (
            <button
              onClick={onOpenRekap}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
            >
              <Activity className="h-5 w-5" />
              Rekap Latihan Harian
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
