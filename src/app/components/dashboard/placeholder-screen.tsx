import * as React from "react";
import { Card } from "../ui/card";
import { LucideIcon } from "lucide-react";

interface PlaceholderScreenProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title,
  description,
  icon: Icon
}) => {
  return (
    <div className="min-h-screen bg-background pb-28 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="px-6 py-4">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
      </div>

      <div className="px-6 py-6">
        <Card className="flex flex-col items-center justify-center py-16">
          <Icon className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {description}
          </p>
        </Card>
      </div>
    </div>
  );
};
