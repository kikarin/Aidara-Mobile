import * as React from "react";
import { cn } from "./utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown> | unknown;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const PULL_THRESHOLD = 72;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className,
  disabled = false,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startYRef = React.useRef(0);
  const pullingRef = React.useRef(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleTouchStart = (event: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    pullingRef.current = true;
    startYRef.current = event.touches[0]?.clientY ?? 0;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!pullingRef.current || disabled || isRefreshing) return;
    const currentY = event.touches[0]?.clientY ?? 0;
    const distance = Math.max(0, Math.min(currentY - startYRef.current, 120));
    if (distance > 0) {
      setPullDistance(distance);
    }
  };

  const finishPull = async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-end justify-center overflow-hidden transition-[height] duration-200",
          pullDistance > 0 || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{ height: isRefreshing ? 48 : pullDistance * 0.5 }}
      >
        <span className="pb-2 text-xs font-medium text-muted-foreground">
          {isRefreshing
            ? "Memuat ulang..."
            : pullDistance >= PULL_THRESHOLD
              ? "Lepas untuk memuat ulang"
              : "Tarik untuk memuat ulang"}
        </span>
      </div>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => void finishPull()}
        onTouchCancel={() => void finishPull()}
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.35}px)` : undefined,
          transition: pullingRef.current ? undefined : "transform 200ms ease",
        }}
      >
        {children}
      </div>
    </div>
  );
};
