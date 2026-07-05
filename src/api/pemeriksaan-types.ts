import type { PaginatedMeta } from "@/api/types";

export type PemeriksaanStatus = "belum" | "sebagian" | "selesai";

export interface PemeriksaanRef {
  id: number;
  nama: string;
}

export interface PemeriksaanApiItem {
  id: number;
  cabor: PemeriksaanRef | null;
  cabor_kategori: PemeriksaanRef | null;
  tenaga_pendukung: PemeriksaanRef | null;
  nama_pemeriksaan: string;
  tanggal_pemeriksaan: string;
  status: PemeriksaanStatus;
  jumlah_parameter: number;
  jumlah_peserta: number;
  jumlah_atlet?: number;
  jumlah_pelatih?: number;
  jumlah_tenaga_pendukung?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PemeriksaanParameterItem {
  id: number;
  nama: string;
  satuan: string;
}

export interface PemeriksaanDetailApiItem extends PemeriksaanApiItem {
  parameter: PemeriksaanParameterItem[];
  peserta: PemeriksaanPesertaSummary[];
  hasil_pemeriksaan?: unknown[];
}

export interface PemeriksaanPesertaSummary {
  id: number;
  nama: string;
  jenis_kelamin: string | null;
  usia: number | null;
  posisi: string | null;
  role: string | null;
  biodata_id: number;
}

export interface PemeriksaanListParams {
  page?: number;
  per_page?: number;
  search?: string;
  cabor_id?: number;
  cabor_kategori_id?: number;
  tanggal_pemeriksaan?: string;
  status?: PemeriksaanStatus;
  filter_start_date?: string;
  filter_end_date?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PemeriksaanListResult {
  items: PemeriksaanApiItem[];
  meta: PaginatedMeta;
  permissions: string[];
}

export interface StorePemeriksaanPayload {
  cabor_id: number;
  cabor_kategori_id: number;
  tenaga_pendukung_id: number;
  nama_pemeriksaan: string;
  tanggal_pemeriksaan: string;
  status?: PemeriksaanStatus;
  parameter_ids: number[];
}

export type UpdatePemeriksaanPayload = Partial<Omit<StorePemeriksaanPayload, "parameter_ids">>;

export interface PesertaParameterValue {
  parameter_id: number;
  mst_parameter_id?: number;
  nama_parameter: string;
  satuan: string;
  nilai: string;
  trend: string;
}

export interface PemeriksaanPesertaApiItem {
  id: number;
  peserta_id: number | null;
  peserta_type: string;
  peserta: {
    id: number | null;
    nama: string;
    jenis_kelamin: string | null;
    tanggal_lahir?: string | null;
    usia: number | null;
    foto?: string | null;
    foto_thumbnail?: string | null;
  };
  status: { id: number; nama: string } | null;
  ref_status_pemeriksaan_id: number | null;
  catatan_umum: string;
  parameters: PesertaParameterValue[];
}

export interface PemeriksaanPesertaListResult {
  peserta: PemeriksaanPesertaApiItem[];
  parameters: {
    id: number;
    parameter_id: number;
    nama_parameter: string;
    satuan: string;
  }[];
}

export interface BulkUpdateParameterEntry {
  parameter_id: number;
  nilai?: string;
  trend?: string;
}

export interface BulkUpdatePesertaEntry {
  peserta_id: number;
  status?: number;
  catatan?: string;
  parameters: BulkUpdateParameterEntry[];
}

export interface BulkUpdatePesertaPayload {
  data: BulkUpdatePesertaEntry[];
}

export interface ParameterStatistikHistory {
  pemeriksaan_id: number;
  tanggal_pemeriksaan: string | null;
  tanggal_formatted: string | null;
  nilai: string | null;
  trend: string | null;
  satuan: string;
}

export interface ParameterStatistikPeserta {
  peserta_id: number;
  biodata_id: number;
  nama: string;
  cabor: PemeriksaanRef;
  cabor_kategori: PemeriksaanRef;
  role: string;
  history: ParameterStatistikHistory[];
}

export interface ParameterStatistikParams {
  cabor_id?: number;
  cabor_kategori_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface ParameterStatistikResult {
  peserta: ParameterStatistikPeserta[];
  parameter: PemeriksaanParameterItem;
}
