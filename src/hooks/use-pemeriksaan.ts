import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as pemeriksaanApi from "@/api/pemeriksaan";
import type {
  BulkUpdatePesertaPayload,
  ParameterStatistikParams,
  PemeriksaanListParams,
  StorePemeriksaanPayload,
  UpdatePemeriksaanPayload,
} from "@/api/pemeriksaan-types";
import { useAuth } from "@/hooks/use-auth";

export const pemeriksaanKeys = {
  all: ["pemeriksaan"] as const,
  infinite: (params?: Omit<PemeriksaanListParams, "page" | "per_page">) =>
    ["pemeriksaan", "infinite", params ?? {}] as const,
  detail: (id: string) => ["pemeriksaan", "detail", id] as const,
  peserta: (id: string, jenis?: string) => ["pemeriksaan", "peserta", id, jenis ?? "all"] as const,
  statistik: (parameterId: number, params?: ParameterStatistikParams) =>
    ["pemeriksaan", "statistik", parameterId, params ?? {}] as const,
};

const PAGE_SIZE = 10;

export function usePemeriksaanInfiniteList(
  params?: Omit<PemeriksaanListParams, "page" | "per_page">
) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: pemeriksaanKeys.infinite(params),
    queryFn: ({ pageParam }) =>
      pemeriksaanApi.getPemeriksaanList({
        ...params,
        page: pageParam,
        per_page: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    enabled: isAuthenticated,
  });
}

export function usePemeriksaanDetail(id: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: pemeriksaanKeys.detail(id),
    queryFn: () => pemeriksaanApi.getPemeriksaanDetail(Number(id)),
    enabled: isAuthenticated && !!id,
  });
}

export function usePemeriksaanPeserta(id: string, jenisPeserta?: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: pemeriksaanKeys.peserta(id, jenisPeserta),
    queryFn: () => pemeriksaanApi.getPemeriksaanPeserta(Number(id), jenisPeserta),
    enabled: isAuthenticated && !!id,
  });
}

export function useParameterStatistik(parameterId: number, params?: ParameterStatistikParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: pemeriksaanKeys.statistik(parameterId, params),
    queryFn: () => pemeriksaanApi.getParameterStatistik(parameterId, params),
    enabled: isAuthenticated && parameterId > 0,
  });
}

export function useCreatePemeriksaan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StorePemeriksaanPayload) => pemeriksaanApi.createPemeriksaan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pemeriksaanKeys.all });
    },
  });
}

export function useUpdatePemeriksaan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePemeriksaanPayload }) =>
      pemeriksaanApi.updatePemeriksaan(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pemeriksaanKeys.all });
      queryClient.invalidateQueries({ queryKey: pemeriksaanKeys.detail(String(variables.id)) });
    },
  });
}

export function useDeletePemeriksaan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pemeriksaanApi.deletePemeriksaan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pemeriksaanKeys.all });
    },
  });
}

export function useBulkUpdatePesertaParameter(pemeriksaanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkUpdatePesertaPayload) =>
      pemeriksaanApi.bulkUpdatePesertaParameter(Number(pemeriksaanId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pemeriksaanKeys.detail(pemeriksaanId) });
      queryClient.invalidateQueries({ queryKey: pemeriksaanKeys.peserta(pemeriksaanId) });
      queryClient.invalidateQueries({ queryKey: pemeriksaanKeys.all });
    },
  });
}
