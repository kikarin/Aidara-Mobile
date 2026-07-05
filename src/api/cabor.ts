import { apiClient, apiRequest } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  CaborListItem,
  CaborListParams,
  CaborPerbandinganPeserta,
  CaborPerbandinganResult,
  CaborPemeriksaanItem,
  CaborAspekListItem,
  CaborPesertaData,
  CaborRankingData,
  CaborLastThreePemeriksaan,
} from "@/api/cabor-types";

export function unwrapCaborData<T>(response: ApiResponse<T>): T {
  if (response.status !== "success" || response.data == null) {
    throw new Error(response.message || "Gagal memproses data cabor");
  }
  return response.data;
}

export async function getCaborList(params?: CaborListParams) {
  return apiRequest<CaborListItem[]>({
    method: "GET",
    url: "/v1/cabor",
    params,
  });
}

export async function getCaborPeserta(caborId: string | number, jenisPeserta?: string) {
  return apiRequest<CaborPesertaData>({
    method: "GET",
    url: `/v1/cabor/${caborId}/peserta`,
    params: jenisPeserta ? { jenis_peserta: jenisPeserta } : undefined,
  });
}

export async function getCaborRanking(caborId: string | number) {
  return apiRequest<CaborRankingData>({
    method: "GET",
    url: `/v1/cabor/${caborId}/ranking`,
  });
}

interface CaborPerbandinganRawResponse {
  status: string;
  message?: string;
  data?: CaborPerbandinganPeserta[];
  pemeriksaan_list?: CaborPemeriksaanItem[];
  aspek_list?: CaborAspekListItem[];
}

export async function getCaborPerbandingan(
  caborId: string | number,
  pemeriksaanKhususIds: number[]
): Promise<CaborPerbandinganResult> {
  const response = await apiClient.get<CaborPerbandinganRawResponse>(
    `/v1/cabor/${caborId}/perbandingan`,
    {
      params: {
        pemeriksaan_khusus_ids: pemeriksaanKhususIds.join(","),
      },
    }
  );

  const body = response.data;
  if (body.status !== "success") {
    throw new Error(body.message || "Gagal memproses data perbandingan");
  }

  return {
    peserta: body.data ?? [],
    pemeriksaan_list: body.pemeriksaan_list ?? [],
    aspek_list: body.aspek_list ?? [],
  };
}

export async function getCaborLastThreePemeriksaan(
  caborId: string | number,
  pesertaId: string | number,
  pesertaType?: string
) {
  return apiRequest<CaborLastThreePemeriksaan[]>({
    method: "GET",
    url: `/v1/cabor/${caborId}/peserta/${pesertaId}/last-three-pemeriksaan`,
    params: pesertaType ? { peserta_type: pesertaType } : undefined,
  });
}
