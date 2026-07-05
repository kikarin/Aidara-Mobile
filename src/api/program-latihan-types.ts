import type { PaginatedMeta } from "@/api/types";

export interface ProgramCaborRef {
  id: number;
  nama: string;
}

export interface ProgramKategoriRef {
  id: number;
  nama: string;
}

export interface ProgramLatihanApiItem {
  id: number;
  cabor: ProgramCaborRef | null;
  nama_program: string;
  cabor_kategori: ProgramKategoriRef | null;
  mode_pelatih?: "single" | "multiple";
  pelatih?: { id: number; nama: string } | null;
  pelatihs?: { id: number; nama: string }[];
  pelatih_id?: number | null;
  pelatih_ids?: number[];
  wajib_absen_atlet?: boolean;
  absen_jam_mulai?: string | null;
  absen_jam_selesai?: string | null;
  absen_window_label?: string | null;
  periode_mulai: string;
  periode_selesai: string;
  periode_hitung?: string | null;
  tahap: string | null;
  keterangan: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ProgramLatihanListParams {
  page?: number;
  per_page?: number;
  search?: string;
  cabor_id?: number;
  cabor_kategori_id?: number;
  filter_start_date?: string;
  filter_end_date?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface ProgramLatihanListResult {
  items: ProgramLatihanApiItem[];
  meta: PaginatedMeta;
  permissions: string[];
}

export interface StoreProgramLatihanPayload {
  cabor_id: number;
  nama_program: string;
  cabor_kategori_id: number;
  mode_pelatih: "single" | "multiple";
  pelatih_ids: number[];
  pelatih_id?: number;
  wajib_absen_atlet?: boolean;
  absen_jam_mulai?: string | null;
  absen_jam_selesai?: string | null;
  periode_mulai: string;
  periode_selesai: string;
  tahap?: string | null;
  keterangan?: string | null;
}

export type UpdateProgramLatihanPayload = Partial<StoreProgramLatihanPayload>;

export interface FilterOption {
  id: number;
  nama: string;
}

export interface FotoAbsenApiItem {
  id: number;
  url: string;
  name: string;
  lokasi?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  waktu_foto?: string | null;
}

export interface FileNilaiApiItem {
  id: number;
  url: string;
  name: string;
}

export interface RekapAbsenApiItem {
  id: number;
  tanggal: string;
  jenis_latihan: string;
  keterangan: string | null;
  foto_absen: FotoAbsenApiItem[];
  file_nilai: FileNilaiApiItem[];
  created_at: string;
  updated_at: string;
}

export interface RekapAbsenListResult {
  items: RekapAbsenApiItem[];
  programLatihan: {
    id: number;
    nama_program: string;
    cabor: ProgramCaborRef | null;
    cabor_kategori: ProgramKategoriRef | null;
  };
  permissions: string[];
}

export interface StoreRekapAbsenPayload {
  program_latihan_id: number;
  tanggal: string;
  jenis_latihan: string;
  keterangan?: string;
  foto_absen?: File[];
  foto_lokasi?: string[];
  file_nilai?: File[];
}

export interface UpdateRekapAbsenPayload {
  jenis_latihan?: string;
  keterangan?: string;
  foto_absen?: File[];
  foto_lokasi?: string[];
  file_nilai?: File[];
  deleted_media_ids?: number[];
}
