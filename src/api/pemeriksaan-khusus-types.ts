import type { PaginatedMeta } from "@/api/types";

export type PkStatus = "belum" | "sebagian" | "selesai";
export type PerformaArah = "max" | "min";

export interface PkRef {
  id: number;
  nama: string;
}

export interface PkApiItem {
  id: number;
  cabor: PkRef | null;
  cabor_kategori: PkRef | null;
  nama_pemeriksaan: string;
  tanggal_pemeriksaan: string;
  status: PkStatus;
  jumlah_peserta: number;
  jumlah_atlet?: number;
  jumlah_pelatih?: number;
  jumlah_tenaga_pendukung?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PkListParams {
  page?: number;
  per_page?: number;
  search?: string;
  cabor_id?: number;
  cabor_kategori_id?: number;
  tanggal_pemeriksaan?: string;
  status?: PkStatus;
  jenis_peserta?: string;
  filter_start_date?: string;
  filter_end_date?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PkListResult {
  items: PkApiItem[];
  meta: PaginatedMeta;
  permissions: string[];
}

export interface StorePkPayload {
  cabor_id: number;
  cabor_kategori_id: number;
  nama_pemeriksaan: string;
  tanggal_pemeriksaan: string;
  status?: PkStatus;
}

export type UpdatePkPayload = Partial<StorePkPayload>;

export interface PkItemTesApi {
  id: number;
  nama: string;
  satuan: string;
  target_laki_laki?: string | null;
  target_perempuan?: string | null;
  performa_arah: PerformaArah;
  urutan: number;
  mst_template_item_tes_id?: number | null;
  target?: string | null;
  nilai?: string | null;
  persentase_performa?: number | null;
  persentase_riil?: number | null;
  predikat?: string | null;
  predikat_label?: string | null;
}

export interface PkAspekApi {
  id: number;
  nama: string;
  urutan: number;
  mst_template_aspek_id?: number | null;
  item_tes: PkItemTesApi[];
}

export interface PkSetupResult {
  pemeriksaan_khusus_id: number;
  cabor_id: number;
  aspek: PkAspekApi[];
}

export interface PkSetupPesertaResult {
  pemeriksaan_khusus_id: number;
  peserta_id: number;
  peserta: {
    id: number;
    nama: string;
    jenis_kelamin: string | null;
  };
  aspek: PkAspekApi[];
}

export interface SavePkSetupItemTesPayload {
  nama: string;
  satuan?: string;
  target_laki_laki?: string;
  target_perempuan?: string;
  performa_arah: PerformaArah;
  urutan?: number;
  mst_template_item_tes_id?: number;
}

export interface SavePkSetupAspekPayload {
  nama: string;
  urutan?: number;
  mst_template_aspek_id?: number;
  item_tes: SavePkSetupItemTesPayload[];
}

export interface SavePkSetupPayload {
  pemeriksaan_khusus_id: number;
  aspek: SavePkSetupAspekPayload[];
}

export interface CloneTemplatePayload {
  pemeriksaan_khusus_id: number;
  cabor_id: number;
}

export interface SaveTemplatePayload {
  cabor_id: number;
  aspek: Omit<SavePkSetupAspekPayload, "mst_template_aspek_id">[];
}

export interface PkTemplateAspek {
  id: number;
  nama: string;
  urutan: number;
  item_tes: Omit<PkItemTesApi, "id" | "mst_template_item_tes_id"> & { id: number }[];
}

export interface PkTemplateResult {
  has_template: boolean;
  data: PkTemplateAspek[] | null;
}

export interface PkPesertaHasilTesItem {
  id: number;
  peserta_id: number;
  nama: string;
  jenis_kelamin: string | null;
  tanggal_lahir?: string | null;
  usia: number | null;
  posisi_atlet?: string;
  foto?: string | null;
  foto_thumbnail?: string | null;
}

export interface SaveHasilTesItemPayload {
  item_tes_id: number;
  nilai?: string;
  catatan?: string;
}

export interface SaveHasilTesPesertaPayload {
  peserta_id: number;
  catatan?: string;
  item_tes: SaveHasilTesItemPayload[];
}

export interface SaveHasilTesPayload {
  pemeriksaan_khusus_id: number;
  data: SaveHasilTesPesertaPayload[];
}

export interface PkHasilTesItemResult {
  item_tes_id: number;
  nilai: string | null;
  persentase_performa: number | null;
  persentase_riil: number | null;
  predikat: string | null;
  predikat_label: string | null;
}

export interface PkHasilTesAspekResult {
  aspek_id: number;
  nilai_performa: number | null;
  predikat: string | null;
  predikat_label: string | null;
}

export interface PkHasilTesPesertaResult {
  peserta_id: number;
  peserta: { id: number; nama: string; jenis_kelamin: string | null };
  item_tes: PkHasilTesItemResult[];
  aspek: PkHasilTesAspekResult[];
  nilai_keseluruhan: number | null;
  predikat_keseluruhan: string | null;
  predikat_keseluruhan_label?: string | null;
}

export interface PkPesertaVisualisasiItem {
  peserta_id: number;
  peserta: {
    id: number;
    nama: string;
    jenis_kelamin: string | null;
    posisi: string;
    umur: number | string;
    cabor: string;
    foto?: string | null;
    foto_thumbnail?: string | null;
  };
  nilai_keseluruhan: number | null;
  predikat_keseluruhan: string | null;
  predikat_keseluruhan_label: string | null;
}

export interface PkVisualisasiAspek {
  aspek_id: number;
  nama: string;
  urutan: number;
  nilai_performa: number | null;
  predikat: string | null;
  predikat_label: string | null;
}

export interface PkVisualisasiItemTes {
  item_tes_id: number;
  aspek_id: number;
  aspek_nama: string;
  nama: string;
  satuan: string;
  target: string | null;
  target_laki_laki: string | null;
  target_perempuan: string | null;
  performa_arah: PerformaArah;
  urutan: number;
  nilai: string | null;
  persentase_performa: number | null;
  persentase_riil: number | null;
  predikat: string | null;
  predikat_label: string | null;
}

export interface PkVisualisasiResult {
  peserta_id: number;
  peserta: PkPesertaVisualisasiItem["peserta"];
  aspek: PkVisualisasiAspek[];
  item_tes: PkVisualisasiItemTes[];
  nilai_keseluruhan: number | null;
  predikat_keseluruhan: string | null;
  predikat_keseluruhan_label: string | null;
}

export interface PkVisualisasiApiResponse extends PkVisualisasiResult {
  aspek_list?: { id: number; nama: string; urutan: number }[];
}
