export interface CaborKategoriPeserta {
  id: number;
  nama: string;
}

export interface CaborListItem {
  id: number;
  nama: string;
  deskripsi: string | null;
  icon: string | null;
  kategori_peserta: CaborKategoriPeserta | null;
  jumlah_atlet: number;
  jumlah_pelatih: number;
  jumlah_tenaga_pendukung: number;
  created_at?: string;
}

export interface CaborListParams {
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  kategori_peserta_id?: number;
}

export interface CaborPesertaItem {
  id: number;
  nama: string;
  foto: string | null;
  foto_thumbnail: string | null;
  jenis_kelamin: string;
  usia: number | string;
  posisi?: string;
  jenis?: string;
}

export interface CaborPesertaData {
  atlet: CaborPesertaItem[];
  pelatih: CaborPesertaItem[];
  tenaga_pendukung: CaborPesertaItem[];
}

export interface CaborPemeriksaanItem {
  id: number;
  nama_pemeriksaan: string;
  tanggal_pemeriksaan: string | null;
  cabor_kategori: { id: number; nama: string } | null;
}

export interface CaborRankingEntry {
  peserta_id: number;
  peserta_type: string;
  nama: string;
  jenis_kelamin: string;
  posisi: string;
  usia: number | string;
  nilai: number;
  predikat?: string;
  predikat_label?: string;
}

export interface CaborRankingPerTes {
  pemeriksaan_id: number;
  pemeriksaan_nama: string;
  tanggal_pemeriksaan: string | null;
  ranking: CaborRankingEntry[];
}

export interface CaborNilaiPerTes {
  pemeriksaan_id: number;
  pemeriksaan_nama: string;
  tanggal_pemeriksaan: string | null;
  nilai: number | null;
}

export interface CaborRankingPerbandingan3Tes {
  peserta_id: number;
  peserta_type: string;
  nama: string;
  jenis_kelamin: string;
  posisi: string;
  usia: number | string;
  nilai_rata_rata: number;
  predikat?: string;
  predikat_label?: string;
  nilai_per_tes: CaborNilaiPerTes[];
}

export interface CaborRankingData {
  pemeriksaan_list: CaborPemeriksaanItem[];
  ranking_total_rata_rata: CaborRankingEntry[];
  ranking_per_tes: CaborRankingPerTes[];
  ranking_perbandingan_3_tes_terakhir: CaborRankingPerbandingan3Tes[];
}

export interface CaborPerbandinganNilai {
  pemeriksaan_id: number;
  pemeriksaan_nama: string;
  tanggal_pemeriksaan: string | null;
  nilai_performa: number | null;
  predikat?: string | null;
}

export interface CaborPerbandinganAspek {
  aspek_id: number;
  aspek_nama: string;
  nilai: CaborPerbandinganNilai[];
}

export interface CaborPerbandinganPeserta {
  peserta_id: number;
  peserta_type: string;
  nama: string;
  jenis_kelamin: string;
  posisi: string;
  usia: number | string;
  aspek: CaborPerbandinganAspek[];
}

export interface CaborAspekListItem {
  id: number;
  nama: string;
  urutan: number;
}

export interface CaborPerbandinganResult {
  peserta: CaborPerbandinganPeserta[];
  pemeriksaan_list: CaborPemeriksaanItem[];
  aspek_list: CaborAspekListItem[];
}

export interface CaborLastThreeAspek {
  aspek_id: number;
  nama: string;
  nilai_performa: number | null;
  predikat?: string | null;
}

export interface CaborLastThreePemeriksaan {
  pemeriksaan_id: number;
  nama_pemeriksaan: string;
  tanggal_pemeriksaan: string | null;
  cabor_kategori: string;
  aspek_list: CaborAspekListItem[];
  aspek: CaborLastThreeAspek[];
  nilai_keseluruhan: number | null;
  predikat_keseluruhan?: string | null;
}
