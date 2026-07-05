import { apiClient, apiRequest } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  BulkUpdatePesertaPayload,
  ParameterStatistikParams,
  ParameterStatistikResult,
  PemeriksaanApiItem,
  PemeriksaanDetailApiItem,
  PemeriksaanListParams,
  PemeriksaanListResult,
  PemeriksaanPesertaListResult,
  StorePemeriksaanPayload,
  UpdatePemeriksaanPayload,
} from "@/api/pemeriksaan-types";

interface PemeriksaanListRawResponse extends ApiResponse<PemeriksaanApiItem[]> {
  permissions?: string[];
}

const DEFAULT_META = { total: 0, current_page: 1, per_page: 10, last_page: 1 };

export function unwrapPemeriksaanList(response: PemeriksaanListRawResponse): PemeriksaanListResult {
  if (response.status !== "success" || response.data == null) {
    throw new Error(response.message || "Gagal memproses data pemeriksaan");
  }

  return {
    items: response.data,
    meta: response.meta ?? DEFAULT_META,
    permissions: response.permissions ?? [],
  };
}

function unwrapPemeriksaanItem(response: ApiResponse<PemeriksaanApiItem>): PemeriksaanApiItem {
  if (response.status !== "success" || !response.data) {
    throw new Error(response.message || "Gagal memproses data pemeriksaan");
  }
  return response.data;
}

function unwrapPemeriksaanDetail(response: ApiResponse<PemeriksaanDetailApiItem>): PemeriksaanDetailApiItem {
  if (response.status !== "success" || !response.data) {
    throw new Error(response.message || "Gagal memproses detail pemeriksaan");
  }
  return response.data;
}

export async function getPemeriksaanList(params?: PemeriksaanListParams): Promise<PemeriksaanListResult> {
  const response = await apiClient.get<PemeriksaanListRawResponse>("/v1/pemeriksaan", { params });
  return unwrapPemeriksaanList(response.data);
}

export async function getPemeriksaanDetail(id: number): Promise<PemeriksaanDetailApiItem> {
  const response = await apiClient.get<ApiResponse<PemeriksaanDetailApiItem>>(`/v1/pemeriksaan/${id}`);
  return unwrapPemeriksaanDetail(response.data);
}

export async function createPemeriksaan(payload: StorePemeriksaanPayload) {
  const response = await apiClient.post<ApiResponse<PemeriksaanApiItem>>("/v1/pemeriksaan", payload);
  return unwrapPemeriksaanItem(response.data);
}

export async function updatePemeriksaan(id: number, payload: UpdatePemeriksaanPayload) {
  const response = await apiClient.put<ApiResponse<PemeriksaanApiItem>>(`/v1/pemeriksaan/${id}`, payload);
  return unwrapPemeriksaanItem(response.data);
}

export async function deletePemeriksaan(id: number) {
  return apiRequest({
    method: "DELETE",
    url: `/v1/pemeriksaan/${id}`,
  });
}

export async function getPemeriksaanPeserta(
  id: number,
  jenisPeserta?: string
): Promise<PemeriksaanPesertaListResult> {
  const response = await apiClient.get<
    ApiResponse<PemeriksaanPesertaListResult["peserta"]> & {
      parameters?: PemeriksaanPesertaListResult["parameters"];
    }
  >(`/v1/pemeriksaan/${id}/peserta`, {
    params: jenisPeserta && jenisPeserta !== "all" ? { jenis_peserta: jenisPeserta } : undefined,
  });

  if (response.data.status !== "success" || response.data.data == null) {
    throw new Error(response.data.message || "Gagal memproses data peserta");
  }

  return {
    peserta: response.data.data,
    parameters: response.data.parameters ?? [],
  };
}

export async function bulkUpdatePesertaParameter(id: number, payload: BulkUpdatePesertaPayload) {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `/v1/pemeriksaan/${id}/peserta-parameter/bulk-update`,
    payload
  );
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Gagal menyimpan nilai peserta");
  }
  return response.data;
}

interface StatistikRawResponse extends ApiResponse<ParameterStatistikResult["peserta"]> {
  parameter?: ParameterStatistikResult["parameter"];
}

export async function getParameterStatistik(
  parameterId: number,
  params?: ParameterStatistikParams
): Promise<ParameterStatistikResult> {
  const response = await apiClient.get<StatistikRawResponse>(
    `/v1/pemeriksaan/statistik/parameter/${parameterId}`,
    { params }
  );

  if (response.data.status !== "success" || response.data.data == null) {
    throw new Error(response.data.message || "Gagal memproses statistik parameter");
  }

  if (!response.data.parameter) {
    throw new Error("Data parameter statistik tidak ditemukan");
  }

  return {
    peserta: response.data.data,
    parameter: response.data.parameter,
  };
}
