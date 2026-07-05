import * as React from "react";
import { Card } from "../ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../ui/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "accent" | "success";
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendValue,
  icon,
  variant = "default"
}) => {
  const variants = {
    default: "border-border",
    primary: "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent",
    accent: "border-accent/20 bg-gradient-to-br from-accent/5 to-transparent",
    success: "border-success/20 bg-gradient-to-br from-success/5 to-transparent"
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-trend-up" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-trend-down" />;
      case "stable":
        return <Minus className="h-4 w-4 text-trend-stable" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-trend-up";
      case "down":
        return "text-trend-down";
      default:
        return "text-trend-stable";
    }
  };

  return (
    <Card className={cn("relative overflow-hidden", variants[variant])}>
      {icon && (
        <div className="absolute top-3 right-3 opacity-20">
          {icon}
        </div>
      )}

      <div className="relative z-10">
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              {trendValue && (
                <span className={cn("text-sm font-semibold", getTrendColor())}>
                  {trendValue}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
