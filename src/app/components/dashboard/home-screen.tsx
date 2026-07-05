import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ProgramCard } from "./program-card";
import { Users, Trophy, Medal, BarChart2 } from "lucide-react";
import { SportsAvatar } from "../ui/sports-avatar";
import { ThemeToggle } from "../ui/theme-toggle";
import { PullToRefresh } from "../ui/pull-to-refresh";
import { useCaborPreview } from "@/hooks/use-cabor";
import { usePrestasiPreview } from "@/hooks/use-prestasi";
import { useProgramUpcomingPreview } from "@/hooks/use-program-latihan";
import { useHomeDashboard } from "@/hooks/use-home-dashboard";
import { mapCaborList } from "@/app/lib/cabor-mappers";
import { flattenPrestasiPreview } from "@/app/lib/prestasi-mappers";
import { MedalBadge } from "../ui/medal-badge";
import { format, isFuture, isPast } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { ProgramLatihan, TahapProgram } from "@/app/lib/program-mappers";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router";

interface HomeScreenProps {
  onNavigateToCabor?: () => void;
  onNavigateToPrestasi?: () => void;
  onSelectCabor?: (cabor: { id: string; name: string }) => void;
  onSelectProgram?: (programId: string) => void;
}

function mapTahapToProgramType(tahap: TahapProgram): "physical" | "strategy" | "technique" | "mental" | "recovery" {
  switch (tahap) {
    case "persiapan-khusus":
    case "pra-pertandingan":
      return "strategy";
    case "pertandingan":
      return "technique";
    case "transisi":
      return "recovery";
    default:
      return "physical";
  }
}

function getProgramCardStatus(program: ProgramLatihan): "upcoming" | "ongoing" | "completed" {
  if (isFuture(program.periode_mulai)) return "upcoming";
  if (isPast(program.periode_selesai)) return "completed";
  return "ongoing";
}

