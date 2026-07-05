import * as React from "react";
import { useLocation, useNavigate } from "react-router";
import { Home, Users, Activity, Calendar, User } from "lucide-react";
import { cn } from "../ui/utils";

const navItems = [
  { id: "home", label: "Beranda", icon: Home, path: "/" },
  { id: "cabor", label: "Cabor", icon: Users, path: "/cabor" },
  { id: "program", label: "Program", icon: Activity, path: "/program" },
  { id: "pemeriksaan", label: "Pemeriksaan", icon: Calendar, path: "/pemeriksaan" },
  { id: "profil", label: "Profil", icon: User, path: "/profil" },
];

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

function resolveActiveTab(pathname: string): string {
  if (pathname === "/" || pathname === "/home") return "home";
  if (pathname.startsWith("/cabor")) return "cabor";
  if (pathname.startsWith("/program")) return "program";
  if (pathname.startsWith("/pemeriksaan")) return "pemeriksaan";
  if (pathname.startsWith("/profil")) return "profil";
  return "home";
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = activeTab ?? resolveActiveTab(location.pathname);

  const handleTabClick = (item: (typeof navItems)[number]) => {
    if (onTabChange) {
      onTabChange(item.id);
      return;
    }
    navigate(item.path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-4">
        <nav className="flex items-center justify-around rounded-card border border-border bg-surface/95 backdrop-blur-lg px-2 py-3 shadow-lg transition-colors duration-300">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className={cn(
                  "text-xs transition-colors duration-200",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
