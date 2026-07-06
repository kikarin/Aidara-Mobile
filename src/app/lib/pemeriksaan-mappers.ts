import type {
  BulkUpdatePesertaEntry,
  ParameterStatistikHistory,
  ParameterStatistikPeserta,
  PesertaParameterValue,
  PemeriksaanApiItem,
  PemeriksaanDetailApiItem,
  PemeriksaanPesertaApiItem,
  PemeriksaanStatus,
} from "@/api/pemeriksaan-types";

export type { PemeriksaanStatus };

export interface Pemeriksaan {
  id: string;
  cabor_id: number;
  cabor_kategori_id: number;
  tenaga_pendukung_id: number;
  nama: string;
  cabor: string;
  cabor_icon: string;
  kategori: string;
  tenaga_pendukung: string;
  tanggal: Date;
  status: PemeriksaanStatus;
  jumlah_parameter: number;
  jumlah_peserta: number;
  progress: number;
}

export interface PemeriksaanParameter {
  id: number;
  nama: string;
  satuan: string;
}

export interface PemeriksaanDetail extends Pemeriksaan {
  jumlah_atlet: number;
  jumlah_pelatih: number;
  jumlah_tenaga_pendukung: number;
  parameter: PemeriksaanParameter[];
}

export type TrendUi = "naik" | "turun" | "stabil" | "";
export type ParticipantRole = "atlet" | "pelatih" | "tenaga-pendukung";

const TREND_UI_TO_API: Record<Exclude<TrendUi, "">, string> = {
  naik: "kenaikan",
  turun: "penurunan",
  stabil: "stabil",
};

const TREND_API_TO_UI: Record<string, TrendUi> = {
  kenaikan: "naik",
  penurunan: "turun",
  stabil: "stabil",
};

function caborInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function parseApiDate(value?: string | null): Date {
  if (!value) return new Date();
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function statusToProgress(status: PemeriksaanStatus): number {
  if (status === "selesai") return 100;
  if (status === "sebagian") return 50;
  return 0;
}

export function mapTrendFromApi(trend?: string | null): TrendUi {
  if (!trend) return "";
  return TREND_API_TO_UI[trend] ?? "stabil";
}

export function mapTrendToApi(trend: TrendUi): string {
  if (!trend) return "stabil";
  return TREND_UI_TO_API[trend];
}

export function mapPesertaTypeToRole(pesertaType: string): ParticipantRole {
  if (pesertaType.includes("Pelatih")) return "pelatih";
  if (pesertaType.includes("TenagaPendukung")) return "tenaga-pendukung";
  return "atlet";
}

export function mapRoleToJenisPeserta(role: ParticipantRole | "semua"): string {
  if (role === "semua") return "all";
  return role;
}

/** Parameter fields for input form — always uses pemeriksaan_parameter id as parameter_id */
export function getParticipantParameterFields(
  participant: PemeriksaanPesertaApiItem,
  pemeriksaanParameters: { id: number; parameter_id: number; nama_parameter: string; satuan: string }[] = []
): PesertaParameterValue[] {
  if (participant.parameters.length > 0) {
    return participant.parameters;
  }

  return pemeriksaanParameters.map((p) => ({
    parameter_id: p.id,
    mst_parameter_id: p.parameter_id,
    nama_parameter: p.nama_parameter,
    satuan: p.satuan,
    nilai: "",
    trend: "",
  }));
}

export function mapPemeriksaanItem(item: PemeriksaanApiItem): Pemeriksaan {
  const caborName = item.cabor?.nama ?? "-";
  return {
    id: String(item.id),
    cabor_id: item.cabor?.id ?? 0,
    cabor_kategori_id: item.cabor_kategori?.id ?? 0,
    tenaga_pendukung_id: item.tenaga_pendukung?.id ?? 0,
    nama: item.nama_pemeriksaan,
    cabor: caborName,
    cabor_icon: caborInitials(caborName),
    kategori: item.cabor_kategori?.nama ?? "-",
    tenaga_pendukung: item.tenaga_pendukung?.nama ?? "-",
    tanggal: parseApiDate(item.tanggal_pemeriksaan),
    status: item.status,
    jumlah_parameter: item.jumlah_parameter,
    jumlah_peserta: item.jumlah_peserta,
    progress: statusToProgress(item.status),
  };
}

export function mapPemeriksaanList(items: PemeriksaanApiItem[]): Pemeriksaan[] {
  return items.map(mapPemeriksaanItem);
}

export function mapPemeriksaanDetail(item: PemeriksaanDetailApiItem): PemeriksaanDetail {
  const base = mapPemeriksaanItem(item);
  return {
    ...base,
    jumlah_atlet: item.jumlah_atlet ?? 0,
    jumlah_pelatih: item.jumlah_pelatih ?? 0,
    jumlah_tenaga_pendukung: item.jumlah_tenaga_pendukung ?? 0,
    parameter: (item.parameter ?? []).map((p) => ({
      id: p.id,
      nama: p.nama,
      satuan: p.satuan,
    })),
  };
}

export function getParticipantCompletionStatus(
  parameters: { nilai: string }[]
): "belum" | "sebagian" | "selesai" {
  const filled = parameters.filter((p) => p.nilai && p.nilai.trim() !== "").length;
  if (filled === 0) return "belum";
  if (filled >= parameters.length) return "selesai";
  return "sebagian";
}

export function buildBulkUpdateEntry(
  peserta: PemeriksaanPesertaApiItem,
  values: Record<number, { nilai: string; trend: TrendUi }>,
  statusId?: number,
  catatan?: string
): BulkUpdatePesertaEntry {
  return {
    peserta_id: peserta.id,
    status: statusId,
    catatan,
    parameters: peserta.parameters.map((param) => ({
      parameter_id: param.parameter_id,
      nilai: values[param.parameter_id]?.nilai ?? param.nilai ?? "",
      trend: mapTrendToApi(values[param.parameter_id]?.trend ?? mapTrendFromApi(param.trend)),
    })),
  };
}

export function buildAverageTrendData(histories: ParameterStatistikHistory[]) {
  const grouped = new Map<string, { label: string; values: number[]; sortKey: string }>();

  histories.forEach((entry) => {
    if (!entry.nilai || entry.tanggal_pemeriksaan == null) return;
    const num = Number(entry.nilai);
    if (!Number.isFinite(num)) return;

    const key = entry.tanggal_pemeriksaan;
    const existing = grouped.get(key) ?? {
      label: entry.tanggal_formatted ?? key,
      values: [],
      sortKey: key,
    };
    existing.values.push(num);
    grouped.set(key, existing);
  });

  return Array.from(grouped.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map((item) => ({
      tanggal: item.label,
      nilai: Number((item.values.reduce((a, b) => a + b, 0) / item.values.length).toFixed(1)),
    }));
}

export function buildLatestValuesDistribution(peserta: ParameterStatistikPeserta[]) {
  const latestValues = peserta
    .map((p) => {
      const last = [...p.history].reverse().find((h) => h.nilai && Number.isFinite(Number(h.nilai)));
      return last ? Number(last.nilai) : null;
    })
    .filter((v): v is number => v != null);

  if (latestValues.length === 0) return [];

  const min = Math.floor(Math.min(...latestValues));
  const max = Math.ceil(Math.max(...latestValues));
  const step = Math.max(5, Math.ceil((max - min) / 5) || 5);
  const buckets: { range: string; count: number }[] = [];

  for (let start = min; start <= max; start += step) {
    const end = start + step;
    buckets.push({
      range: end >= max ? `${start}+` : `${start}-${end}`,
      count: latestValues.filter((v) => v >= start && (end >= max ? true : v < end)).length,
    });
  }

  return buckets.filter((b) => b.count > 0);
}

export function getStatistikSummary(values: number[]) {
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, last: 0, prev: 0 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const last = values[values.length - 1];
  const prev = values.length > 1 ? values[values.length - 2] : last;
  return { min, max, avg, last, prev };
}
