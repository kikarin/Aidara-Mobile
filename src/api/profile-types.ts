export type PesertaRole = "atlet" | "pelatih" | "tenaga_pendukung";

export interface NamedEntity {
  id: number;
  nama: string;
}

export interface BiodataBase {
  id: number;
  nik?: string | null;
  nama: string;
  jenis_kelamin?: string | null;
  tempat_lahir?: string | null;
  tanggal_lahir?: string | null;
  tanggal_bergabung?: string | null;
  alamat?: string | null;
  kecamatan?: NamedEntity | null;
  kelurahan?: NamedEntity | null;
  no_hp?: string | null;
  email?: string | null;
  foto?: string | null;
  foto_thumbnail?: string | null;
  cabor?: string[];
  kategori_peserta?: NamedEntity[];
}

export interface BiodataAtlet extends BiodataBase {
  nisn?: string | null;
  agama?: string | null;
  sekolah?: string | null;
  kelas_sekolah?: string | null;
  ukuran_baju?: string | null;
  ukuran_celana?: string | null;
  ukuran_sepatu?: string | null;
  disabilitas?: string | null;
  klasifikasi?: string | null;
  iq?: string | null;
  kategori_atlet?: NamedEntity | null;
  posisi_atlet?: NamedEntity | null;
}

export interface BiodataPelatih extends BiodataBase {
  pekerjaan_selain_melatih?: string | null;
  jenis_pelatih?: NamedEntity | null;
}

export type Biodata = BiodataAtlet | BiodataPelatih | BiodataBase;

export interface BiodataResponseData {
  role: PesertaRole;
  biodata: Biodata;
  permissions: string[];
}

export interface UpdateBiodataPayload {
  nik?: string | null;
  nama?: string;
  jenis_kelamin?: "L" | "P" | null;
  tempat_lahir?: string | null;
  tanggal_lahir?: string | null;
  tanggal_bergabung?: string | null;
  alamat?: string | null;
  kecamatan_id?: number | null;
  kelurahan_id?: number | null;
  no_hp?: string | null;
  email?: string | null;
  is_delete_foto?: boolean;
  nisn?: string | null;
  agama?: string | null;
  sekolah?: string | null;
  kelas_sekolah?: string | null;
  ukuran_baju?: string | null;
  ukuran_celana?: string | null;
  ukuran_sepatu?: string | null;
  disabilitas?: string | null;
  klasifikasi?: string | null;
  iq?: string | null;
  pekerjaan_selain_melatih?: string | null;
}

export interface SertifikatItem {
  id: number;
  nama_sertifikat: string;
  penyelenggara?: string | null;
  tanggal_terbit?: string | null;
  file_url?: string | null;
}

export interface SertifikatListData {
  sertifikat: SertifikatItem[];
  permissions: string[];
}

export interface StoreSertifikatPayload {
  nama_sertifikat: string;
  penyelenggara?: string;
  tanggal_terbit?: string;
  file: File;
}

export interface PrestasiAnggotaBeregu {
  id: number;
  nama: string;
}

export interface PrestasiItem {
  id: number;
  nama_event: string;
  tingkat?: NamedEntity | null;
  tanggal?: string | null;
  peringkat?: string | null;
  juara?: string | null;
  medali?: string | null;
  jenis_prestasi?: string | null;
  kategori_peserta?: NamedEntity | null;
  kategori_prestasi_pelatih?: NamedEntity | null;
  kategori_atlet?: NamedEntity | null;
  keterangan?: string | null;
  bonus?: number | null;
  prestasi_group_id?: number | null;
  anggota_beregu?: PrestasiAnggotaBeregu[];
}

export interface PrestasiListData {
  prestasi: PrestasiItem[];
  permissions: string[];
}

export interface StorePrestasiPayload {
  nama_event: string;
  tingkat_id?: number | null;
  tanggal?: string | null;
  juara?: string | null;
  medali?: "Emas" | "Perak" | "Perunggu" | null;
  jenis_prestasi?: "individu" | "ganda/mixed/beregu/double";
  kategori_peserta_id?: number | null;
  kategori_prestasi_pelatih_id?: number | null;
  kategori_atlet_id?: number | null;
  keterangan?: string | null;
  bonus?: number | null;
  anggota_beregu?: number[];
}

export interface DokumenItem {
  id: number;
  jenis_dokumen?: NamedEntity | null;
  nomor?: string | null;
  file_url?: string | null;
}

export interface DokumenListData {
  dokumen: DokumenItem[];
  permissions: string[];
}

export interface StoreDokumenPayload {
  jenis_dokumen_id?: number | null;
  nomor?: string;
  file: File;
}
