import * as React from "react";
import { Trophy } from "lucide-react";
import { Badge } from "./badge";

type MedalType = "gold" | "silver" | "bronze";

interface MedalBadgeProps {
  type: MedalType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const MedalBadge: React.FC<MedalBadgeProps> = ({
  type,
  size = "md",
  showIcon = true
}) => {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-7 w-7"
  };

  const colors = {
    gold: {
      bg: "bg-medal-gold/10",
      border: "border-medal-gold/30",
      text: "text-medal-gold"
    },
    silver: {
      bg: "bg-medal-silver/10",
      border: "border-medal-silver/30",
      text: "text-medal-silver"
    },
    bronze: {
      bg: "bg-medal-bronze/10",
      border: "border-medal-bronze/30",
      text: "text-medal-bronze"
    }
  };

  const labels = {
    gold: "Emas",
    silver: "Perak",
    bronze: "Perunggu"
  };

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <div
          className={`${sizeClasses[size]} rounded-xl border ${colors[type].bg} ${colors[type].border} flex items-center justify-center`}
        >
          <Trophy className={`${iconSizes[size]} ${colors[type].text}`} />
        </div>
      )}
      <Badge variant={type}>{labels[type]}</Badge>
    </div>
  );
};
