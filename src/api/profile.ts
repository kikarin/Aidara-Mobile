import { apiClient, apiRequest } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  BiodataResponseData,
  DokumenListData,
  PrestasiListData,
  SertifikatListData,
  SertifikatItem,
  StoreDokumenPayload,
  StorePrestasiPayload,
  StoreSertifikatPayload,
  UpdateBiodataPayload,
} from "@/api/profile-types";

function appendFormValue(formData: FormData, key: string, value: unknown): void {
  if (value === undefined) return;
  if (value === null) {
    formData.append(key, "");
    return;
  }
  formData.append(key, String(value));
}

export function unwrapProfileData<T>(response: ApiResponse<T>): T {
  if (response.status !== "success" || response.data == null) {
    throw new Error(response.message || "Gagal memproses data profil");
  }
  return response.data;
}

export async function getBiodata() {
  return apiRequest<BiodataResponseData>({
    method: "GET",
    url: "/profile/biodata",
  });
}

export async function updateBiodata(payload: UpdateBiodataPayload, file?: File) {
  if (file) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => appendFormValue(formData, key, value));
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<BiodataResponseData>>(
      "/profile/biodata",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  }

  return apiRequest<BiodataResponseData>({
    method: "PUT",
    url: "/profile/biodata",
    data: payload,
  });
}

export async function getSertifikat() {
  return apiRequest<SertifikatListData>({
    method: "GET",
    url: "/profile/sertifikat",
  });
}

export async function storeSertifikat(payload: StoreSertifikatPayload) {
  const formData = new FormData();
  formData.append("nama_sertifikat", payload.nama_sertifikat);
  if (payload.penyelenggara) formData.append("penyelenggara", payload.penyelenggara);
  if (payload.tanggal_terbit) formData.append("tanggal_terbit", payload.tanggal_terbit);
  formData.append("file", payload.file);

  const response = await apiClient.post<ApiResponse<{ sertifikat: SertifikatItem; permissions: string[] }>>(
    "/profile/sertifikat",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

export async function deleteSertifikat(id: number) {
  return apiRequest<{ permissions: string[] }>({
    method: "DELETE",
    url: `/profile/sertifikat/${id}`,
  });
}

export async function getPrestasi() {
  return apiRequest<PrestasiListData>({
    method: "GET",
    url: "/profile/prestasi",
  });
}

export async function storePrestasi(payload: StorePrestasiPayload) {
  return apiRequest<{ prestasi: PrestasiListData["prestasi"][number]; permissions: string[] }>({
    method: "POST",
    url: "/profile/prestasi",
    data: payload,
  });
}

export async function deletePrestasi(id: number) {
  return apiRequest<{ permissions: string[] }>({
    method: "DELETE",
    url: `/profile/prestasi/${id}`,
  });
}

export async function getDokumen() {
  return apiRequest<DokumenListData>({
    method: "GET",
    url: "/profile/dokumen",
  });
}

export async function storeDokumen(payload: StoreDokumenPayload) {
  const formData = new FormData();
  if (payload.jenis_dokumen_id != null) {
    formData.append("jenis_dokumen_id", String(payload.jenis_dokumen_id));
  }
  if (payload.nomor) formData.append("nomor", payload.nomor);
  formData.append("file", payload.file);

  const response = await apiClient.post<ApiResponse<{ dokumen: DokumenListData["dokumen"][number]; permissions: string[] }>>(
    "/profile/dokumen",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

export async function deleteDokumen(id: number) {
  return apiRequest<{ permissions: string[] }>({
    method: "DELETE",
    url: `/profile/dokumen/${id}`,
  });
}

export async function downloadSertifikatFile(id: number) {
  const response = await apiClient.get(`/profile/sertifikat/${id}/file`, {
    responseType: "blob",
  });
  return response.data as Blob;
}

export async function downloadDokumenFile(id: number) {
  const response = await apiClient.get(`/profile/dokumen/${id}/file`, {
    responseType: "blob",
  });
  return response.data as Blob;
}
