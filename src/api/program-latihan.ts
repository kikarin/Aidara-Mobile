import { apiClient, apiRequest } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  FilterOption,
  ProgramLatihanApiItem,
  ProgramLatihanListParams,
  ProgramLatihanListResult,
  StoreProgramLatihanPayload,
  UpdateProgramLatihanPayload,
} from "@/api/program-latihan-types";

interface ProgramListRawResponse extends ApiResponse<ProgramLatihanApiItem[]> {
  permissions?: string[];
}

interface ProgramMutationRawResponse extends ApiResponse<{
  program_latihan: ProgramLatihanApiItem;
  permissions?: string[];
}> {}

const DEFAULT_META = { total: 0, current_page: 1, per_page: 10, last_page: 1 };

export function unwrapProgramList(response: ProgramListRawResponse): ProgramLatihanListResult {
  if (response.status !== "success" || response.data == null) {
    throw new Error(response.message || "Gagal memproses data program latihan");
  }

  return {
    items: response.data,
    meta: response.meta ?? DEFAULT_META,
    permissions: response.permissions ?? [],
  };
}

function unwrapProgramItem(response: ProgramMutationRawResponse): ProgramLatihanApiItem {
  if (response.status !== "success" || !response.data?.program_latihan) {
    throw new Error(response.message || "Gagal memproses data program latihan");
  }
  return response.data.program_latihan;
}

export async function getProgramLatihanList(
  params?: ProgramLatihanListParams
): Promise<ProgramLatihanListResult> {
  const response = await apiClient.get<ProgramListRawResponse>("/v1/program-latihan", { params });
  return unwrapProgramList(response.data);
}

export async function createProgramLatihan(payload: StoreProgramLatihanPayload) {
  const response = await apiClient.post<ProgramMutationRawResponse>("/v1/program-latihan", payload);
  return unwrapProgramItem(response.data);
}

export async function updateProgramLatihan(id: number, payload: UpdateProgramLatihanPayload) {
  const response = await apiClient.put<ProgramMutationRawResponse>(
    `/v1/program-latihan/${id}`,
    payload
  );
  return unwrapProgramItem(response.data);
}

export async function deleteProgramLatihan(id: number) {
  return apiRequest<{ permissions?: string[] }>({
    method: "DELETE",
    url: `/v1/program-latihan/${id}`,
  });
}

export async function getProgramFilterCabor(): Promise<FilterOption[]> {
  const response = await apiRequest<FilterOption[]>({
    method: "GET",
    url: "/v1/program-latihan/filter/cabor",
  });
  return response.data ?? [];
}

export async function getProgramFilterKategori(caborId: number): Promise<FilterOption[]> {
  const response = await apiRequest<FilterOption[]>({
    method: "GET",
    url: `/v1/program-latihan/filter/kategori/${caborId}`,
  });
  return response.data ?? [];
}

export async function getProgramFilterPelatih(caborKategoriId: number, caborId?: number): Promise<FilterOption[]> {
  const response = await apiRequest<FilterOption[]>({
    method: "GET",
    url: `/v1/program-latihan/filter/pelatih/${caborKategoriId}`,
    params: caborId ? { cabor_id: caborId } : undefined,
  });
  return response.data ?? [];
}
