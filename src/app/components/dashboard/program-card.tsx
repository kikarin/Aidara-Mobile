import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Clock, User } from "lucide-react";
import { cn } from "../ui/utils";

interface ProgramCardProps {
  title: string;
  time: string;
  coach: string;
  type: "physical" | "strategy" | "technique" | "mental" | "recovery";
  status: "upcoming" | "ongoing" | "completed";
  onClick?: () => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  title,
  time,
  coach,
  type,
  status,
  onClick
}) => {
  const typeVariants = {
    physical: "physical",
    strategy: "strategy",
    technique: "technique",
    mental: "mental",
    recovery: "recovery"
  } as const;

  const statusConfig = {
    upcoming: { label: "Akan Datang", color: "text-accent" },
    ongoing: { label: "Berlangsung", color: "text-success" },
    completed: { label: "Selesai", color: "text-muted-foreground" }
  };

  return (
    <Card
      className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 active:scale-98"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant={typeVariants[type]}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
        <span className={cn("text-xs font-semibold", statusConfig[status].color)}>
          {statusConfig[status].label}
        </span>
      </div>

      <h4 className="font-semibold text-foreground mb-3">{title}</h4>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          <span>{coach}</span>
        </div>
      </div>
    </Card>
  );
};
