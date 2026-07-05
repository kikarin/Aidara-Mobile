import { useProfileBiodata } from "@/hooks/use-profile";

export function useProgramAccess() {
  const biodataQuery = useProfileBiodata();
  const role = biodataQuery.data?.role;
  const isAtlet = role === "atlet";
  const isPelatih = role === "pelatih";
  const canManageProgram = !isAtlet;

  return {
    role,
    isAtlet,
    isPelatih,
    canManageProgram,
    isLoading: biodataQuery.isLoading,
  };
}
