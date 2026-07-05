import { useProfileBiodata } from "@/hooks/use-profile";
import {
  canAddPemeriksaan,
  canAddPemeriksaanKhusus,
  canEditPemeriksaan,
  canInputHasilPemeriksaanKhusus,
  canKelolaPesertaPemeriksaan,
  canSetupPemeriksaanKhusus,
} from "@/app/lib/pemeriksaan-permissions";

export function usePemeriksaanAccess() {
  const biodataQuery = useProfileBiodata();
  const role = biodataQuery.data?.role;
  const permissions = biodataQuery.data?.permissions ?? [];
  const biodataId = biodataQuery.data?.biodata.id;

  const isAtlet = role === "atlet";
  const canManagePemeriksaan = canAddPemeriksaan(permissions) || canEditPemeriksaan(permissions);
  const canInputNilai = canKelolaPesertaPemeriksaan(permissions);
  const canManagePk =
    canAddPemeriksaanKhusus(permissions) ||
    canSetupPemeriksaanKhusus(permissions) ||
    canInputHasilPemeriksaanKhusus(permissions);
  const isViewOnly = isAtlet || (!canManagePemeriksaan && !canInputNilai && !canManagePk);

  return {
    role,
    biodataId,
    permissions,
    isAtlet,
    isViewOnly,
    canManagePemeriksaan,
    canInputNilai,
    canManagePk,
    isLoading: biodataQuery.isLoading,
  };
}
