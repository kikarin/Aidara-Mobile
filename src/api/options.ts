import { apiRequest } from "@/api/client";
import type { ApiResponse } from "@/api/types";

export interface OptionItem {
  id: number;
  nama: string;
}

export interface CaborOption extends OptionItem {
  kategori_peserta_id: number;
}

export interface CaborKategoriOption extends OptionItem {
  cabor_id: number;
  jenis_kelamin?: string | null;
  kategori_peserta_id?: number | null;
}

export interface ParameterPemeriksaanOption extends OptionItem {
  satuan: string;
  kategori: string;
  label: string;
}

export interface AllOptionsData {
  kecamatan: OptionItem[];
  tingkat: OptionItem[];
  jenis_dokumen: OptionItem[];
  kategori_peserta: OptionItem[];
  cabor: CaborOption[];
  kategori_atlet?: OptionItem[];
  posisi_atlet?: OptionItem[];
  kategori_prestasi_pelatih?: OptionItem[];
}

export type AllOptionsKey = keyof AllOptionsData;

export interface CaborFilterParams {
  kategori_peserta_id?: number;
}

export interface TenagaPendukungFilterParams {
  cabor_kategori_id?: number;
}

export async function getAllOptions() {
  return apiRequest<AllOptionsData>({
    method: "GET",
    url: "/options/all",
  });
}

export async function getKecamatan() {
  return apiRequest<OptionItem[]>({
    method: "GET",
    url: "/options/kecamatan",
  });
}

export async function getKelurahanByKecamatan(kecamatanId: number) {
  return apiRequest<OptionItem[]>({
    method: "GET",
    url: `/options/kelurahan/${kecamatanId}`,
  });
}

export async function getTingkat() {
  return apiRequest<OptionItem[]>({
    method: "GET",
    url: "/options/tingkat",
  });
}

export async function getKategoriPrestasiPelatih() {
  return apiRequest<OptionItem[]>({
    method: "GET",
    url: "/options/kategori-prestasi-pelatih",
  });
}

export async function getKategoriAtlet() {
  return apiRequest<OptionItem[]>({
    method: "GET",
    url: "/options/kategori-atlet",
  });
}

export async function getJenisDokumen() {
  return apiRequest<OptionItem[]>({
    method: "GET",
    url: "/options/jenis-dokumen",
  });
}

export async function getPosisiAtlet() {
  return apiRequest<OptionItem[]>({
    method: "GET",
    url: "/options/posisi-atlet",
  });
}

export async function getKategoriPeserta() {
  return apiRequest<OptionItem[]>({
    method: "GET",
    url: "/options/kategori-peserta",
  });
}

export async function getCabor(params?: CaborFilterParams) {
  return apiRequest<CaborOption[]>({
    method: "GET",
    url: "/options/cabor",
    params,
  });
}

export async function getCaborKategoriByCabor(caborId: number) {
  return apiRequest<CaborKategoriOption[]>({
    method: "GET",
    url: `/options/cabor-kategori/${caborId}`,
  });
}

export async function getTenagaPendukung(params?: TenagaPendukungFilterParams) {
  return apiRequest<OptionItem[]>({
    method: "GET",
    url: "/options/tenaga-pendukung",
    params,
  });
}

export async function getParameterPemeriksaan() {
  return apiRequest<ParameterPemeriksaanOption[]>({
    method: "GET",
    url: "/options/parameter-pemeriksaan",
  });
}

export async function getRefStatusPemeriksaan() {
  return apiRequest<OptionItem[]>({
    method: "GET",
    url: "/options/ref-status-pemeriksaan",
  });
}

export function unwrapOptionsData<T>(response: ApiResponse<T>): T {
  if (response.status !== "success" || response.data == null) {
    throw new Error(response.message || "Gagal mengambil data options");
  }
  return response.data;
}
