import * as React from "react";
import { Award } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useTheme } from "../../lib/theme-context";
import { useCaborLastThreePemeriksaan } from "@/hooks/use-cabor";
import {
  buildLastThreeAspekList,
  buildLastThreeRadarChart,
  formatPersentase,
  formatTanggalPanjang,
  getTesCardStyle,
  getTesLabel,
  type CaborRankingRow,
} from "@/app/lib/cabor-mappers";

interface CaborRankingComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caborId: string;
  peserta: CaborRankingRow | null;
}

export const CaborRankingComparisonDialog: React.FC<CaborRankingComparisonDialogProps> = ({
  open,
  onOpenChange,
  caborId,
  peserta,
}) => {
  const { theme } = useTheme();
  const comparisonQuery = useCaborLastThreePemeriksaan(
    caborId,
    open && peserta ? String(peserta.pesertaId) : null,
    peserta?.pesertaType
  );

  const comparisonItems = comparisonQuery.data ?? [];
  const aspekList = React.useMemo(
    () => buildLastThreeAspekList(comparisonItems),
    [comparisonItems]
  );
  const radarChart = React.useMemo(
    () => buildLastThreeRadarChart(comparisonItems, aspekList),
    [comparisonItems, aspekList]
  );

  const tooltipStyle = {
    backgroundColor: theme === "dark" ? "#18181B" : "#FFFFFF",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
    borderRadius: "12px",
    color: theme === "dark" ? "#FFFFFF" : "#0F172A",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            <Award className="h-5 w-5 shrink-0" />
            <span>Perbandingan 3 Tes Terakhir - {peserta?.name ?? ""}</span>
          </DialogTitle>
        </DialogHeader>

        {comparisonQuery.isLoading && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-surface-2 border border-border animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-lg bg-surface-2 border border-border animate-pulse" />
          </div>
        )}

        {!comparisonQuery.isLoading && comparisonItems.length > 0 && aspekList.length > 0 && (
          <div className="space-y-4">
            <div className={`grid gap-3 ${comparisonItems.length >= 3 ? "grid-cols-1" : "grid-cols-2"}`}>
              {comparisonItems.map((item, index) => {
                const style = getTesCardStyle(index);
                return (
                  <div
                    key={item.pemeriksaan_id}
                    className={`p-4 border-2 rounded-lg ${style.border} ${style.bg}`}
                  >
                    <p className={`font-bold text-lg mb-2 ${style.text}`}>
                      {getTesLabel(index, comparisonItems.length)}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      {formatTanggalPanjang(item.tanggal_pemeriksaan)}
                    </p>
                    <p className={`text-sm font-semibold ${style.text}`}>
                      Nilai: {formatPersentase(item.nilai_keseluruhan)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChart.data}>
                  <PolarGrid stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tickCount={5}
                    tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280", fontSize: 10 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => `${Number(value).toFixed(1)}%`}
                  />
                  <Legend />
                  {radarChart.series.map((series) => (
                    <Radar
                      key={series.key}
                      name={series.name}
                      dataKey={series.key}
                      stroke={series.color}
                      fill={series.color}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!comparisonQuery.isLoading && (comparisonItems.length === 0 || aspekList.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Tidak ada data perbandingan tersedia</p>
            <p className="text-sm mt-2">Peserta belum memiliki minimal 2 pemeriksaan fisik</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
