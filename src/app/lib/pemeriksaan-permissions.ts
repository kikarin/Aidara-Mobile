import { hasPermission } from "@/app/lib/profile-permissions";

export function canAddPemeriksaan(permissions: string[]): boolean {
  return hasPermission(permissions, "Pemeriksaan Add");
}

export function canEditPemeriksaan(permissions: string[]): boolean {
  return hasPermission(permissions, "Pemeriksaan Edit");
}

export function canKelolaPesertaPemeriksaan(permissions: string[]): boolean {
  return hasPermission(permissions, "Pemeriksaan Peserta Kelola");
}

export function canAddPemeriksaanKhusus(permissions: string[]): boolean {
  return hasPermission(permissions, "Pemeriksaan Khusus Add");
}

export function canSetupPemeriksaanKhusus(permissions: string[]): boolean {
  return hasPermission(permissions, "Pemeriksaan Khusus Setup");
}

export function canInputHasilPemeriksaanKhusus(permissions: string[]): boolean {
  return hasPermission(permissions, "Pemeriksaan Khusus Input Hasil Tes");
}
