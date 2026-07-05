import * as React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { BottomNav } from "@/app/components/layout/bottom-nav";

const TAB_PATHS: Record<string, string> = {
  home: "/",
  cabor: "/cabor",
  program: "/program",
  pemeriksaan: "/pemeriksaan",
  profil: "/profil",
};

function resolveActiveTab(pathname: string): string {
  if (pathname === "/" || pathname === "/home") return "home";
  if (pathname.startsWith("/cabor")) return "cabor";
  if (pathname.startsWith("/program")) return "program";
  if (pathname.startsWith("/pemeriksaan")) return "pemeriksaan";
  if (pathname.startsWith("/profil")) return "profil";
  return "home";
}

export function TabLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = resolveActiveTab(location.pathname);

  const showBottomNav = Object.values(TAB_PATHS).includes(location.pathname);

  const handleTabChange = React.useCallback(
    (tab: string) => {
      const path = TAB_PATHS[tab];
      if (path) navigate(path);
    },
    [navigate]
  );

  return (
    <>
      <Outlet />
      {showBottomNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    </>
  );
}
