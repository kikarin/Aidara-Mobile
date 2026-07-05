import * as React from "react";
import { WifiOff } from "lucide-react";
import { OFFLINE_BANNER_HEIGHT, useOnlineStatus } from "@/hooks/use-online-status";

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--offline-banner-height",
      isOnline ? "0px" : OFFLINE_BANNER_HEIGHT
    );

    return () => {
      document.documentElement.style.setProperty("--offline-banner-height", "0px");
    };
  }, [isOnline]);

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-1/2 z-[200] flex w-full max-w-[390px] -translate-x-1/2 items-center justify-center gap-2 bg-destructive px-4 py-2.5 text-center text-sm font-medium text-destructive-foreground shadow-md"
      style={{ minHeight: OFFLINE_BANNER_HEIGHT }}
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>Tidak ada koneksi internet. Beberapa fitur mungkin tidak tersedia.</span>
    </div>
  );
};
