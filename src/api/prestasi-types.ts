export interface PrestasiMedaliCount {
  Emas: number;
  Perak: number;
  Perunggu: number;
}

export interface PrestasiAnggotaBeregu {
  id: number;
  nama: string;
  peserta_type: string;
}

export interface PrestasiItem {
  id: number;
  prestasi_group_id: number | null;
  jenis_prestasi: string;
  peserta_type: string;
  peserta_id: number;
  nama: string;
  foto?: string | null;
  foto_thumbnail?: string | null;
  cabor: string;
  nomor_posisi: string;
  juara: string;
  medali: string;
  kategori_peserta: string;
  kategori_peserta_id: number;
  bonus: number;
  nama_event: string;
  tanggal: string;
  tingkat: string;
  is_beregu?: boolean;
  jumlah_anggota?: number;
  anggota_beregu?: PrestasiAnggotaBeregu[] | null;
  disabilitas?: string | null;
  klasifikasi?: string | null;
  iq?: string | null;
}

export interface PrestasiKategoriGroup {
  kategori_peserta_id: number | null;
  kategori_peserta_nama: string;
  count: number;
  total_bonus: number;
  total_medali: PrestasiMedaliCount;
  has_more?: boolean;
  prestasi: PrestasiItem[];
}

export interface KategoriPesertaOption {
  id: number;
  nama: string;
}

export interface PrestasiListParams {
  limit?: number;
  kategori_peserta_id?: number | string;
  jenis_prestasi?: string;
}

export interface PrestasiListResult {
  groups: PrestasiKategoriGroup[];
  kategoriPesertaList: KategoriPesertaOption[];
  totalBonus: number;
  totalMedali: PrestasiMedaliCount;
}
