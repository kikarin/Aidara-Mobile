import * as React from "react";
import { cn } from "./utils";

type PageLoadingSkeletonVariant = "home" | "profile" | "list" | "detail" | "form";

interface PageLoadingSkeletonProps {
  variant?: PageLoadingSkeletonVariant;
  className?: string;
}

function Block({ className }: { className?: string }) {
  return <div className={cn("rounded-xl bg-surface-2 border border-border animate-pulse", className)} />;
}

export const PageLoadingSkeleton: React.FC<PageLoadingSkeletonProps> = ({
  variant = "list",
  className,
}) => {
  if (variant === "profile") {
    return (
      <div className={cn("min-h-screen bg-background pb-28", className)}>
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 px-6 py-4">
          <Block className="h-6 w-20" />
        </div>
        <div className="px-6 py-6 space-y-6">
          <Block className="h-28" />
          <Block className="h-14" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Block key={i} className="h-14" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "home") {
    return (
      <div className={cn("min-h-screen bg-background pb-28", className)}>
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Block className="h-5 w-32" />
              <Block className="h-3 w-40" />
            </div>
            <div className="flex gap-3">
              <Block className="h-10 w-10 rounded-full" />
              <Block className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-6">
          <Block className="h-64" />
          <Block className="h-24" />
          <div className="space-y-3">
            <Block className="h-16" />
            <Block className="h-16" />
            <Block className="h-16" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("min-h-screen bg-background pb-28", className)}>
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 px-4 py-4">
          <div className="flex items-center gap-3">
            <Block className="h-9 w-9 rounded-xl" />
            <Block className="h-5 w-40" />
          </div>
        </div>
        <div className="px-4 py-5 space-y-4">
          <Block className="h-36" />
          <div className="grid grid-cols-2 gap-3">
            <Block className="h-20" />
            <Block className="h-20" />
          </div>
          <Block className="h-48" />
          <Block className="h-14" />
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className={cn("min-h-screen bg-background pb-28", className)}>
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 px-6 py-4">
          <div className="flex items-center gap-3">
            <Block className="h-9 w-9 rounded-xl" />
            <Block className="h-5 w-32" />
          </div>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Block className="h-24 w-24 rounded-full" />
            <Block className="h-4 w-20" />
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <Block className="h-3 w-24" />
              <Block className="h-10 w-full" />
            </div>
          ))}
          <Block className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background pb-28", className)}>
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 px-6 py-4">
        <div className="flex items-center justify-between">
          <Block className="h-6 w-28" />
          <Block className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      <div className="px-6 py-6 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Block key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
};

export const LoadingSkeleton = PageLoadingSkeleton;
