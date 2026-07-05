import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  ArrowLeft, Plus, Calendar, Camera, FileText, BarChart2,
  Dumbbell, Target, Activity, Brain, Heart, ChevronRight, Pencil, Loader2
} from "lucide-react";
import { cn } from "../ui/utils";
import { format, isToday } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { ProgramLatihan } from "@/app/lib/program-mappers";
import { mapRekapAbsenList, type JenisLatihan, type RekapHarian } from "@/app/lib/program-mappers";
import { useRekapAbsenList } from "@/hooks/use-rekap-absen";
import { ErrorState } from "../ui/error-state";
import { parseApiError } from "@/hooks/use-api-error";

export type { JenisLatihan, RekapHarian };

export const JENIS_CONFIG: Record<JenisLatihan, {
  label: string; icon: React.FC<any>; color: string; bg: string; bgDark: string;
}> = {
  fisik:     { label: "Fisik",     icon: Dumbbell, color: "text-sport-physical",  bg: "bg-blue-100",    bgDark: "dark:bg-blue-900/30" },
  strategi:  { label: "Strategi",  icon: Target,   color: "text-sport-strategy",  bg: "bg-purple-100",  bgDark: "dark:bg-purple-900/30" },
  teknik:    { label: "Teknik",    icon: Activity, color: "text-sport-technique", bg: "bg-green-100",   bgDark: "dark:bg-green-900/30" },
  mental:    { label: "Mental",    icon: Brain,    color: "text-sport-mental",    bg: "bg-amber-100",   bgDark: "dark:bg-amber-900/30" },
  pemulihan: { label: "Pemulihan", icon: Heart,    color: "text-sport-recovery",  bg: "bg-orange-100",  bgDark: "dark:bg-orange-900/30" },
};

const JENIS_LABELS = Object.keys(JENIS_CONFIG) as JenisLatihan[];

interface RekapHomeScreenProps {
  program: ProgramLatihan;
  onBack: () => void;
  onCreateRekap: () => void;
  onEditRekap: (rekap: RekapHarian) => void;
  onViewRekap: (rekap: RekapHarian) => void;
}

