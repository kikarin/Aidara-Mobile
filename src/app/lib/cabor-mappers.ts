import type {
  CaborAspekListItem,
  CaborListItem,
  CaborPerbandinganPeserta,
  CaborPesertaItem,
  CaborRankingEntry,
  CaborRankingPerbandingan3Tes,
  CaborLastThreePemeriksaan,
  CaborPesertaData,
} from "@/api/cabor-types";

export interface CaborData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  athleteCount: number;
  coachCount: number;
  supportStaffCount: number;
}

export interface CaborParticipant {
  id: string;
  name: string;
  age: string;
  gender: "male" | "female";
  position?: string;
  avatar?: string;
}

export interface CaborRankingRow {
  rank: number;
  id: string;
  pesertaId: number;
  pesertaType: string;
  name: string;
  age: string;
  position: string;
  score: number;
  avatar?: string;
  predikatLabel?: string;
}

export interface ChartSeriesKey {
  key: string;
  name: string;
  color: string;
}

export const CHART_COLORS = ["#DC2626", "#2563EB", "#16A34A", "#D97706", "#7C3AED"];

export const COMPARISON_TEST_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

function formatUsia(usia: number | string): string {
  if (typeof usia === "number") return String(usia);
  if (usia && usia !== "-") return String(usia);
  return "-";
}

function mapGender(jenisKelamin: string): "male" | "female" {
  return jenisKelamin === "P" ? "female" : "male";
}

function caborInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function mapCaborItem(item: CaborListItem): CaborData {
  return {
    id: String(item.id),
    name: item.nama,
    description: item.deskripsi || "-",
    icon: caborInitials(item.nama),
    category: item.kategori_peserta?.nama || "-",
    athleteCount: item.jumlah_atlet,
    coachCount: item.jumlah_pelatih,
    supportStaffCount: item.jumlah_tenaga_pendukung,
  };
}

export function mapCaborList(items: CaborListItem[]): CaborData[] {
  return items.map(mapCaborItem);
}

export function mapPesertaItem(item: CaborPesertaItem, role: "atlet" | "pelatih" | "support"): CaborParticipant {
  return {
    id: String(item.id),
    name: item.nama,
    age: formatUsia(item.usia),
    gender: mapGender(item.jenis_kelamin),
    position: role === "atlet" ? item.posisi : item.jenis,
    avatar: item.foto_thumbnail || item.foto || undefined,
  };
}

export function buildPesertaAvatarMap(pesertaData: CaborPesertaData): Map<string, string> {
  const map = new Map<string, string>();
  const all = [
    ...pesertaData.atlet,
    ...pesertaData.pelatih,
    ...pesertaData.tenaga_pendukung,
  ];
  all.forEach((item) => {
    const avatar = item.foto_thumbnail || item.foto;
    if (avatar) {
      map.set(String(item.id), avatar);
    }
  });
  return map;
}

export function mapRankingEntry(
  entry: CaborRankingEntry,
  rank: number,
  avatarMap?: Map<string, string>
): CaborRankingRow {
  return {
    rank,
    id: String(entry.peserta_id),
    pesertaId: entry.peserta_id,
    pesertaType: entry.peserta_type,
    name: entry.nama,
    age: formatUsia(entry.usia),
    position: entry.posisi || "-",
    score: entry.nilai,
    avatar: avatarMap?.get(String(entry.peserta_id)),
    predikatLabel: entry.predikat_label,
  };
}

export function mapRankingList(
  entries: CaborRankingEntry[],
  avatarMap?: Map<string, string>
): CaborRankingRow[] {
  return entries.map((entry, index) => mapRankingEntry(entry, index + 1, avatarMap));
}

