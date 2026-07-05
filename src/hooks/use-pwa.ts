import * as React from "react";
import { toast } from "sonner";
import { registerSW } from "virtual:pwa-register";

const INSTALL_DISMISS_KEY = "aidara-pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isInstallDismissed(): boolean {
  try {
    return localStorage.getItem(INSTALL_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function dismissInstallPrompt(): void {
  try {
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
  } catch {
    // ignore storage errors
  }
}

export function usePwaUpdate(): void {
  React.useEffect(() => {
    if (!import.meta.env.PROD) return;

    let updateToastId: string | number | undefined;

    const updateSW = registerSW({
      onNeedRefresh() {
        updateToastId = toast("Pembaruan tersedia", {
          description: "Versi baru Aidara siap digunakan.",
          duration: Infinity,
          action: {
            label: "Muat ulang",
            onClick: () => {
              void updateSW(true);
            },
          },
        });
      },
      onOfflineReady() {
        toast.success("Siap digunakan offline", {
          description: "Aplikasi dapat dibuka tanpa koneksi internet.",
        });
      },
      onRegisterError(error) {
        console.error("[PWA] Service worker registration failed:", error);
      },
    });

    const handleControllerChange = () => {
      if (updateToastId != null) {
        toast.dismiss(updateToastId);
      }
      toast.success("Aidara diperbarui", {
        description: "Memuat versi terbaru...",
        duration: 2000,
      });
    };

    navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange);

    return () => {
      navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);
}

export function usePwaInstallPrompt(): void {
  const deferredPromptRef = React.useRef<BeforeInstallPromptEvent | null>(null);
  const toastShownRef = React.useRef(false);

  React.useEffect(() => {
    if (!import.meta.env.PROD || isStandaloneMode() || isInstallDismissed()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;

      if (toastShownRef.current) return;
      toastShownRef.current = true;

      toast("Pasang Aidara di perangkat", {
        description: "Akses lebih cepat dari layar utama.",
        duration: Infinity,
        action: {
          label: "Pasang",
          onClick: async () => {
            const promptEvent = deferredPromptRef.current;
            if (!promptEvent) return;

            await promptEvent.prompt();
            const { outcome } = await promptEvent.userChoice;

            if (outcome === "accepted") {
              toast.success("Aidara berhasil dipasang");
            }

            deferredPromptRef.current = null;
          },
        },
        cancel: {
          label: "Nanti",
          onClick: () => {
            dismissInstallPrompt();
            deferredPromptRef.current = null;
          },
        },
      });
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      dismissInstallPrompt();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);
}
