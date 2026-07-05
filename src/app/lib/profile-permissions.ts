import type { PesertaRole } from "@/api/profile-types";

const ROLE_LABELS: Record<PesertaRole, string> = {
  atlet: "Atlet",
  pelatih: "Pelatih",
  tenaga_pendukung: "Tenaga Pendukung",
};

export function getRolePermissionPrefix(role: PesertaRole): string {
  return ROLE_LABELS[role];
}

export function hasPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission);
}

export function canShowBiodata(role: PesertaRole, permissions: string[]): boolean {
  return hasPermission(permissions, `${getRolePermissionPrefix(role)} Show`);
}

export function canEditBiodata(role: PesertaRole, permissions: string[]): boolean {
  return hasPermission(permissions, `${getRolePermissionPrefix(role)} Edit`);
}

export function canAddSertifikat(role: PesertaRole, permissions: string[]): boolean {
  return hasPermission(permissions, `${getRolePermissionPrefix(role)} Sertifikat Add`);
}

export function canDeleteSertifikat(role: PesertaRole, permissions: string[]): boolean {
  return hasPermission(permissions, `${getRolePermissionPrefix(role)} Sertifikat Delete`);
}

export function canAddPrestasi(role: PesertaRole, permissions: string[]): boolean {
  return hasPermission(permissions, `${getRolePermissionPrefix(role)} Prestasi Add`);
}

export function canDeletePrestasi(role: PesertaRole, permissions: string[]): boolean {
  return hasPermission(permissions, `${getRolePermissionPrefix(role)} Prestasi Delete`);
}

export function canAddDokumen(role: PesertaRole, permissions: string[]): boolean {
  return hasPermission(permissions, `${getRolePermissionPrefix(role)} Dokumen Add`);
}

export function canDeleteDokumen(role: PesertaRole, permissions: string[]): boolean {
  return hasPermission(permissions, `${getRolePermissionPrefix(role)} Dokumen Delete`);
}
