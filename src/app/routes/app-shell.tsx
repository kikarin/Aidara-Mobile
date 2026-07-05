import { Outlet } from "react-router";
import { OfflineBanner } from "@/app/components/ui/offline-banner";
import { PwaManager } from "@/app/components/ui/pwa-manager";
import { Toaster } from "@/app/components/ui/sonner";

export function AppShell() {
  return (
    <>
      <OfflineBanner />
      <div
        className="h-screen w-screen overflow-hidden bg-background transition-colors duration-300"
        style={{ paddingTop: "var(--offline-banner-height, 0px)" }}
      >
        <div className="h-full w-full mx-auto max-w-[390px] relative overflow-y-auto">
          <Outlet />
        </div>
      </div>
      <PwaManager />
      <Toaster />
    </>
  );
}
