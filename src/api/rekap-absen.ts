import { apiClient, apiRequest } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  RekapAbsenApiItem,
  RekapAbsenListResult,
  StoreRekapAbsenPayload,
  UpdateRekapAbsenPayload,
} from "@/api/program-latihan-types";

interface RekapListRawResponse extends ApiResponse<RekapAbsenApiItem[]> {
  program_latihan?: RekapAbsenListResult["programLatihan"];
  permissions?: string[];
}

interface RekapTodayRawResponse extends ApiResponse<RekapAbsenApiItem | null> {
  message?: string;
}

function appendFiles(formData: FormData, key: string, files?: File[]): void {
  files?.forEach((file) => formData.append(`${key}[]`, file));
}

function appendStringArray(formData: FormData, key: string, values?: string[]): void {
  values?.forEach((value) => formData.append(`${key}[]`, value));
}

function appendNumberArray(formData: FormData, key: string, values?: number[]): void {
  values?.forEach((value) => formData.append(`${key}[]`, String(value)));
}

export function unwrapRekapList(response: RekapListRawResponse): RekapAbsenListResult {
  if (response.status !== "success" || response.data == null) {
    throw new Error(response.message || "Gagal memproses data rekap absen");
  }

  if (!response.program_latihan) {
    throw new Error("Data program latihan tidak ditemukan");
  }

  return {
    items: response.data,
    programLatihan: response.program_latihan,
    permissions: response.permissions ?? [],
  };
}

function unwrapRekapItem(response: ApiResponse<RekapAbsenApiItem>): RekapAbsenApiItem {
  if (response.status !== "success" || !response.data) {
    throw new Error(response.message || "Gagal memproses data rekap absen");
  }
  return response.data;
}

export async function getRekapAbsenList(programId: number): Promise<RekapAbsenListResult> {
  const response = await apiClient.get<RekapListRawResponse>(
    `/v1/program-latihan/${programId}/rekap-absen`
  );
  return unwrapRekapList(response.data);
}

export async function getRekapAbsenToday(programId: number): Promise<RekapAbsenApiItem | null> {
  const response = await apiClient.get<RekapTodayRawResponse>(
    `/v1/program-latihan/${programId}/rekap-absen/today`
  );
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Gagal memproses rekap hari ini");
  }
  return response.data.data ?? null;
}

export async function createRekapAbsen(programId: number, payload: StoreRekapAbsenPayload) {
  const formData = new FormData();
  formData.append("program_latihan_id", String(payload.program_latihan_id));
  formData.append("tanggal", payload.tanggal);
  formData.append("jenis_latihan", payload.jenis_latihan);
  if (payload.keterangan) formData.append("keterangan", payload.keterangan);
  appendFiles(formData, "foto_absen", payload.foto_absen);
  appendStringArray(formData, "foto_lokasi", payload.foto_lokasi);
  appendFiles(formData, "file_nilai", payload.file_nilai);

  const response = await apiClient.post<ApiResponse<RekapAbsenApiItem>>(
    `/v1/program-latihan/${programId}/rekap-absen`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return unwrapRekapItem(response.data);
}

export async function updateRekapAbsen(
  programId: number,
  rekapId: number,
  payload: UpdateRekapAbsenPayload
) {
  const formData = new FormData();
  if (payload.jenis_latihan) formData.append("jenis_latihan", payload.jenis_latihan);
  if (payload.keterangan !== undefined) formData.append("keterangan", payload.keterangan);
  appendFiles(formData, "foto_absen", payload.foto_absen);
  appendStringArray(formData, "foto_lokasi", payload.foto_lokasi);
  appendFiles(formData, "file_nilai", payload.file_nilai);
  appendNumberArray(formData, "deleted_media_ids", payload.deleted_media_ids);

  const response = await apiClient.post<ApiResponse<RekapAbsenApiItem>>(
    `/v1/program-latihan/${programId}/rekap-absen/${rekapId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return unwrapRekapItem(response.data);
}

export async function deleteRekapMedia(
  programId: number,
  rekapId: number,
  mediaId: number
) {
  return apiRequest({
    method: "DELETE",
    url: `/v1/program-latihan/${programId}/rekap-absen/${rekapId}/media/${mediaId}`,
  });
}

export function buildFotoLokasiMetadata(photo: {
  lat?: number;
  lng?: number;
  address?: string;
  timestamp: Date;
}): string {
  return JSON.stringify({
    latitude: photo.lat ?? null,
    longitude: photo.lng ?? null,
    lokasi: photo.address ?? null,
    waktu_foto: photo.timestamp.toISOString().slice(0, 19).replace("T", " "),
  });
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}
