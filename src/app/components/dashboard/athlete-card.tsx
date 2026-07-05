import * as React from "react";
import { Card } from "../ui/card";
import { SportsAvatar } from "../ui/sports-avatar";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

interface AthleteCardProps {
  name: string;
  role: string;
  avatar?: string;
  status: "excellent" | "good" | "warning" | "poor";
  sport?: string;
  onClick?: () => void;
}

export const AthleteCard: React.FC<AthleteCardProps> = ({
  name,
  role,
  avatar,
  status,
  sport,
  onClick
}) => {
  const statusConfig = {
    excellent: { variant: "success" as const, label: "Sangat Baik" },
    good: { variant: "physical" as const, label: "Baik" },
    warning: { variant: "warning" as const, label: "Perhatian" },
    poor: { variant: "error" as const, label: "Perlu Evaluasi" }
  };

  return (
    <Card
      className="flex-shrink-0 w-40 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200 active:scale-95"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-3">
        <SportsAvatar
          src={avatar}
          fallback={name.substring(0, 2).toUpperCase()}
          size="lg"
        />
        <div className="text-center w-full">
          <h4 className="font-semibold text-sm text-foreground truncate">{name}</h4>
          <p className="text-xs text-muted-foreground truncate">{role}</p>
          {sport && <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{sport}</p>}
        </div>
        <Badge variant={statusConfig[status].variant} className="w-full justify-center">
          {statusConfig[status].label}
        </Badge>
      </div>
    </Card>
  );
};
