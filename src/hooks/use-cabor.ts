import { useQuery } from "@tanstack/react-query";
import * as caborApi from "@/api/cabor";
import type { CaborListParams } from "@/api/cabor-types";
import { useAuth } from "@/hooks/use-auth";

export const caborKeys = {
  list: (params?: CaborListParams) => ["cabor", "list", params ?? {}] as const,
  peserta: (caborId: string) => ["cabor", "peserta", caborId] as const,
  ranking: (caborId: string) => ["cabor", "ranking", caborId] as const,
  perbandingan: (caborId: string, pemeriksaanIds: number[]) =>
    ["cabor", "perbandingan", caborId, pemeriksaanIds] as const,
  lastThreePemeriksaan: (caborId: string, pesertaId: string, pesertaType?: string) =>
    ["cabor", "last-three-pemeriksaan", caborId, pesertaId, pesertaType ?? ""] as const,
  detail: (caborId: string) => ["cabor", "detail", caborId] as const,
};

export function useCaborList(params?: CaborListParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: caborKeys.list(params),
    queryFn: async () => caborApi.unwrapCaborData(await caborApi.getCaborList(params)),
    enabled: isAuthenticated,
  });
}

export function useCaborPreview() {
  return useCaborList({ limit: 5 });
}

export function useCaborDetail(caborId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: caborKeys.detail(caborId),
    queryFn: async () => {
      const list = caborApi.unwrapCaborData(await caborApi.getCaborList());
      const item = list.find((c) => String(c.id) === caborId);
      if (!item) {
        throw new Error("Cabor tidak ditemukan");
      }
      return item;
    },
    enabled: isAuthenticated && !!caborId,
  });
}

export function useCaborPeserta(caborId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: caborKeys.peserta(caborId),
    queryFn: async () => caborApi.unwrapCaborData(await caborApi.getCaborPeserta(caborId)),
    enabled: isAuthenticated && !!caborId,
  });
}

export function useCaborRanking(caborId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: caborKeys.ranking(caborId),
    queryFn: async () => caborApi.unwrapCaborData(await caborApi.getCaborRanking(caborId)),
    enabled: isAuthenticated && !!caborId,
  });
}

export function useCaborPerbandingan(caborId: string, pemeriksaanIds: number[]) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: caborKeys.perbandingan(caborId, pemeriksaanIds),
    queryFn: () => caborApi.getCaborPerbandingan(caborId, pemeriksaanIds),
    enabled: isAuthenticated && !!caborId && pemeriksaanIds.length >= 2,
  });
}

export function useCaborLastThreePemeriksaan(
  caborId: string,
  pesertaId: string | null,
  pesertaType?: string
) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: caborKeys.lastThreePemeriksaan(caborId, pesertaId ?? "", pesertaType),
    queryFn: async () =>
      caborApi.unwrapCaborData(
        await caborApi.getCaborLastThreePemeriksaan(caborId, pesertaId!, pesertaType)
      ),
    enabled: isAuthenticated && !!caborId && !!pesertaId,
  });
}