function formatProgramTime(program: ProgramLatihan): string {
  const start = format(program.periode_mulai, "d MMM", { locale: idLocale });
  const end = format(program.periode_selesai, "d MMM yyyy", { locale: idLocale });
  return `${start} – ${end}`;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToCabor,
  onNavigateToPrestasi,
  onSelectCabor,
  onSelectProgram,
}) => {
  const navigate = useNavigate();
  const dashboard = useHomeDashboard();
  const caborPreviewQuery = useCaborPreview();
  const prestasiPreviewQuery = usePrestasiPreview();
  const programPreviewQuery = useProgramUpcomingPreview(3);

  const caborPreview = React.useMemo(
    () => mapCaborList(caborPreviewQuery.data ?? []),
    [caborPreviewQuery.data]
  );
  const prestasiPreview = React.useMemo(
    () => flattenPrestasiPreview(prestasiPreviewQuery.data?.groups ?? []),
    [prestasiPreviewQuery.data?.groups]
  );
  const upcomingPrograms = programPreviewQuery.data ?? [];

  const displayName = dashboard.pesertaName || "Pengguna";
  const userInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const handleRefresh = async () => {
    await Promise.all([
      dashboard.refetch(),
      caborPreviewQuery.refetch(),
      prestasiPreviewQuery.refetch(),
      programPreviewQuery.refetch(),
    ]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-background pb-28 transition-colors duration-300">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="min-w-0 flex-1 pr-3">
            <h2 className="text-base font-semibold text-foreground truncate">{displayName}</h2>
            <p className="text-xs text-muted-foreground capitalize">
              {format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Profil"
              onClick={() => navigate("/profil")}
              className="rounded-full"
            >
              <SportsAvatar
                src={dashboard.avatar}
                fallback={userInitials || "?"}
                size="md"
                alt={displayName}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        <Card className="p-4 border border-border bg-surface">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Pemeriksaan Fisik</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dashboard.isStaff
                    ? `Atlet tertinggi: ${dashboard.featuredAthleteName || "–"}`
                    : "Rata-rata 3 tes terbaru"}
                </p>
              </div>
              {dashboard.overallScore != null && (
                <div className="shrink-0 text-right">
                  <span className="text-lg font-bold text-foreground">{dashboard.overallScore}</span>
                  <p className="text-[10px] text-muted-foreground">skor rata-rata</p>
                </div>
              )}
            </div>

            {dashboard.isLoading ? (
              <div className="h-56 rounded-xl bg-surface-2 border border-border animate-pulse" />
            ) : dashboard.hasPerformanceData ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={dashboard.radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="aspek"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  />
                  <Radar
                    dataKey="nilai"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    dataKey="target"
                    stroke="var(--accent-2)"
                    fill="var(--accent-2)"
                    fillOpacity={0.08}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <BarChart2 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground px-4">
                  Radar performa akan tersedia setelah data pemeriksaan fisik terkumpul.
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Ranking Cabor</h3>
          <Card className="p-4 border border-border">
            {dashboard.isLoading ? (
              <div className="h-16 rounded-lg bg-surface-2 animate-pulse" />
            ) : dashboard.isStaff ? (
              <div className="flex items-center gap-3">
                <Medal className="h-8 w-8 text-accent shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Atlet Tertinggi — {dashboard.caborName ?? "Cabor"}</p>
                  <p className="text-xl font-bold text-foreground">
                    {dashboard.featuredAthleteName ?? "Belum ada data"}
                  </p>
                  {dashboard.overallScore != null && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Skor rata-rata: {dashboard.overallScore}
                    </p>
                  )}
                </div>
              </div>
            ) : dashboard.participantRank ? (
              <div className="flex items-center gap-3">
                <Medal className="h-8 w-8 text-accent shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Peringkat di {dashboard.caborName ?? "cabor"}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    #{dashboard.participantRank.rank}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      dari {dashboard.participantRank.total} atlet
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Skor rata-rata: {dashboard.participantRank.nilai}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ranking belum tersedia untuk cabor ini.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Skor per Aspek</h3>
          {dashboard.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-card bg-surface-2 border border-border animate-pulse" />
              ))}
            </div>
          ) : dashboard.aspekScores.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Skor per aspek akan tersedia setelah pemeriksaan fisik diinput.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {dashboard.aspekScores.map((aspek) => (
                <Card key={aspek.nama} className="p-4 border border-border">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-medium text-foreground truncate">{aspek.nama}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {aspek.predikat && (
                        <Badge variant="secondary" className="text-xs">
                          {aspek.predikat}
                        </Badge>
                      )}
                      <span className="text-sm font-bold text-primary">{aspek.nilai}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min(100, aspek.nilai)}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Cabang Olahraga</h3>
            <button
              type="button"
              onClick={onNavigateToCabor}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Lihat Semua
            </button>
          </div>
          {caborPreviewQuery.isLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-40 h-44 rounded-card bg-surface-2 border border-border animate-pulse"
                />
              ))}
            </div>
          ) : caborPreview.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-muted-foreground">Belum ada cabang olahraga</p>
            </Card>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
              {caborPreview.map((cabor) => (
                <Card
                  key={cabor.id}
                  className="flex-shrink-0 w-40 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200 active:scale-95"
                  onClick={() => onSelectCabor?.({ id: cabor.id, name: cabor.name })}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {cabor.icon}
                    </div>
                    <div className="text-center w-full">
                      <h4 className="font-semibold text-sm text-foreground truncate">{cabor.name}</h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{cabor.category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{cabor.athleteCount} atlet</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Program Mendatang</h3>
          {programPreviewQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 rounded-card bg-surface-2 border border-border animate-pulse" />
              ))}
            </div>
          ) : upcomingPrograms.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-muted-foreground">Belum ada program aktif</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  title={program.nama_program}
                  time={formatProgramTime(program)}
                  coach={program.cabor}
                  type={mapTahapToProgramType(program.tahap)}
                  status={getProgramCardStatus(program)}
                  onClick={() => onSelectProgram?.(program.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Prestasi Terbaru</h3>
            <button
              type="button"
              onClick={onNavigateToPrestasi}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <Trophy className="h-4 w-4" />
              Lihat Semua
            </button>
          </div>
          {prestasiPreviewQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-card bg-surface-2 border border-border animate-pulse" />
              ))}
            </div>
          ) : prestasiPreview.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-muted-foreground">Belum ada prestasi terbaru</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {prestasiPreview.map((achievement) => (
                <Card key={achievement.id} className="flex items-center gap-4">
                  <SportsAvatar
                    src={achievement.avatar}
                    fallback={achievement.participantName.substring(0, 2).toUpperCase()}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{achievement.eventName}</h4>
                    <p className="text-sm text-muted-foreground truncate">{achievement.participantName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{achievement.cabor}</p>
                  </div>
                  {achievement.medal && (
                    <MedalBadge type={achievement.medal} size="sm" showIcon={false} />
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};