export function buildTrendChartFromRanking(
  items: CaborRankingPerbandingan3Tes[]
): { data: Record<string, string | number>[]; series: ChartSeriesKey[] } {
  const topItems = items.slice(0, 5);
  if (topItems.length === 0) {
    return { data: [], series: [] };
  }

  const testLabels = topItems[0]?.nilai_per_tes ?? [];
  const data = testLabels.map((test, testIndex) => {
    const point: Record<string, string | number> = {
      label: shortenLabel(test.pemeriksaan_nama, testIndex),
    };
    topItems.forEach((item, itemIndex) => {
      const matched = item.nilai_per_tes.find((t) => t.pemeriksaan_id === test.pemeriksaan_id);
      point[`s${itemIndex}`] = matched?.nilai ?? 0;
    });
    return point;
  });

  const series = topItems.map((item, index) => ({
    key: `s${index}`,
    name: item.nama,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return { data, series };
}

export function buildCategoryChartFromPerbandingan(
  peserta: CaborPerbandinganPeserta[],
  aspekList: CaborAspekListItem[]
): { data: Record<string, string | number>[]; series: ChartSeriesKey[] } {
  const topPeserta = peserta.slice(0, 3);
  if (topPeserta.length === 0 || aspekList.length === 0) {
    return { data: [], series: [] };
  }

  const data = aspekList.map((aspek) => {
    const point: Record<string, string | number> = { category: aspek.nama };
    topPeserta.forEach((p, index) => {
      const aspekData = p.aspek.find((a) => a.aspek_id === aspek.id);
      const values =
        aspekData?.nilai
          ?.map((n) => n.nilai_performa)
          .filter((v): v is number => v != null) ?? [];
      const avg = values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
      point[`p${index}`] = Math.round(avg * 10) / 10;
    });
    return point;
  });

  const series = topPeserta.map((p, index) => ({
    key: `p${index}`,
    name: p.nama,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return { data, series };
}

export function buildComparisonSummary(
  rankings: CaborRankingEntry[],
  pemeriksaanCount: number,
  trendItems: CaborRankingPerbandingan3Tes[]
) {
  const avgScore =
    rankings.length > 0
      ? Math.round((rankings.reduce((sum, r) => sum + r.nilai, 0) / rankings.length) * 10) / 10
      : 0;

  let improvement = 0;
  if (trendItems.length > 0) {
    const firstTest = trendItems[0]?.nilai_per_tes?.[0]?.nilai ?? 0;
    const lastTests = trendItems[0]?.nilai_per_tes ?? [];
    const lastTest = lastTests[lastTests.length - 1]?.nilai ?? 0;
    improvement = Math.round((lastTest - firstTest) * 10) / 10;
  }

  return {
    avgScore: avgScore.toFixed(1),
    testCount: String(pemeriksaanCount),
    improvement: improvement >= 0 ? `+${improvement}` : String(improvement),
  };
}

function shortenLabel(name: string, index: number): string {
  if (!name) return `Tes ${index + 1}`;
  return name.length > 12 ? `${name.slice(0, 12)}…` : name;
}

export function getTesLabel(index: number, total: number): string {
  const tesNumber = total - index;
  if (tesNumber === 1) return "TES I";
  if (tesNumber === 2) return "TES II";
  if (tesNumber === 3) return "TES III";
  return `TES ${tesNumber}`;
}

export function formatPersentase(value: number | null | undefined): string {
  if (value == null) return "-";
  return `${value.toFixed(1)}%`;
}

export function formatTanggalPanjang(value: string | null): string {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function formatTanggalSingkat(value: string | null): string {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export function buildLastThreeAspekList(items: CaborLastThreePemeriksaan[]): CaborAspekListItem[] {
  if (items.length === 0) return [];

  const withAspek = items.find((item) => item.aspek_list.length > 0);
  if (withAspek) return withAspek.aspek_list;

  const names = new Map<string, CaborAspekListItem>();
  items.forEach((item) => {
    item.aspek.forEach((aspek, index) => {
      const key = aspek.nama.trim().toLowerCase();
      if (!names.has(key)) {
        names.set(key, { id: aspek.aspek_id, nama: aspek.nama, urutan: index + 1 });
      }
    });
  });
  return Array.from(names.values());
}

export function buildLastThreeRadarChart(
  items: CaborLastThreePemeriksaan[],
  aspekList: CaborAspekListItem[]
): { data: Record<string, string | number>[]; series: ChartSeriesKey[] } {
  if (items.length === 0 || aspekList.length === 0) {
    return { data: [], series: [] };
  }

  const data = aspekList.map((aspek) => {
    const point: Record<string, string | number> = { subject: aspek.nama };
    items.forEach((item, index) => {
      const aspekNama = aspek.nama.trim().toLowerCase();
      const matched = item.aspek.find((a) => a.nama.trim().toLowerCase() === aspekNama);
      point[`t${index}`] = matched?.nilai_performa ?? 0;
    });
    return point;
  });

  const series = items.map((item, index) => {
    const tesLabel = getTesLabel(index, items.length);
    const tanggal = formatTanggalSingkat(item.tanggal_pemeriksaan);
    return {
      key: `t${index}`,
      name: `${tesLabel} (${tanggal})`,
      color: COMPARISON_TEST_COLORS[index % COMPARISON_TEST_COLORS.length],
    };
  });

  return { data, series };
}

export function getTesCardStyle(index: number) {
  if (index === 0) {
    return {
      border: "border-blue-500",
      bg: "bg-blue-500/10",
      text: "text-blue-700 dark:text-blue-400",
    };
  }
  if (index === 1) {
    return {
      border: "border-green-500",
      bg: "bg-green-500/10",
      text: "text-green-700 dark:text-green-400",
    };
  }
  return {
    border: "border-orange-500",
    bg: "bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
  };
}

export function pickLastPemeriksaanIds(
  pemeriksaanList: { id: number }[],
  count = 3
): number[] {
  return pemeriksaanList
    .slice(-count)
    .map((p) => p.id)
    .filter((id) => id != null);
}
