import * as React from "react";
import { Outlet, useNavigate, useParams, Navigate } from "react-router";
import { toast } from "sonner";
import { HomeScreen } from "@/app/components/dashboard/home-screen";
import { ProfileScreen } from "@/app/components/dashboard/profile-screen";
import { ProfileScreenEnhanced } from "@/app/components/profile/profile-screen-enhanced";
import { SettingsScreen } from "@/app/components/profile/settings-screen";
import { PrivacyScreen } from "@/app/components/profile/privacy-screen";
import { HelpScreen } from "@/app/components/profile/help-screen";
import { LegalPageScreen } from "@/app/components/legal/legal-page-screen";
import { PrestasiGlobalScreen } from "@/app/components/prestasi/prestasi-global-screen";
import { PemeriksaanMainScreen } from "@/app/components/pemeriksaan/pemeriksaan-main-screen";
import { useAuth } from "@/hooks/use-auth";
import { prefetchAllOptions } from "@/hooks/use-options";
import { queryClient } from "@/app/lib/query-client";
import { LEGAL_PAGES, type LegalPageSlug } from "@/app/lib/legal-content";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <HomeScreen
      onNavigateToCabor={() => navigate("/cabor")}
      onNavigateToPrestasi={() => navigate("/prestasi")}
      onSelectCabor={(cabor) => navigate(`/cabor/${cabor.id}`)}
      onSelectProgram={(programId) => navigate(`/program/${programId}`)}
    />
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, isSubmitting } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast.success("Anda telah keluar");
  };

  return (
    <ProfileScreen
      user={user}
      onLogout={handleLogout}
      logoutLoading={isSubmitting}
      onNavigateToProfileEnhanced={() => navigate("/profile-enhanced")}
      onNavigateToSettings={() => navigate("/settings")}
      onNavigateToPrivacy={() => navigate("/privacy")}
      onNavigateToHelp={() => navigate("/help")}
    />
  );
}

export function ProfileEnhancedPage() {
  const navigate = useNavigate();
  return <ProfileScreenEnhanced onBack={() => navigate("/profil")} />;
}

export function SettingsPage() {
  const navigate = useNavigate();
  return <SettingsScreen onBack={() => navigate("/profil")} />;
}

export function PrivacyPage() {
  const navigate = useNavigate();
  return <PrivacyScreen onBack={() => navigate("/profil")} />;
}

export function HelpPage() {
  const navigate = useNavigate();
  return <HelpScreen onBack={() => navigate("/profil")} />;
}

export function LegalPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const legalSlug = slug as LegalPageSlug | undefined;

  if (!legalSlug || !(legalSlug in LEGAL_PAGES)) {
    return <Navigate to="/legal/terms" replace />;
  }

  return <LegalPageScreen slug={legalSlug} onBack={() => navigate(-1)} />;
}

export function PrestasiPage() {
  const navigate = useNavigate();
  return <PrestasiGlobalScreen onBack={() => navigate("/")} />;
}

export function PemeriksaanPage() {
  const navigate = useNavigate();
  return <PemeriksaanMainScreen onBack={() => navigate("/")} />;
}

export function AuthPrefetch() {
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      void prefetchAllOptions(queryClient);
    }
  }, [isAuthenticated]);

  return <Outlet />;
}
