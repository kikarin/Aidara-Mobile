import { createBrowserRouter, Navigate } from "react-router";
import { AppShell } from "./app-shell";
import { TabLayout } from "./tab-layout";
import { ProtectedRoute, GuestRoute } from "./protected-route";
import { LoginPage, OtpPage } from "./auth-pages";
import {
  AuthPrefetch,
  HelpPage,
  HomePage,
  LegalPage,
  PemeriksaanPage,
  PrestasiPage,
  PrivacyPage,
  ProfileEnhancedPage,
  ProfilePage,
  SettingsPage,
} from "./app-pages";
import {
  CaborComparisonPage,
  CaborDetailPage,
  CaborListFromHomePage,
  CaborListPage,
  CaborParticipantsPage,
  CaborRankingPage,
} from "./cabor-pages";
import {
  ProgramCreatePage,
  ProgramDetailPage,
  ProgramEditPage,
  ProgramListPage,
  RekapCreatePage,
  RekapDetailPage,
  RekapEditPage,
  RekapHomePage,
  AbsenAtletPage,
  AbsenMonitorPage,
} from "./program-pages";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <GuestRoute>
        <AppShell />
      </GuestRoute>
    ),
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: "/otp",
    element: (
      <GuestRoute>
        <AppShell />
      </GuestRoute>
    ),
    children: [{ index: true, element: <OtpPage /> }],
  },
  {
    path: "/legal/:slug",
    element: <AppShell />,
    children: [{ index: true, element: <LegalPage /> }],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { element: <AuthPrefetch />, children: [
        {
          element: <TabLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: "home", element: <Navigate to="/" replace /> },
            { path: "cabor", element: <CaborListPage /> },
            { path: "program", element: <ProgramListPage /> },
            { path: "pemeriksaan", element: <PemeriksaanPage /> },
            { path: "profil", element: <ProfilePage /> },
          ],
        },
        { path: "profile-enhanced", element: <ProfileEnhancedPage /> },
        { path: "settings", element: <SettingsPage /> },
        { path: "privacy", element: <PrivacyPage /> },
        { path: "help", element: <HelpPage /> },
        { path: "prestasi", element: <PrestasiPage /> },
        { path: "cabor-list", element: <CaborListFromHomePage /> },
        { path: "cabor/:caborId", element: <CaborDetailPage /> },
        { path: "cabor/:caborId/participants", element: <CaborParticipantsPage /> },
        { path: "cabor/:caborId/ranking", element: <CaborRankingPage /> },
        { path: "cabor/:caborId/comparison", element: <CaborComparisonPage /> },
        { path: "program/create", element: <ProgramCreatePage /> },
        { path: "program/:programId", element: <ProgramDetailPage /> },
        { path: "program/:programId/edit", element: <ProgramEditPage /> },
        { path: "program/:programId/rekap", element: <RekapHomePage /> },
        { path: "program/:programId/rekap/create", element: <RekapCreatePage /> },
        { path: "program/:programId/rekap/:rekapId", element: <RekapDetailPage /> },
        { path: "program/:programId/rekap/:rekapId/edit", element: <RekapEditPage /> },
        { path: "program/:programId/absen", element: <AbsenAtletPage /> },
        { path: "program/:programId/monitoring", element: <AbsenMonitorPage /> },
      ]},
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
