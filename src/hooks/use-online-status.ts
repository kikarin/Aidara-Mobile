import * as React from "react";

function readNavigatorOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

async function probeNetworkReachability(): Promise<boolean> {
  if (!readNavigatorOnline()) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    await fetch(`${window.location.origin}/`, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });

    window.clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = React.useState(readNavigatorOnline);
  const probeRequestId = React.useRef(0);

  React.useEffect(() => {
    let cancelled = false;

    const syncFromNavigator = () => {
      if (!cancelled) {
        setIsOnline(readNavigatorOnline());
      }
    };

    const runProbe = async () => {
      const requestId = ++probeRequestId.current;
      const reachable = await probeNetworkReachability();

      if (!cancelled && requestId === probeRequestId.current) {
        setIsOnline(reachable);
      }
    };

    const handleOnline = () => {
      syncFromNavigator();
      void runProbe();
    };

    const handleOffline = () => {
      syncFromNavigator();
    };

    const handleFocus = () => {
      syncFromNavigator();
      void runProbe();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncFromNavigator();
        void runProbe();
      }
    };

    syncFromNavigator();
    void runProbe();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      syncFromNavigator();
      void runProbe();
    }, 5000);

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, []);

  return isOnline;
}

export const OFFLINE_BANNER_HEIGHT = "2.75rem";
