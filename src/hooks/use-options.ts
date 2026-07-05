import { useQuery } from "@tanstack/react-query";
import * as optionsApi from "@/api/options";
import type {
  AllOptionsData,
  AllOptionsKey,
  CaborFilterParams,
  TenagaPendukungFilterParams,
} from "@/api/options";
import { toMasterDataOptions } from "@/app/lib/option-mappers";
import { useAuth } from "@/hooks/use-auth";
import { parseApiError } from "@/hooks/use-api-error";

export const OPTIONS_STALE_TIME = 5 * 60 * 1000;

export const optionsKeys = {
  all: ["options", "all"] as const,
  kelurahan: (kecamatanId: number) => ["options", "kelurahan", kecamatanId] as const,
  cabor: (params?: CaborFilterParams) => ["options", "cabor", params ?? {}] as const,
  caborKategori: (caborId: number) => ["options", "cabor-kategori", caborId] as const,
  tenagaPendukung: (params?: TenagaPendukungFilterParams) =>
    ["options", "tenaga-pendukung", params ?? {}] as const,
  parameterPemeriksaan: ["options", "parameter-pemeriksaan"] as const,
  refStatusPemeriksaan: ["options", "ref-status-pemeriksaan"] as const,
  kecamatan: ["options", "kecamatan"] as const,
  tingkat: ["options", "tingkat"] as const,
  kategoriPrestasiPelatih: ["options", "kategori-prestasi-pelatih"] as const,
  kategoriAtlet: ["options", "kategori-atlet"] as const,
  jenisDokumen: ["options", "jenis-dokumen"] as const,
  posisiAtlet: ["options", "posisi-atlet"] as const,
  kategoriPeserta: ["options", "kategori-peserta"] as const,
};

function getErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}

export function useAllOptions() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: optionsKeys.all,
    queryFn: async () => optionsApi.unwrapOptionsData(await optionsApi.getAllOptions()),
    staleTime: OPTIONS_STALE_TIME,
    enabled: isAuthenticated,
  });
}

export function useOptionsList(optionKey: AllOptionsKey) {
  const query = useAllOptions();

  const items = query.data?.[optionKey] ?? [];

  return {
    ...query,
    options: toMasterDataOptions(items),
    isEmpty: !query.isLoading && !query.isError && items.length === 0,
    errorMessage: query.error ? getErrorMessage(query.error) : undefined,
  };
}

export function useKelurahanOptions(kecamatanId: number | null) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: optionsKeys.kelurahan(kecamatanId ?? 0),
    queryFn: async () =>
      optionsApi.unwrapOptionsData(await optionsApi.getKelurahanByKecamatan(kecamatanId!)),
    staleTime: OPTIONS_STALE_TIME,
    enabled: isAuthenticated && kecamatanId != null && kecamatanId > 0,
  });
}

export function useCaborOptions(params?: CaborFilterParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: optionsKeys.cabor(params),
    queryFn: async () => optionsApi.unwrapOptionsData(await optionsApi.getCabor(params)),
    staleTime: OPTIONS_STALE_TIME,
    enabled: isAuthenticated,
  });
}

export function useCaborKategoriOptions(caborId: number | null) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: optionsKeys.caborKategori(caborId ?? 0),
    queryFn: async () =>
      optionsApi.unwrapOptionsData(await optionsApi.getCaborKategoriByCabor(caborId!)),
    staleTime: OPTIONS_STALE_TIME,
    enabled: isAuthenticated && caborId != null && caborId > 0,
  });
}

export function useTenagaPendukungOptions(params?: TenagaPendukungFilterParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: optionsKeys.tenagaPendukung(params),
    queryFn: async () =>
      optionsApi.unwrapOptionsData(await optionsApi.getTenagaPendukung(params)),
    staleTime: OPTIONS_STALE_TIME,
    enabled: isAuthenticated,
  });
}

export function useParameterPemeriksaanOptions() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: optionsKeys.parameterPemeriksaan,
    queryFn: async () =>
      optionsApi.unwrapOptionsData(await optionsApi.getParameterPemeriksaan()),
    staleTime: OPTIONS_STALE_TIME,
    enabled: isAuthenticated,
  });
}

export function useRefStatusPemeriksaanOptions() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: optionsKeys.refStatusPemeriksaan,
    queryFn: async () =>
      optionsApi.unwrapOptionsData(await optionsApi.getRefStatusPemeriksaan()),
    staleTime: OPTIONS_STALE_TIME,
    enabled: isAuthenticated,
  });
}

export function getOptionsFromAllData(
  data: AllOptionsData | undefined,
  optionKey: AllOptionsKey
) {
  return toMasterDataOptions(data?.[optionKey] ?? []);
}

export function prefetchAllOptions(queryClient: {
  prefetchQuery: (options: {
    queryKey: readonly unknown[];
    queryFn: () => Promise<AllOptionsData>;
    staleTime: number;
  }) => Promise<void>;
}) {
  return queryClient.prefetchQuery({
    queryKey: optionsKeys.all,
    queryFn: async () => optionsApi.unwrapOptionsData(await optionsApi.getAllOptions()),
    staleTime: OPTIONS_STALE_TIME,
  });
}
