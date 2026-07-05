import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { MedalBadge } from "../ui/medal-badge";
import { Trophy, Plus, Users, TrendingUp, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type MedalType = "gold" | "silver" | "bronze";
type AchievementType = "individual" | "team";

export interface Achievement {
  id: string;
  eventName: string;
  medal: MedalType;
  rank: string;
  level: string;
  date: Date;
  bonus?: number;
  type: AchievementType;
  teamMembers?: string[];
  sport: string;
}

interface PrestasiTabProps {
  achievements: Achievement[];
  onAdd?: () => void;
  onView: (achievement: Achievement) => void;
  onDelete?: (achievementId: string) => void;
  loading?: boolean;
  canAdd?: boolean;
  canDelete?: boolean;
}

export const PrestasiTab: React.FC<PrestasiTabProps> = ({
  achievements,
  onAdd,
  onView,
  onDelete,
  loading = false,
  canAdd = true,
  canDelete = true,
}) => {
  const summary = React.useMemo(() => {
    return {
      total: achievements.length,
      gold: achievements.filter(a => a.medal === "gold").length,
      silver: achievements.filter(a => a.medal === "silver").length,
      bronze: achievements.filter(a => a.medal === "bronze").length
    };
  }, [achievements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="h-20 w-20 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
          <Trophy className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Belum Ada Prestasi
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Catat pencapaian dan prestasi olahraga Anda
        </p>
        <Button onClick={onAdd} disabled={!canAdd || !onAdd}>
          <Plus className="h-4 w-4" />
          Tambah Prestasi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Summary Widget */}
      <Card glow className="bg-gradient-to-br from-accent/5 via-surface to-surface border-accent/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-foreground">Ringkasan Prestasi</h3>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-xl bg-surface-2 border border-border">
              <p className="text-2xl font-bold text-foreground">{summary.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-medal-gold/10 border border-medal-gold/20">
              <p className="text-2xl font-bold text-medal-gold">{summary.gold}</p>
              <p className="text-xs text-muted-foreground mt-1">Emas</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-medal-silver/10 border border-medal-silver/20">
              <p className="text-2xl font-bold text-medal-silver">{summary.silver}</p>
              <p className="text-xs text-muted-foreground mt-1">Perak</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-medal-bronze/10 border border-medal-bronze/20">
              <p className="text-2xl font-bold text-medal-bronze">{summary.bronze}</p>
              <p className="text-xs text-muted-foreground mt-1">Perunggu</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements List */}
      <div className="space-y-3">
        {achievements.map(achievement => (
          <Card
            key={achievement.id}
            className="hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <button type="button" className="flex-1 space-y-1 text-left" onClick={() => onView(achievement)}>
                  <h4 className="font-semibold text-foreground">
                    {achievement.eventName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {achievement.sport}
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  <MedalBadge type={achievement.medal} size="sm" />
                  {canDelete && onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(achievement.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  Juara {achievement.rank}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {achievement.level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {format(achievement.date, "dd MMM yyyy", { locale: id })}
                </Badge>
                {achievement.type === "team" && (
                  <Badge variant="physical" className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Beregu
                  </Badge>
                )}
              </div>

              {/* Team Members */}
              {achievement.type === "team" && achievement.teamMembers && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1.5">Anggota Tim:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {achievement.teamMembers.map((member, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Bonus */}
              {achievement.bonus && achievement.bonus > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">
                    Bonus: Rp {achievement.bonus.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* FAB */}
      {canAdd && onAdd && (
        <button
          onClick={onAdd}
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
