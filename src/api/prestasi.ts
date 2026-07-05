import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  KategoriPesertaOption,
  PrestasiKategoriGroup,
  PrestasiListParams,
  PrestasiListResult,
  PrestasiMedaliCount,
} from "@/api/prestasi-types";

interface PrestasiListRawResponse extends ApiResponse<PrestasiKategoriGroup[]> {
  kategori_peserta_list?: KategoriPesertaOption[];
  total_bonus?: number;
  total_medali?: PrestasiMedaliCount;
}

const EMPTY_MEDALI: PrestasiMedaliCount = { Emas: 0, Perak: 0, Perunggu: 0 };

export function unwrapPrestasiList(response: PrestasiListRawResponse): PrestasiListResult {
  if (response.status !== "success" || response.data == null) {
    throw new Error(response.message || "Gagal memproses data prestasi");
  }

  return {
    groups: response.data,
    kategoriPesertaList: response.kategori_peserta_list ?? [],
    totalBonus: response.total_bonus ?? 0,
    totalMedali: response.total_medali ?? EMPTY_MEDALI,
  };
}

export async function getPrestasiList(params?: PrestasiListParams): Promise<PrestasiListResult> {
  const response = await apiClient.get<PrestasiListRawResponse>("/v1/prestasi", { params });
  return unwrapPrestasiList(response.data);
}