export const RekapHomeScreen: React.FC<RekapHomeScreenProps> = ({
  program,
  onBack,
  onCreateRekap,
  onEditRekap,
  onViewRekap,
}) => {
  const [activeFilter, setActiveFilter] = React.useState<JenisLatihan | "semua">("semua");

  const rekapQuery = useRekapAbsenList(program.id);
  const rekaps = React.useMemo(
    () => mapRekapAbsenList(rekapQuery.data?.items ?? [], program.id),
    [rekapQuery.data, program.id]
  );
  const todayRekap = rekaps.find((r) => isToday(r.tanggal));
  const error = rekapQuery.error ? parseApiError(rekapQuery.error) : null;

  const filtered = rekaps.filter((r) =>
    activeFilter === "semua" || r.jenis_latihan === activeFilter
  );

  const statsByJenis = JENIS_LABELS.reduce((acc, j) => {
    acc[j] = rekaps.filter((r) => r.jenis_latihan === j).length;
    return acc;
  }, {} as Record<JenisLatihan, number>);

  return (
    <div className="flex flex-col min-h-full bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">Rekap Latihan</h1>
            <p className="text-xs text-muted-foreground truncate">{program.nama_program}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        {rekapQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Memuat rekap latihan...</p>
          </div>
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => rekapQuery.refetch()} />
        ) : (
          <>
        {/* Program Header Card */}
        <Card className="p-4 border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
              {program.cabor_icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{program.nama_program}</p>
              <p className="text-xs text-muted-foreground">{program.cabor} · {program.kategori}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {format(program.periode_mulai, "d MMM yyyy", { locale: idLocale })} —{" "}
              {format(program.periode_selesai, "d MMM yyyy", { locale: idLocale })}
            </span>
          </div>
        </Card>

        {/* Today Card */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Hari Ini</h2>
          {todayRekap ? (
            <Card className="p-4 border-2 border-primary/30 bg-primary/5 shadow-sm">
              <div className="flex items-start gap-3">
                <TodayJenisIcon jenis={todayRekap.jenis_latihan} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TodayBadge />
                    <span className={cn("text-xs font-semibold", JENIS_CONFIG[todayRekap.jenis_latihan].color)}>
                      {JENIS_CONFIG[todayRekap.jenis_latihan].label}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed line-clamp-2">{todayRekap.keterangan}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Camera className="h-3.5 w-3.5" /> {todayRekap.jumlah_foto} foto</span>
                    <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {todayRekap.jumlah_file} file</span>
                  </div>
                </div>
                <button
                  onClick={() => onEditRekap(todayRekap)}
                  className="shrink-0 w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ) : (
            <Card className="p-5 border-2 border-dashed border-border bg-surface shadow-sm">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
                <p className="font-semibold text-foreground">
                  {format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Rekap latihan hari ini belum diisi</p>
                <button
                  onClick={onCreateRekap}
                  className="w-full py-3 rounded-2xl bg-primary text-white font-semibold text-sm active:scale-[0.98] transition-transform"
                >
                  Isi Rekap Hari Ini
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Stats chips */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Statistik Rekap</h2>
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3 border border-border bg-surface text-center">
              <p className="text-lg font-bold text-foreground">{rekaps.length}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </Card>
            {JENIS_LABELS.slice(0, 5).map((j) => {
              const cfg = JENIS_CONFIG[j];
              const Icon = cfg.icon;
              return (
                <Card key={j} className={cn("p-3 border border-border text-center", cfg.bg, cfg.bgDark)}>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Icon className={cn("h-3 w-3", cfg.color)} />
                    <p className={cn("text-lg font-bold", cfg.color)}>{statsByJenis[j]}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Riwayat Rekap</h2>
            <span className="text-xs text-muted-foreground">{rekaps.length} rekap</span>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-3">
            {(["semua", ...JENIS_LABELS] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors shrink-0",
                  activeFilter === f
                    ? "bg-primary text-white border-primary"
                    : "bg-surface border-border text-muted-foreground"
                )}
              >
                {f === "semua" ? "Semua" : JENIS_CONFIG[f].label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2">
            {filtered.map((rekap) => {
              const cfg = JENIS_CONFIG[rekap.jenis_latihan];
              const Icon = cfg.icon;
              const today = isToday(rekap.tanggal);
              return (
                <Card
                  key={rekap.id}
                  onClick={() => today ? onEditRekap(rekap) : onViewRekap(rekap)}
                  className="p-4 border border-border cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", cfg.bg, cfg.bgDark)}>
                      <Icon className={cn("h-4.5 w-4.5", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}</span>
                        {today && <TodayBadge />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(rekap.tanggal, "EEEE, d MMMM yyyy", { locale: idLocale })}
                      </p>
                      <p className="text-sm text-foreground mt-1 line-clamp-2">{rekap.keterangan}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Camera className="h-3 w-3" /> {rekap.jumlah_foto}</span>
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {rekap.jumlah_file}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
          </>
        )}
      </div>

      {/* FAB if no today rekap */}
      {!todayRekap && !rekapQuery.isLoading && !error && (
        <button
          onClick={onCreateRekap}
          className="fixed bottom-6 right-4 z-40 flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-2xl shadow-lg active:scale-95 transition-transform font-semibold text-sm"
        >
          <Plus className="h-5 w-5" />
          Rekap Hari Ini
        </button>
      )}
    </div>
  );
};

const TodayBadge: React.FC = () => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
    Hari Ini
  </span>
);

const TodayJenisIcon: React.FC<{ jenis: JenisLatihan }> = ({ jenis }) => {
  const cfg = JENIS_CONFIG[jenis];
  const Icon = cfg.icon;
  return (
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cfg.bg, cfg.bgDark)}>
      <Icon className={cn("h-5 w-5", cfg.color)} />
    </div>
  );
};
