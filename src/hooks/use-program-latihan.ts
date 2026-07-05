import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isPast } from "date-fns";
import * as programApi from "@/api/program-latihan";
import type {
  ProgramLatihanListParams,
  StoreProgramLatihanPayload,
  UpdateProgramLatihanPayload,
} from "@/api/program-latihan-types";
import { mapProgramLatihanItem, mapProgramLatihanList, type ProgramLatihan } from "@/app/lib/program-mappers";
import { useAuth } from "@/hooks/use-auth";

export const programKeys = {
  all: ["program-latihan"] as const,
  list: (params?: ProgramLatihanListParams) => ["program-latihan", "list", params ?? {}] as const,
  infinite: (params?: Omit<ProgramLatihanListParams, "page">) =>
    ["program-latihan", "infinite", params ?? {}] as const,
  detail: (id: string) => ["program-latihan", "detail", id] as const,
  preview: () => ["program-latihan", "preview"] as const,
  filterCabor: () => ["program-latihan", "filter", "cabor"] as const,
  filterKategori: (caborId: number) => ["program-latihan", "filter", "kategori", caborId] as const,
  filterPelatih: (caborKategoriId: number, caborId?: number) =>
    ["program-latihan", "filter", "pelatih", caborKategoriId, caborId ?? 0] as const,
};

const PAGE_SIZE = 10;

async function fetchProgramById(programId: string): Promise<ProgramLatihan> {
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage) {
    const result = await programApi.getProgramLatihanList({ page, per_page: 50 });
    lastPage = result.meta.last_page;
    const found = result.items.find((item) => String(item.id) === programId);
    if (found) {
      return mapProgramLatihanItem(found);
    }
    page += 1;
  }

  throw new Error("Program tidak ditemukan");
}

export function useProgramDetail(programId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: programKeys.detail(programId),
    queryFn: () => fetchProgramById(programId),
    enabled: isAuthenticated && !!programId,
  });
}

export function useProgramUpcomingPreview(limit = 3) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: programKeys.preview(),
    queryFn: () => programApi.getProgramLatihanList({ per_page: 30, order: "asc", sort: "periode_mulai" }),
    enabled: isAuthenticated,
    select: (data): ProgramLatihan[] =>
      mapProgramLatihanList(data.items)
        .filter((program) => !isPast(program.periode_selesai))
        .slice(0, limit),
  });
}

export function useProgramLatihanInfiniteList(
  params?: Omit<ProgramLatihanListParams, "page" | "per_page">
) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: programKeys.infinite(params),
    queryFn: ({ pageParam }) =>
      programApi.getProgramLatihanList({
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

export function useProgramFilterCabor() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: programKeys.filterCabor(),
    queryFn: () => programApi.getProgramFilterCabor(),
    enabled: isAuthenticated,
  });
}

export function useProgramFilterKategori(caborId?: number) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: programKeys.filterKategori(caborId ?? 0),
    queryFn: () => programApi.getProgramFilterKategori(caborId!),
    enabled: isAuthenticated && !!caborId,
  });
}

export function useProgramFilterPelatih(caborKategoriId?: number, caborId?: number) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: programKeys.filterPelatih(caborKategoriId ?? 0, caborId),
    queryFn: () => programApi.getProgramFilterPelatih(caborKategoriId!, caborId),
    enabled: isAuthenticated && !!caborKategoriId,
  });
}

export function useCreateProgramLatihan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StoreProgramLatihanPayload) => programApi.createProgramLatihan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

export function useUpdateProgramLatihan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProgramLatihanPayload }) =>
      programApi.updateProgramLatihan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

export function useDeleteProgramLatihan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => programApi.deleteProgramLatihan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}
