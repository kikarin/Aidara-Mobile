import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as absenApi from "@/api/absen-atlet";
import type { StoreAbsenAtletPayload } from "@/api/absen-atlet";
import { useAuth } from "@/hooks/use-auth";

export const absenAtletKeys = {
  all: ["absen-atlet"] as const,
  list: (programId: string, filters?: { bulan?: string; tanggal?: string }) =>
    ["absen-atlet", "list", programId, filters ?? {}] as const,
  today: (programId: string) => ["absen-atlet", "today", programId] as const,
  riwayat: (programId: string, atletId: number) =>
    ["absen-atlet", "riwayat", programId, atletId] as const,
};

export function useAbsenAtletList(
  programId: string,
  filters?: { bulan?: string; tanggal?: string; enabled?: boolean }
) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: absenAtletKeys.list(programId, filters),
    queryFn: () =>
      absenApi.getAbsenAtletList(Number(programId), {
        bulan: filters?.bulan,
        tanggal: filters?.tanggal,
      }),
    enabled: isAuthenticated && !!programId && (filters?.enabled ?? true),
  });
}

export function useAbsenAtletToday(programId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: absenAtletKeys.today(programId),
    queryFn: () => absenApi.getAbsenAtletToday(Number(programId)),
    enabled: isAuthenticated && !!programId,
  });
}

export function useCreateAbsenAtlet(programId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StoreAbsenAtletPayload) =>
      absenApi.createAbsenAtlet(Number(programId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: absenAtletKeys.list(programId) });
      queryClient.invalidateQueries({ queryKey: absenAtletKeys.today(programId) });
    },
  });
}
