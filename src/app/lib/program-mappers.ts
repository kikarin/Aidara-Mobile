import type {
  FotoAbsenApiItem,
  ProgramLatihanApiItem,
  RekapAbsenApiItem,
} from "@/api/program-latihan-types";

export type TahapProgram =
  | "persiapan-umum"
  | "persiapan-khusus"
  | "pra-pertandingan"
  | "pertandingan"
  | "transisi";

export type JenisLatihan = "fisik" | "strategi" | "teknik" | "mental" | "pemulihan";

export interface ProgramLatihan {
  id: string;
  cabor_id: number;
  cabor_kategori_id: number;
  mode_pelatih: "single" | "multiple";
  pelatih_id?: number;
  pelatih_ids: number[];
  pelatih_nama?: string;
  pelatih_names?: string[];
  wajib_absen_atlet: boolean;
  absen_jam_mulai?: string | null;
  absen_jam_selesai?: string | null;
  absen_window_label?: string | null;
  nama_program: string;
  cabor: string;
  cabor_icon: string;
  kategori: string;
  periode_mulai: Date;
  periode_selesai: Date;
  periode_hitung?: string;
  tahap: TahapProgram;
  jumlah_rekap: number;
  created_at: Date;
  keterangan?: string;
}

export interface RekapHarian {
  id: string;
  program_id: string;
  tanggal: Date;
  jenis_latihan: JenisLatihan;
  keterangan: string;
  jumlah_foto: number;
  jumlah_file: number;
  foto_absen: FotoAbsenApiItem[];
  file_nilai: { id: number; url: string; name: string }[];
}

const TAHAP_API_TO_UI: Record<string, TahapProgram> = {
  "persiapan umum": "persiapan-umum",
  "persiapan khusus": "persiapan-khusus",
  prapertandingan: "pra-pertandingan",
  pertandingan: "pertandingan",
  transisi: "transisi",
};

const TAHAP_UI_TO_API: Record<TahapProgram, string> = {
  "persiapan-umum": "persiapan umum",
  "persiapan-khusus": "persiapan khusus",
  "pra-pertandingan": "prapertandingan",
  pertandingan: "pertandingan",
  transisi: "transisi",
};

const JENIS_API_TO_UI: Record<string, JenisLatihan> = {
  latihan_fisik: "fisik",
  latihan_strategi: "strategi",
  latihan_teknik: "teknik",
  latihan_mental: "mental",
  latihan_pemulihan: "pemulihan",
};

const JENIS_UI_TO_API: Record<JenisLatihan, string> = {
  fisik: "latihan_fisik",
  strategi: "latihan_strategi",
  teknik: "latihan_teknik",
  mental: "latihan_mental",
  pemulihan: "latihan_pemulihan",
};

function caborInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function mapTahapFromApi(tahap: string | null | undefined): TahapProgram {
  if (!tahap) return "persiapan-umum";
  return TAHAP_API_TO_UI[tahap] ?? "persiapan-umum";
}

export function mapTahapToApi(tahap: TahapProgram): string {
  return TAHAP_UI_TO_API[tahap];
}

export function mapJenisFromApi(jenis: string): JenisLatihan {
  return JENIS_API_TO_UI[jenis] ?? "fisik";
}

export function mapJenisToApi(jenis: JenisLatihan): string {
  return JENIS_UI_TO_API[jenis];
}

export function mapProgramLatihanItem(
  item: ProgramLatihanApiItem,
  rekapCount = 0
): ProgramLatihan {
  const caborName = item.cabor?.nama ?? "-";
  const pelatihIds = item.pelatih_ids?.length
    ? item.pelatih_ids
    : item.pelatihs?.map((p) => p.id) ?? (item.pelatih_id ? [item.pelatih_id] : []);
  const pelatihNames = item.pelatihs?.map((p) => p.nama) ?? (item.pelatih?.nama ? [item.pelatih.nama] : []);

  return {
    id: String(item.id),
    cabor_id: item.cabor?.id ?? 0,
    cabor_kategori_id: item.cabor_kategori?.id ?? 0,
    mode_pelatih: item.mode_pelatih ?? "single",
    pelatih_id: pelatihIds[0],
    pelatih_ids: pelatihIds,
    pelatih_nama: pelatihNames.join(", ") || item.pelatih?.nama,
    pelatih_names: pelatihNames,
    wajib_absen_atlet: !!item.wajib_absen_atlet,
    absen_jam_mulai: item.absen_jam_mulai ?? null,
    absen_jam_selesai: item.absen_jam_selesai ?? null,
    absen_window_label: item.absen_window_label ?? null,
    nama_program: item.nama_program,
    cabor: caborName,
    cabor_icon: caborInitials(caborName),
    kategori: item.cabor_kategori?.nama ?? "-",
    periode_mulai: parseApiDate(item.periode_mulai),
    periode_selesai: parseApiDate(item.periode_selesai),
    periode_hitung: item.periode_hitung ?? undefined,
    tahap: mapTahapFromApi(item.tahap),
    jumlah_rekap: rekapCount,
    created_at: parseApiDateTime(item.created_at),
    keterangan: item.keterangan ?? undefined,
  };
}

export function mapProgramLatihanList(
  items: ProgramLatihanApiItem[],
  rekapCountMap?: Map<string, number>
): ProgramLatihan[] {
  return items.map((item) =>
    mapProgramLatihanItem(item, rekapCountMap?.get(String(item.id)) ?? 0)
  );
}

export function mapRekapAbsenItem(item: RekapAbsenApiItem, programId: string): RekapHarian {
  return {
    id: String(item.id),
    program_id: programId,
    tanggal: parseApiDate(item.tanggal),
    jenis_latihan: mapJenisFromApi(item.jenis_latihan),
    keterangan: item.keterangan ?? "",
    jumlah_foto: item.foto_absen.length,
    jumlah_file: item.file_nilai.length,
    foto_absen: item.foto_absen,
    file_nilai: item.file_nilai,
  };
}

export function mapRekapAbsenList(items: RekapAbsenApiItem[], programId: string): RekapHarian[] {
  return items.map((item) => mapRekapAbsenItem(item, programId));
}

export function parseCoordinate(value: number | string | null | undefined): number | undefined {
  if (value == null || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export function getFileTypeFromName(name: string): "pdf" | "xls" | "xlsx" {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "xls") return "xls";
  return "xlsx";
}

export function getTodayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseApiDate(value?: string | null): Date {
  if (!value) return new Date();
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseApiDateTime(value?: string | null): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
