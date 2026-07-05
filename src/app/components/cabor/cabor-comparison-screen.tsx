import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, GitCompare } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "../../lib/theme-context";
import { ErrorState } from "../ui/error-state";
import { EmptyState } from "../ui/empty-state";
import { useCaborPerbandingan, useCaborRanking } from "@/hooks/use-cabor";
import {
  buildCategoryChartFromPerbandingan,
  buildComparisonSummary,
  buildTrendChartFromRanking,
  pickLastPemeriksaanIds,
} from "@/app/lib/cabor-mappers";
import { parseApiError } from "@/hooks/use-api-error";

interface CaborComparisonScreenProps {
  caborId: string;
  caborName: string;
  onBack: () => void;
}

export const CaborComparisonScreen: React.FC<CaborComparisonScreenProps> = ({
  caborId,
  caborName,
  onBack,
}) => {
  const { theme } = useTheme();
  const rankingQuery = useCaborRanking(caborId);

  const pemeriksaanIds = React.useMemo(
    () => pickLastPemeriksaanIds(rankingQuery.data?.pemeriksaan_list ?? []),
    [rankingQuery.data?.pemeriksaan_list]
  );

  const perbandinganQuery = useCaborPerbandingan(caborId, pemeriksaanIds);

  const isLoading = rankingQuery.isLoading || (pemeriksaanIds.length >= 2 && perbandinganQuery.isLoading);
  const error = rankingQuery.error
    ? parseApiError(rankingQuery.error)
    : perbandinganQuery.error
      ? parseApiError(perbandinganQuery.error)
      : null;

  const trendChart = React.useMemo(
    () => buildTrendChartFromRanking(rankingQuery.data?.ranking_perbandingan_3_tes_terakhir ?? []),
    [rankingQuery.data?.ranking_perbandingan_3_tes_terakhir]
  );

  const categoryChart = React.useMemo(
    () =>
      buildCategoryChartFromPerbandingan(
        perbandinganQuery.data?.peserta ?? [],
        perbandinganQuery.data?.aspek_list ?? []
      ),
    [perbandinganQuery.data]
  );

  const summary = React.useMemo(
    () =>
      buildComparisonSummary(
        rankingQuery.data?.ranking_total_rata_rata ?? [],
        rankingQuery.data?.pemeriksaan_list?.length ?? 0,
        rankingQuery.data?.ranking_perbandingan_3_tes_terakhir ?? []
      ),
    [rankingQuery.data]
  );

  const summaryCards = [
    { label: "Rata-rata Skor", value: summary.avgScore, trend: "up" as const, change: "Total peserta" },
    { label: "Jumlah Tes", value: summary.testCount, trend: "stable" as const, change: "Pemeriksaan" },
    {
      label: "Peningkatan",
      value: summary.improvement,
      trend: summary.improvement.startsWith("+") ? ("up" as const) : ("down" as const),
      change: "Tes terakhir",
    },
  ];

  const hasData =
    trendChart.data.length > 0 ||
    categoryChart.data.length > 0 ||
    (rankingQuery.data?.ranking_total_rata_rata?.length ?? 0) > 0;

  const tooltipStyle = {
    backgroundColor: theme === "dark" ? "#18181B" : "#FFFFFF",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
    borderRadius: "12px",
    color: theme === "dark" ? "#FFFFFF" : "#0F172A",
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">Perbandingan</h2>
            <p className="text-sm text-muted-foreground">{caborName}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-card bg-surface-2 border border-border animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-card bg-surface-2 border border-border animate-pulse" />
          </div>
        )}

        {error && (
          <ErrorState
            type={error.statusCode === 403 ? "403" : "generic"}
            message={error.message}
            onRetry={() => {
              void rankingQuery.refetch();
              void perbandinganQuery.refetch();
            }}
          />
        )}

        {!isLoading && !error && !hasData && (
          <EmptyState
            icon={GitCompare}
            title="Belum Ada Data Perbandingan"
            description="Minimal 2 pemeriksaan fisik diperlukan untuk menampilkan perbandingan"
          />
        )}

        {!isLoading && !error && hasData && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {summaryCards.map((item, idx) => {
                const TrendIcon =
                  item.trend === "up" ? TrendingUp : item.trend === "down" ? TrendingDown : Minus;
                const trendColor =
                  item.trend === "up"
                    ? "text-success"
                    : item.trend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground";

                return (
                  <Card key={idx} className="text-center py-4">
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-2">{item.label}</p>
                    <div className={`flex items-center justify-center gap-1 ${trendColor}`}>
                      <TrendIcon className="h-3 w-3" />
                      <span className="text-xs font-medium">{item.change}</span>
                    </div>
                  </Card>
                );
              })}
            </div>

            {trendChart.data.length > 0 && (
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Tren Performa (3 Tes Terakhir)</h3>
                    <Badge variant="physical">Line Chart</Badge>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendChart.data}>
                        <XAxis
                          dataKey="label"
                          stroke={theme === "dark" ? "#A1A1AA" : "#64748B"}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke={theme === "dark" ? "#A1A1AA" : "#64748B"}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        {trendChart.series.map((s) => (
                          <Line
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            name={s.name}
                            stroke={s.color}
                            strokeWidth={2}
                            dot={{ fill: s.color }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}

            {categoryChart.data.length > 0 && (
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Perbandingan Aspek</h3>
                    <Badge variant="strategy">Bar Chart</Badge>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChart.data}>
                        <XAxis
                          dataKey="category"
                          stroke={theme === "dark" ? "#A1A1AA" : "#64748B"}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke={theme === "dark" ? "#A1A1AA" : "#64748B"}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        {categoryChart.series.map((s) => (
                          <Bar
                            key={s.key}
                            dataKey={s.key}
                            name={s.name}
                            fill={s.color}
                            radius={[8, 8, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
