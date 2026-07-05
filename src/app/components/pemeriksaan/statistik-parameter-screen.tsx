import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { cn } from "../ui/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, Cell,
} from "recharts";
import { useParameterStatistik } from "@/hooks/use-pemeriksaan";
import {
  buildAverageTrendData,
  buildLatestValuesDistribution,
  getStatistikSummary,
} from "@/app/lib/pemeriksaan-mappers";
import { ErrorState } from "../ui/error-state";
import { parseApiError } from "@/hooks/use-api-error";
import { usePemeriksaanAccess } from "@/hooks/use-pemeriksaan-access";

interface StatistikParameterScreenProps {
  parameterId: number;
  caborId?: number;
  paramNama?: string;
  satuan?: string;
  onBack: () => void;
}

export const StatistikParameterScreen: React.FC<StatistikParameterScreenProps> = ({
  parameterId,
  caborId,
  paramNama,
  satuan: satuanProp,
  onBack,
}) => {
  const statistikQuery = useParameterStatistik(parameterId, caborId ? { cabor_id: caborId } : undefined);
  const { isViewOnly, biodataId } = usePemeriksaanAccess();

  const error = statistikQuery.error ? parseApiError(statistikQuery.error) : null;
  const parameter = statistikQuery.data?.parameter;
  const allPeserta = statistikQuery.data?.peserta ?? [];
  const peserta = React.useMemo(() => {
    if (!isViewOnly || biodataId == null) return allPeserta;
    return allPeserta.filter((p) => p.biodata_id === biodataId);
  }, [allPeserta, biodataId, isViewOnly]);

  const paramName = paramNama ?? parameter?.nama ?? "Parameter";
  const satuan = satuanProp ?? parameter?.satuan ?? "";

  const allHistories = peserta.flatMap((p) => p.history);
  const trendData = buildAverageTrendData(allHistories);
  const distribution = buildLatestValuesDistribution(peserta);
  const trendValues = trendData.map((d) => d.nilai);
  const summary = getStatistikSummary(trendValues);

  const delta = summary.last - summary.prev;
  const trendUp = delta > 0;

  if (statistikQuery.isLoading) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Memuat statistik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-4">
        <ErrorState message={error.message} onRetry={() => statistikQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-background pb-tab-bar">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-base font-bold">{paramName}</h1>
          <p className="text-xs text-muted-foreground">Statistik Parameter · {satuan}</p>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Minimum", value: summary.min.toFixed(1), color: "text-success", icon: TrendingDown },
            { label: "Rata-rata", value: summary.avg.toFixed(1), color: "text-accent-2", icon: Minus },
            { label: "Maksimum", value: summary.max.toFixed(1), color: "text-primary", icon: TrendingUp },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-3 border border-border bg-surface shadow-sm text-center">
                <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label} <span className="font-mono">{satuan}</span></p>
              </Card>
            );
          })}
        </div>

        {trendData.length > 1 && (
          <Card className="p-4 border border-border bg-surface shadow-sm flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              trendUp ? "bg-destructive/10" : "bg-success/10"
            )}>
              {trendUp
                ? <TrendingUp className="h-5 w-5 text-destructive" />
                : <TrendingDown className="h-5 w-5 text-success" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {delta === 0 ? "Stabil" : trendUp ? "Naik" : "Turun"} {Math.abs(delta).toFixed(1)} {satuan}
              </p>
              <p className="text-xs text-muted-foreground">dibanding periode sebelumnya</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-lg font-bold text-foreground">{summary.last.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground font-mono">{satuan}</p>
            </div>
          </Card>
        )}

        {trendData.length > 0 ? (
          <Card className="p-4 border border-border bg-surface shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">Tren Nilai</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                />
                {summary.avg > 0 && (
                  <ReferenceLine
                    y={summary.avg}
                    stroke="var(--color-accent-2)"
                    strokeDasharray="4 4"
                    label={{ value: "Rata-rata", fontSize: 10, fill: "var(--color-accent-2)" }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="nilai"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--color-primary)" }}
                  name={paramName}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ) : (
          <Card className="p-4 border border-dashed border-border text-center text-sm text-muted-foreground">
            Belum ada data tren
          </Card>
        )}

        {distribution.length > 0 && !isViewOnly && (
          <Card className="p-4 border border-border bg-surface shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">Distribusi Nilai</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Peserta" radius={[6, 6, 0, 0]}>
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={`var(--color-chart-${(i % 5) + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {trendData.length > 0 && (
          <Card className="p-4 border border-border bg-surface shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-3">Riwayat Data</h3>
            <div className="space-y-2">
              {trendData.map((d, i) => {
                const prev = trendData[i - 1];
                const diff = prev ? d.nilai - prev.nilai : 0;
                return (
                  <div key={`${d.tanggal}-${i}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{d.tanggal}</span>
                    <div className="flex items-center gap-2">
                      {prev && (
                        <span className={cn("text-xs", diff < 0 ? "text-success" : diff > 0 ? "text-destructive" : "text-muted-foreground")}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-foreground">
                        {d.nilai} <span className="font-normal text-xs text-muted-foreground">{satuan}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
