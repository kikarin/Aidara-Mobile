import * as React from "react";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../ui/utils";

interface PkVisualisasiSkeletonProps {
  viewOnly?: boolean;
  variant?: "full" | "charts";
  className?: string;
}

export const PkVisualisasiSkeleton: React.FC<PkVisualisasiSkeletonProps> = ({
  viewOnly = false,
  variant = "full",
  className,
}) => {
  const chartsBlock = (
    <>
      <Card className="p-4 border border-border bg-surface shadow-sm space-y-4">
        <Skeleton className="h-4 w-32 rounded-md" />
        <div className="flex items-center justify-center py-2">
          <Skeleton className="h-52 w-52 rounded-full opacity-80" />
        </div>
      </Card>

      <Card className="p-4 border border-border bg-surface shadow-sm space-y-3">
        <Skeleton className="h-4 w-28 rounded-md" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-16 rounded-md shrink-0" />
              <Skeleton className="h-3 flex-1 rounded-full" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-3 border border-border bg-surface shadow-sm space-y-2">
            <Skeleton className="h-2.5 w-20 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-2.5 w-24 rounded-md" />
          </Card>
        ))}
      </div>
    </>
  );

  if (variant === "charts") {
    return <div className={cn("space-y-4", className)}>{chartsBlock}</div>;
  }

  return (
    <div className={cn("px-4 pt-4 space-y-4", className)}>
      {!viewOnly && (
        <Card className="p-4 border border-border bg-surface shadow-sm space-y-3">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-2.5 w-10 rounded-md" />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 border border-border bg-surface shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3.5 w-40 rounded-md" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-6 w-12 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </Card>

      {chartsBlock}
    </div>
  );
};
