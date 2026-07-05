import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as rekapApi from "@/api/rekap-absen";
import type {
  StoreRekapAbsenPayload,
  UpdateRekapAbsenPayload,
} from "@/api/program-latihan-types";
import { useAuth } from "@/hooks/use-auth";

export const rekapKeys = {
  all: ["rekap-absen"] as const,
  list: (programId: string) => ["rekap-absen", "list", programId] as const,
  today: (programId: string) => ["rekap-absen", "today", programId] as const,
};

export function useRekapAbsenList(programId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: rekapKeys.list(programId),
    queryFn: () => rekapApi.getRekapAbsenList(Number(programId)),
    enabled: isAuthenticated && !!programId,
  });
}

export function useRekapAbsenToday(programId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: rekapKeys.today(programId),
    queryFn: () => rekapApi.getRekapAbsenToday(Number(programId)),
    enabled: isAuthenticated && !!programId,
  });
}

export function useCreateRekapAbsen(programId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StoreRekapAbsenPayload) =>
      rekapApi.createRekapAbsen(Number(programId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rekapKeys.list(programId) });
      queryClient.invalidateQueries({ queryKey: rekapKeys.today(programId) });
    },
  });
}

export function useUpdateRekapAbsen(programId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rekapId, payload }: { rekapId: number; payload: UpdateRekapAbsenPayload }) =>
      rekapApi.updateRekapAbsen(Number(programId), rekapId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rekapKeys.list(programId) });
      queryClient.invalidateQueries({ queryKey: rekapKeys.today(programId) });
    },
  });
}

export function useDeleteRekapMedia(programId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rekapId, mediaId }: { rekapId: number; mediaId: number }) =>
      rekapApi.deleteRekapMedia(Number(programId), rekapId, mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rekapKeys.list(programId) });
      queryClient.invalidateQueries({ queryKey: rekapKeys.today(programId) });
    },
  });
}
