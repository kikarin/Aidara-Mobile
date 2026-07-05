import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, Users, BarChart2, TrendingUp, Edit2, ChevronRight, Activity, Loader2 } from "lucide-react";
import { cn } from "../ui/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Pemeriksaan } from "@/app/lib/pemeriksaan-mappers";
import type { PemeriksaanParameter } from "@/app/lib/pemeriksaan-mappers";
import { StatusPemeriksaanBadge } from "./pemeriksaan-list-screen";
import { usePemeriksaanDetail } from "@/hooks/use-pemeriksaan";
import { mapPemeriksaanDetail } from "@/app/lib/pemeriksaan-mappers";
import { ErrorState } from "../ui/error-state";
import { parseApiError } from "@/hooks/use-api-error";
import { usePemeriksaanAccess } from "@/hooks/use-pemeriksaan-access";

interface PemeriksaanDetailScreenProps {
  pemeriksaan: Pemeriksaan;
  onBack: () => void;
  onEdit: () => void;
  onInputNilai: () => void;
  onStatistik: (param: PemeriksaanParameter) => void;
}

export const PemeriksaanDetailScreen: React.FC<PemeriksaanDetailScreenProps> = ({
  pemeriksaan,
  onBack,
  onEdit,
  onInputNilai,
  onStatistik,
}) => {
  const detailQuery = usePemeriksaanDetail(pemeriksaan.id);
  const { canManagePemeriksaan, canInputNilai, isViewOnly } = usePemeriksaanAccess();
  const mapped = detailQuery.data ? mapPemeriksaanDetail(detailQuery.data) : null;
  const detail = mapped ?? { ...pemeriksaan, parameter: [] as PemeriksaanParameter[] };
  const parameters = detail.parameter ?? [];

  const error = detailQuery.error ? parseApiError(detailQuery.error) : null;

  const summaryCards = isViewOnly
    ? [
        { label: "Parameter", value: detail.jumlah_parameter, icon: BarChart2, color: "text-accent-2" },
      ]
    : [
        { label: "Peserta", value: detail.jumlah_peserta, icon: Users, color: "text-primary" },
        { label: "Parameter", value: detail.jumlah_parameter, icon: BarChart2, color: "text-accent-2" },
        { label: "Progress Input", value: `${detail.progress}%`, icon: TrendingUp, color: detail.status === "selesai" ? "text-success" : "text-amber-600" },
      ];

  if (detailQuery.isLoading && !detailQuery.data) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Memuat detail pemeriksaan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-4">
        <ErrorState message={error.message} onRetry={() => detailQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-background pb-tab-bar">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">Detail Pemeriksaan</h1>
          <p className="text-xs text-muted-foreground">Pemeriksaan Kesehatan</p>
        </div>
        {canManagePemeriksaan && (
          <Button variant="ghost" size="icon" onClick={onEdit} className="rounded-xl h-9 w-9 text-muted-foreground">
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        <Card className="p-4 border border-border bg-surface shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-sm font-bold shrink-0">
              {detail.cabor_icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground leading-tight">{detail.nama}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{detail.cabor} · {detail.kategori}</p>
              <p className="text-xs text-muted-foreground">{format(detail.tanggal, "d MMMM yyyy", { locale: idLocale })}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <StatusPemeriksaanBadge status={detail.status} />
            <span className="text-xs text-muted-foreground">{detail.tenaga_pendukung}</span>
          </div>
          {detail.status === "sebagian" && !isViewOnly && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress Input</span>
                <span className="font-semibold text-amber-600">{detail.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${detail.progress}%` }} />
              </div>
            </div>
          )}
        </Card>

        <div className={cn("grid gap-3", isViewOnly ? "grid-cols-1" : "grid-cols-3")}>
          {summaryCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-3 border border-border bg-surface shadow-sm text-center">
                <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </Card>
            );
          })}
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Parameter Pemeriksaan</h3>
          {parameters.length === 0 ? (
            <Card className="p-4 border border-dashed border-border text-center text-sm text-muted-foreground">
              Belum ada parameter
            </Card>
          ) : (
            <div className="space-y-2">
              {parameters.map((param) => (
                <Card
                  key={param.id}
                  onClick={() => onStatistik(param)}
                  className="px-4 py-3 border border-border cursor-pointer active:scale-[0.98] transition-transform flex items-center gap-3 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{param.nama}</p>
                    <p className="text-xs text-muted-foreground">{param.satuan}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Card>
              ))}
            </div>
          )}
        </div>

        {(canInputNilai || isViewOnly) && (
          <button
            onClick={onInputNilai}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
          >
            <Users className="h-5 w-5" />
            {isViewOnly ? "Lihat Nilai Saya" : "Input Nilai Peserta"}
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
