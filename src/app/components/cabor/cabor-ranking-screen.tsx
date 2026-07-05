import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { SportsAvatar } from "../ui/sports-avatar";
import { Button } from "../ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { ErrorState } from "../ui/error-state";
import { EmptyState } from "../ui/empty-state";
import { CaborRankingComparisonDialog } from "./cabor-ranking-comparison-dialog";
import { useCaborPeserta, useCaborRanking } from "@/hooks/use-cabor";
import {
  buildPesertaAvatarMap,
  mapRankingList,
  type CaborRankingRow,
} from "@/app/lib/cabor-mappers";
import { parseApiError } from "@/hooks/use-api-error";

interface CaborRankingScreenProps {
  caborId: string;
  caborName: string;
  onBack: () => void;
}

export const CaborRankingScreen: React.FC<CaborRankingScreenProps> = ({
  caborId,
  caborName,
  onBack,
}) => {
  const [selectedPeserta, setSelectedPeserta] = React.useState<CaborRankingRow | null>(null);
  const [comparisonOpen, setComparisonOpen] = React.useState(false);

  const rankingQuery = useCaborRanking(caborId);
  const pesertaQuery = useCaborPeserta(caborId);
  const error = rankingQuery.error ? parseApiError(rankingQuery.error) : null;

  const avatarMap = React.useMemo(
    () => (pesertaQuery.data ? buildPesertaAvatarMap(pesertaQuery.data) : new Map<string, string>()),
    [pesertaQuery.data]
  );

  const rankings = React.useMemo(
    () => mapRankingList(rankingQuery.data?.ranking_total_rata_rata ?? [], avatarMap),
    [rankingQuery.data?.ranking_total_rata_rata, avatarMap]
  );

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-medal-gold";
    if (rank === 2) return "text-medal-silver";
    if (rank === 3) return "text-medal-bronze";
    return "text-muted-foreground";
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-medal-gold/10 border-medal-gold/30";
    if (rank === 2) return "bg-medal-silver/10 border-medal-silver/30";
    if (rank === 3) return "bg-medal-bronze/10 border-medal-bronze/30";
    return "bg-surface-2 border-border";
  };

  const handlePesertaClick = (entry: CaborRankingRow) => {
    setSelectedPeserta(entry);
    setComparisonOpen(true);
  };

  const RankingRow: React.FC<{ entry: CaborRankingRow }> = ({ entry }) => (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
      onClick={() => handlePesertaClick(entry)}
    >
      <div className="flex items-center gap-4">
        <div
          className={`h-12 w-12 rounded-xl ${getRankBg(entry.rank)} flex items-center justify-center flex-shrink-0`}
        >
          <span className={`text-lg font-bold ${getRankColor(entry.rank)}`}>{entry.rank}</span>
        </div>
        <SportsAvatar
          src={entry.avatar}
          fallback={entry.name.substring(0, 2).toUpperCase()}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{entry.name}</h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {entry.age !== "-" && (
              <Badge variant="outline" className="text-xs">
                {entry.age} tahun
              </Badge>
            )}
            {entry.position !== "-" && (
              <Badge variant="secondary" className="text-xs">
                {entry.position}
              </Badge>
            )}
            {entry.predikatLabel && (
              <Badge variant="secondary" className="text-xs">
                {entry.predikatLabel}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-primary">{entry.score}</div>
          <p className="text-xs text-muted-foreground">Skor</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">Ranking</h2>
            <p className="text-sm text-muted-foreground">{caborName}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-3">
        {rankingQuery.isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-card bg-surface-2 border border-border animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <ErrorState
            type={error.statusCode === 403 ? "403" : "generic"}
            message={error.message}
            onRetry={() => void rankingQuery.refetch()}
          />
        )}

        {!rankingQuery.isLoading && !error && rankings.length === 0 && (
          <EmptyState
            icon={Trophy}
            title="Belum Ada Data Ranking"
            description="Data ranking akan muncul setelah pemeriksaan dilakukan"
          />
        )}

        {!rankingQuery.isLoading && !error && rankings.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground px-1">
              Ketuk peserta untuk melihat perbandingan 3 tes terakhir
            </p>
            {rankings.map((entry) => (
              <RankingRow key={`${entry.pesertaType}-${entry.id}`} entry={entry} />
            ))}
          </>
        )}
      </div>

      <CaborRankingComparisonDialog
        open={comparisonOpen}
        onOpenChange={setComparisonOpen}
        caborId={caborId}
        peserta={selectedPeserta}
      />
    </div>
  );
};
