import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as pkApi from "@/api/pemeriksaan-khusus";
import type {
  CloneTemplatePayload,
  PkListParams,
  SaveHasilTesPayload,
  SavePkSetupPayload,
  SaveTemplatePayload,
  StorePkPayload,
  UpdatePkPayload,
} from "@/api/pemeriksaan-khusus-types";
import { useAuth } from "@/hooks/use-auth";

export const pkKeys = {
  all: ["pemeriksaan-khusus"] as const,
  infinite: (params?: Omit<PkListParams, "page" | "per_page">) =>
    ["pemeriksaan-khusus", "infinite", params ?? {}] as const,
  setup: (id: string) => ["pemeriksaan-khusus", "setup", id] as const,
  setupPeserta: (id: string, pesertaId: number) =>
    ["pemeriksaan-khusus", "setup-peserta", id, pesertaId] as const,
  pesertaHasilTes: (id: string, jenis?: string) =>
    ["pemeriksaan-khusus", "peserta-hasil-tes", id, jenis ?? "atlet"] as const,
  hasilTes: (id: string, jenis?: string) =>
    ["pemeriksaan-khusus", "hasil-tes", id, jenis ?? "atlet"] as const,
  pesertaVisualisasi: (id: string) => ["pemeriksaan-khusus", "peserta-visualisasi", id] as const,
  visualisasi: (id: string, pesertaId: number) =>
    ["pemeriksaan-khusus", "visualisasi", id, pesertaId] as const,
  template: (caborId: number) => ["pemeriksaan-khusus", "template", caborId] as const,
};

const PAGE_SIZE = 10;

function invalidatePkDetail(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  queryClient.invalidateQueries({ queryKey: pkKeys.all });
  queryClient.invalidateQueries({ queryKey: pkKeys.setup(id) });
  queryClient.invalidateQueries({ queryKey: pkKeys.pesertaHasilTes(id) });
  queryClient.invalidateQueries({ queryKey: pkKeys.hasilTes(id) });
  queryClient.invalidateQueries({ queryKey: pkKeys.pesertaVisualisasi(id) });
}

export function usePkInfiniteList(params?: Omit<PkListParams, "page" | "per_page">) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: pkKeys.infinite(params),
    queryFn: ({ pageParam }) =>
      pkApi.getPkList({ ...params, page: pageParam, per_page: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    enabled: isAuthenticated,
  });
}

export function usePkSetup(id: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: pkKeys.setup(id),
    queryFn: () => pkApi.getPkSetup(Number(id)),
    enabled: isAuthenticated && !!id,
  });
}

export function usePkSetupPeserta(id: string, pesertaId: number) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: pkKeys.setupPeserta(id, pesertaId),
    queryFn: () => pkApi.getPkSetupPeserta(Number(id), pesertaId),
    enabled: isAuthenticated && !!id && pesertaId > 0,
  });
}

export function usePkPesertaHasilTes(id: string, jenisPeserta = "atlet") {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: pkKeys.pesertaHasilTes(id, jenisPeserta),
    queryFn: () => pkApi.getPkPesertaHasilTes(Number(id), jenisPeserta),
    enabled: isAuthenticated && !!id,
  });
}

export function usePkHasilTes(id: string, jenisPeserta = "atlet") {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: pkKeys.hasilTes(id, jenisPeserta),
    queryFn: () => pkApi.getPkHasilTes(Number(id), jenisPeserta),
    enabled: isAuthenticated && !!id,
  });
}

export function usePkPesertaVisualisasi(id: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: pkKeys.pesertaVisualisasi(id),
    queryFn: () => pkApi.getPkPesertaVisualisasi(Number(id)),
    enabled: isAuthenticated && !!id,
  });
}

export function usePkVisualisasi(id: string, pesertaId: number) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: pkKeys.visualisasi(id, pesertaId),
    queryFn: () => pkApi.getPkVisualisasi(Number(id), pesertaId),
    enabled: isAuthenticated && !!id && pesertaId > 0,
  });
}

export function usePkTemplate(caborId: number) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: pkKeys.template(caborId),
    queryFn: () => pkApi.getPkTemplate(caborId),
    enabled: isAuthenticated && caborId > 0,
  });
}

export function useCreatePk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StorePkPayload) => pkApi.createPk(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pkKeys.all }),
  });
}

export function useUpdatePk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePkPayload }) =>
      pkApi.updatePk(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pkKeys.all }),
  });
}

export function useDeletePk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pkApi.deletePk(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pkKeys.all }),
  });
}

export function useSavePkSetup(pkId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SavePkSetupPayload) => pkApi.savePkSetup(payload),
    onSuccess: () => invalidatePkDetail(queryClient, pkId),
  });
}

export function useClonePkTemplate(pkId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CloneTemplatePayload) => pkApi.clonePkTemplate(payload),
    onSuccess: () => invalidatePkDetail(queryClient, pkId),
  });
}

export function useSavePkTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveTemplatePayload) => pkApi.savePkTemplate(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pkKeys.template(variables.cabor_id) });
    },
  });
}

export function useSavePkHasilTes(pkId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveHasilTesPayload) => pkApi.savePkHasilTes(payload),
    onSuccess: () => invalidatePkDetail(queryClient, pkId),
  });
}
