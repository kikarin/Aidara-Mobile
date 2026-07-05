import * as React from "react";
import { Card } from "../ui/card";
import { SportsAvatar } from "../ui/sports-avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ThemeToggle } from "../ui/theme-toggle";
import type { User } from "@/api/types";
import { useProfileBiodata } from "@/hooks/use-profile";
import { PageLoadingSkeleton } from "../ui/page-loading-skeleton";
import {
  User as UserIcon,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface ProfileScreenProps {
  user?: User | null;
  onLogout?: () => void | Promise<void>;
  logoutLoading?: boolean;
  onNavigateToProfileEnhanced?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToHelp?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onLogout,
  logoutLoading,
  onNavigateToProfileEnhanced,
  onNavigateToSettings,
  onNavigateToPrivacy,
  onNavigateToHelp,
}) => {
  const biodataQuery = useProfileBiodata();
  const biodata = biodataQuery.data;

  const displayName = biodata?.biodata.nama ?? user?.name ?? "Pengguna";
  const displayEmail = user?.email ?? "";
  const roleLabels: Record<string, string> = {
    atlet: "Atlet",
    pelatih: "Pelatih",
    tenaga_pendukung: "Tenaga Pendukung",
  };
  const roleName = biodata?.role ? roleLabels[biodata.role] : user?.current_role?.name;
  const avatar = biodata?.biodata.foto_thumbnail || biodata?.biodata.foto || undefined;
  const initials = getInitials(displayName);

  const menuItems = [
    { icon: UserIcon, label: "Profil Lengkap", value: "Lihat Detail", onClick: onNavigateToProfileEnhanced },
    { icon: Settings, label: "Pengaturan", value: null, onClick: onNavigateToSettings },
    { icon: Shield, label: "Privasi & Keamanan", value: null, onClick: onNavigateToPrivacy },
    { icon: HelpCircle, label: "Bantuan & Dukungan", value: null, onClick: onNavigateToHelp },
  ];

  if (biodataQuery.isLoading && !biodata) {
    return <PageLoadingSkeleton variant="profile" />;
  }

  return (
    <div className="min-h-screen bg-background pb-28 transition-colors duration-300">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="px-6 py-4">
          <h2 className="text-xl font-bold text-foreground">Profil</h2>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Card glow className="bg-gradient-to-br from-primary/5 via-surface to-surface border-primary/20">
          <div className="flex items-center gap-4">
            <SportsAvatar src={avatar} fallback={initials || "AU"} size="xl" alt={displayName} />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">{displayName}</h3>
              <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="success">{user?.is_active ? "Aktif" : "Nonaktif"}</Badge>
                {roleName && <Badge variant="secondary">{roleName}</Badge>}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground">Tema</span>
            </div>
            <ThemeToggle variant="button" />
          </div>
        </Card>

        <Card>
          <div className="divide-y divide-border">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Button
          variant="destructive"
          className="w-full"
          loading={logoutLoading}
          onClick={() => onLogout?.()}
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </Button>

        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">Aidara — Dispora Kabupaten Bogor</p>
          <p className="text-xs text-muted-foreground/70">Versi 1.0.0</p>
        </div>
      </div>
    </div>
  );
};
