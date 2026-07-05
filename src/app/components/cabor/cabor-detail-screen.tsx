import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowLeft, Users, UserCog, Briefcase, TrendingUp, GitCompare } from "lucide-react";
import { ErrorState } from "../ui/error-state";
import { useCaborDetail } from "@/hooks/use-cabor";
import { mapCaborItem } from "@/app/lib/cabor-mappers";
import { parseApiError } from "@/hooks/use-api-error";

interface CaborDetailScreenProps {
  caborId: string;
  onBack: () => void;
  onNavigateTo: (screen: "participants" | "ranking" | "comparison") => void;
}

export const CaborDetailScreen: React.FC<CaborDetailScreenProps> = ({
  caborId,
  onBack,
  onNavigateTo,
}) => {
  const detailQuery = useCaborDetail(caborId);
  const error = detailQuery.error ? parseApiError(detailQuery.error) : null;

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background pb-28 px-6 py-6 space-y-4">
        <div className="h-48 rounded-card bg-surface-2 border border-border animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-card bg-surface-2 border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !detailQuery.data) {
    return (
      <div className="min-h-screen bg-background pb-28 px-6 py-6">
        <ErrorState
          type={error?.statusCode === 403 ? "403" : "generic"}
          message={error?.message || "Cabor tidak ditemukan"}
          onRetry={() => void detailQuery.refetch()}
        />
      </div>
    );
  }

  const cabor = mapCaborItem(detailQuery.data);
  const totalMembers = cabor.athleteCount + cabor.coachCount + cabor.supportStaffCount;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">Detail Cabor</h2>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Card glow className="bg-gradient-to-br from-primary/5 via-surface to-surface border-primary/20">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-3xl bg-surface-2 border-2 border-border flex items-center justify-center text-2xl font-bold text-primary shadow-lg">
              {cabor.icon}
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">{cabor.name}</h1>
              <p className="text-sm text-muted-foreground max-w-md">{cabor.description}</p>
              <Badge variant="outline">{cabor.category}</Badge>
            </div>
            <div className="w-full pt-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground">{totalMembers}</span>
                <span className="text-sm text-muted-foreground">Total Anggota</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center py-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{cabor.athleteCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Atlet</p>
          </Card>

          <Card className="text-center py-4">
            <div className="h-10 w-10 rounded-xl bg-accent-2/10 flex items-center justify-center mx-auto mb-2">
              <UserCog className="h-5 w-5 text-accent-2" />
            </div>
            <p className="text-2xl font-bold text-foreground">{cabor.coachCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Pelatih</p>
          </Card>

          <Card className="text-center py-4">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-2">
              <Briefcase className="h-5 w-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">{cabor.supportStaffCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Pendukung</p>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Navigasi Cepat</h3>

          <Card
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
            onClick={() => onNavigateTo("participants")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Peserta</h4>
                  <p className="text-sm text-muted-foreground">
                    Lihat daftar atlet, pelatih, dan pendukung
                  </p>
                </div>
              </div>
              <Badge>{totalMembers}</Badge>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
            onClick={() => onNavigateTo("ranking")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Ranking</h4>
                  <p className="text-sm text-muted-foreground">
                    Peringkat berdasarkan hasil pemeriksaan
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
            onClick={() => onNavigateTo("comparison")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-accent-2/10 flex items-center justify-center">
                  <GitCompare className="h-6 w-6 text-accent-2" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Perbandingan</h4>
                  <p className="text-sm text-muted-foreground">
                    Analisis dan tren performa atlet
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
