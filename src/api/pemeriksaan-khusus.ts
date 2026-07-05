import { apiClient, apiRequest } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  CloneTemplatePayload,
  PkApiItem,
  PkHasilTesPesertaResult,
  PkListParams,
  PkListResult,
  PkPesertaHasilTesItem,
  PkPesertaVisualisasiItem,
  PkSetupPesertaResult,
  PkSetupResult,
  PkTemplateResult,
  PkVisualisasiApiResponse,
  PkVisualisasiResult,
  SaveHasilTesPayload,
  SavePkSetupPayload,
  SaveTemplatePayload,
  StorePkPayload,
  UpdatePkPayload,
} from "@/api/pemeriksaan-khusus-types";

interface PkListRawResponse extends ApiResponse<PkApiItem[]> {
  permissions?: string[];
}

const DEFAULT_META = { total: 0, current_page: 1, per_page: 10, last_page: 1 };

export function unwrapPkList(response: PkListRawResponse): PkListResult {
  if (response.status !== "success" || response.data == null) {
    throw new Error(response.message || "Gagal memproses data pemeriksaan khusus");
  }
  return {
    items: response.data,
    meta: response.meta ?? DEFAULT_META,
    permissions: response.permissions ?? [],
  };
}

function unwrapPkItem(response: ApiResponse<PkApiItem>): PkApiItem {
  if (response.status !== "success" || !response.data) {
    throw new Error(response.message || "Gagal memproses data pemeriksaan khusus");
  }
  return response.data;
}

export async function getPkList(params?: PkListParams): Promise<PkListResult> {
  const response = await apiClient.get<PkListRawResponse>("/v1/pemeriksaan-khusus", { params });
  return unwrapPkList(response.data);
}

export async function createPk(payload: StorePkPayload) {
  const response = await apiClient.post<ApiResponse<PkApiItem>>("/v1/pemeriksaan-khusus", payload);
  return unwrapPkItem(response.data);
}

export async function updatePk(id: number, payload: UpdatePkPayload) {
  const response = await apiClient.put<ApiResponse<PkApiItem>>(`/v1/pemeriksaan-khusus/${id}`, payload);
  return unwrapPkItem(response.data);
}

export async function deletePk(id: number) {
  return apiRequest({ method: "DELETE", url: `/v1/pemeriksaan-khusus/${id}` });
}

export async function getPkSetup(id: number): Promise<PkSetupResult> {
  const response = await apiClient.get<ApiResponse<PkSetupResult>>(`/v1/pemeriksaan-khusus/${id}/setup`);
  if (response.data.status !== "success" || !response.data.data) {
    throw new Error(response.data.message || "Gagal memproses setup pemeriksaan khusus");
  }
  return response.data.data;
}

export async function getPkSetupPeserta(id: number, pesertaId: number): Promise<PkSetupPesertaResult> {
  const response = await apiClient.get<ApiResponse<PkSetupPesertaResult>>(
    `/v1/pemeriksaan-khusus/${id}/setup/${pesertaId}`
  );
  if (response.data.status !== "success" || !response.data.data) {
    throw new Error(response.data.message || "Gagal memproses setup peserta");
  }
  return response.data.data;
}

export async function savePkSetup(payload: SavePkSetupPayload) {
  const response = await apiClient.post<ApiResponse<unknown>>("/v1/pemeriksaan-khusus/setup", payload);
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Gagal menyimpan setup");
  }
  return response.data;
}

export async function clonePkTemplate(payload: CloneTemplatePayload) {
  const response = await apiClient.post<ApiResponse<unknown>>("/v1/pemeriksaan-khusus/clone-template", payload);
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Gagal clone template");
  }
  return response.data;
}

export async function getPkTemplate(caborId: number): Promise<PkTemplateResult> {
  const response = await apiClient.get<ApiResponse<PkTemplateResult["data"]> & { has_template?: boolean }>(
    `/v1/pemeriksaan-khusus/template/${caborId}`
  );
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Gagal memproses template");
  }
  return {
    has_template: response.data.has_template ?? false,
    data: response.data.data ?? null,
  };
}

export async function savePkTemplate(payload: SaveTemplatePayload) {
  const response = await apiClient.post<ApiResponse<unknown>>("/v1/pemeriksaan-khusus/template", payload);
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Gagal menyimpan template");
  }
  return response.data;
}

export async function getPkPesertaHasilTes(id: number, jenisPeserta = "atlet") {
  const response = await apiClient.get<ApiResponse<PkPesertaHasilTesItem[]>>(
    `/v1/pemeriksaan-khusus/${id}/peserta-hasil-tes`,
    { params: { jenis_peserta: jenisPeserta } }
  );
  if (response.data.status !== "success" || response.data.data == null) {
    throw new Error(response.data.message || "Gagal memproses daftar peserta");
  }
  return { peserta: response.data.data, jenis_peserta: jenisPeserta };
}

export async function getPkHasilTes(id: number, jenisPeserta = "atlet") {
  const response = await apiClient.get<ApiResponse<PkHasilTesPesertaResult[]>>(
    `/v1/pemeriksaan-khusus/${id}/hasil-tes`,
    { params: { jenis_peserta: jenisPeserta } }
  );
  if (response.data.status !== "success" || response.data.data == null) {
    throw new Error(response.data.message || "Gagal memproses hasil tes");
  }
  return { data: response.data.data, jenis_peserta: jenisPeserta };
}

export async function savePkHasilTes(payload: SaveHasilTesPayload) {
  const response = await apiClient.post<ApiResponse<unknown>>("/v1/pemeriksaan-khusus/hasil-tes", payload);
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Gagal menyimpan hasil tes");
  }
  return response.data;
}

export async function getPkPesertaVisualisasi(id: number) {
  const response = await apiClient.get<ApiResponse<PkPesertaVisualisasiItem[]>>(
    `/v1/pemeriksaan-khusus/${id}/peserta-visualisasi`
  );
  if (response.data.status !== "success" || response.data.data == null) {
    throw new Error(response.data.message || "Gagal memproses peserta visualisasi");
  }
  return response.data.data;
}

export async function getPkVisualisasi(id: number, pesertaId: number) {
  const response = await apiClient.get<
    ApiResponse<PkVisualisasiResult> & { aspek_list?: PkVisualisasiApiResponse["aspek_list"] }
  >(`/v1/pemeriksaan-khusus/${id}/visualisasi/${pesertaId}`);

  if (response.data.status !== "success" || !response.data.data) {
    throw new Error(response.data.message || "Gagal memproses visualisasi");
  }

  return {
    ...response.data.data,
    aspek_list: response.data.aspek_list ?? [],
  } satisfies PkVisualisasiApiResponse;
}
