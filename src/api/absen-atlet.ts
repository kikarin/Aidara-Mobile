import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";

export interface AbsenAtletApiItem {
  id: number;
  program_latihan_id: number;
  atlet_id: number;
  atlet_nama?: string;
  tanggal: string;
  status: string;
  status_label: string;
  waktu_foto?: string | null;
  lokasi?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  catatan?: string | null;
  foto?: {
    id: number;
    url: string;
    name: string;
    lokasi?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    waktu_foto?: string | null;
  } | null;
  created_at?: string;
}

export interface StoreAbsenAtletPayload {
  tanggal?: string;
  status?: "hadir" | "izin" | "sakit" | "alpha";
  catatan?: string;
  foto_absen: File;
  foto_lokasi?: string;
}

function unwrapAbsenItem(response: ApiResponse<AbsenAtletApiItem>): AbsenAtletApiItem {
  if (response.status !== "success" || !response.data) {
    throw new Error(response.message || "Gagal memproses data absen atlet");
  }
  return response.data;
}

export async function getAbsenAtletList(
  programId: number,
  params?: { bulan?: string; tanggal?: string; atletId?: number }
): Promise<AbsenAtletApiItem[]> {
  const response = await apiClient.get<ApiResponse<AbsenAtletApiItem[]>>(
    `/v1/program-latihan/${programId}/absen-atlet`,
    {
      params: {
        bulan: params?.bulan,
        tanggal: params?.tanggal,
        atlet_id: params?.atletId,
      },
    }
  );
  if (response.data.status !== "success" || response.data.data == null) {
    throw new Error(response.data.message || "Gagal memuat riwayat absen");
  }
  return response.data.data;
}

export async function getRiwayatAbsenAtlet(programId: number, atletId: number): Promise<AbsenAtletApiItem[]> {
  const response = await apiClient.get<ApiResponse<AbsenAtletApiItem[]>>(
    `/v1/program-latihan/${programId}/kehadiran/atlet/${atletId}`
  );
  if (response.data.status !== "success" || response.data.data == null) {
    throw new Error(response.data.message || "Gagal memuat riwayat absen atlet");
  }
  return response.data.data;
}

export async function getAbsenAtletToday(programId: number): Promise<AbsenAtletApiItem | null> {
  const response = await apiClient.get<ApiResponse<AbsenAtletApiItem | null>>(
    `/v1/program-latihan/${programId}/absen-atlet/today`
  );
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Gagal memuat absen hari ini");
  }
  return response.data.data ?? null;
}

export async function createAbsenAtlet(programId: number, payload: StoreAbsenAtletPayload): Promise<AbsenAtletApiItem> {
  const formData = new FormData();
  if (payload.tanggal) formData.append("tanggal", payload.tanggal);
  if (payload.status) formData.append("status", payload.status);
  if (payload.catatan) formData.append("catatan", payload.catatan);
  formData.append("foto_absen", payload.foto_absen);
  if (payload.foto_lokasi) formData.append("foto_lokasi", payload.foto_lokasi);

  const response = await apiClient.post<ApiResponse<AbsenAtletApiItem>>(
    `/v1/program-latihan/${programId}/absen-atlet`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return unwrapAbsenItem(response.data);
}

export { buildFotoLokasiMetadata } from "@/api/rekap-absen";
