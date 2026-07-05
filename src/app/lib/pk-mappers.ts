import type {
  PerformaArah,
  PkApiItem,
  PkAspekApi,
  PkSetupResult,
  PkStatus,
  PkVisualisasiApiResponse,
  SaveHasilTesPayload,
  SavePkSetupPayload,
} from "@/api/pemeriksaan-khusus-types";

export type { PkStatus };

export interface Assessment {
  id: string;
  cabor_id: number;
  cabor_kategori_id: number;
  nama: string;
  cabor: string;
  cabor_kategori: string;
  cabor_icon: string;
  tanggal: Date;
  status: PkStatus;
  jumlah_peserta: number;
  jumlah_atlet: number;
  jumlah_pelatih: number;
  jumlah_tenaga_pendukung: number;
}

export type PerformanceDirUi = "higher" | "lower";

export interface ItemTesUi {
  id: string;
  apiId?: number;
  nama: string;
  satuan: string;
  target_l: string;
  target_p: string;
  arah: PerformanceDirUi;
}

export interface AspekUi {
  id: string;
  apiId?: number;
  nama: string;
  items: ItemTesUi[];
  expanded: boolean;
}

const ARAH_UI_TO_API: Record<PerformanceDirUi, PerformaArah> = {
  higher: "max",
  lower: "min",
};

const ARAH_API_TO_UI: Record<PerformaArah, PerformanceDirUi> = {
  max: "higher",
  min: "lower",
};

function caborInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase();
}

function parseApiDate(value?: string | null): Date {
  if (!value) return new Date();
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function mapPerformaArahToApi(arah: PerformanceDirUi): PerformaArah {
  return ARAH_UI_TO_API[arah];
}

export function mapPerformaArahFromApi(arah: PerformaArah): PerformanceDirUi {
  return ARAH_API_TO_UI[arah] ?? "higher";
}

export function mapPkItem(item: PkApiItem): Assessment {
  const caborName = item.cabor?.nama ?? "-";
  return {
    id: String(item.id),
    cabor_id: item.cabor?.id ?? 0,
    cabor_kategori_id: item.cabor_kategori?.id ?? 0,
    nama: item.nama_pemeriksaan,
    cabor: caborName,
    cabor_kategori: item.cabor_kategori?.nama ?? "-",
    cabor_icon: caborInitials(caborName),
    tanggal: parseApiDate(item.tanggal_pemeriksaan),
    status: item.status,
    jumlah_peserta: item.jumlah_peserta,
    jumlah_atlet: item.jumlah_atlet ?? 0,
    jumlah_pelatih: item.jumlah_pelatih ?? 0,
    jumlah_tenaga_pendukung: item.jumlah_tenaga_pendukung ?? 0,
  };
}

export function mapPkList(items: PkApiItem[]): Assessment[] {
  return items.map(mapPkItem);
}

export function mapAspekFromApi(aspek: PkAspekApi[], expandedFirst = true): AspekUi[] {
  return aspek.map((a, index) => ({
    id: `asp-${a.id}`,
    apiId: a.id,
    nama: a.nama,
    expanded: expandedFirst && index === 0,
    items: (a.item_tes ?? []).map((item) => ({
      id: `item-${item.id}`,
      apiId: item.id,
      nama: item.nama,
      satuan: item.satuan ?? "",
      target_l: item.target_laki_laki ?? "",
      target_p: item.target_perempuan ?? "",
      arah: mapPerformaArahFromApi(item.performa_arah),
    })),
  }));
}

export function mapAspekToSavePayload(aspek: AspekUi[]): SavePkSetupPayload["aspek"] {
  return aspek.map((a, aspIdx) => ({
    nama: a.nama,
    urutan: aspIdx + 1,
    item_tes: a.items.map((item, itemIdx) => ({
      nama: item.nama,
      satuan: item.satuan || undefined,
      target_laki_laki: item.target_l || undefined,
      target_perempuan: item.target_p || undefined,
      performa_arah: mapPerformaArahToApi(item.arah),
      urutan: itemIdx + 1,
    })),
  }));
}

export function buildSaveSetupPayload(pkId: number, aspek: AspekUi[]): SavePkSetupPayload {
  return {
    pemeriksaan_khusus_id: pkId,
    aspek: mapAspekToSavePayload(aspek),
  };
}

export function buildSaveHasilTesPayload(
  pkId: number,
  pesertaId: number,
  items: { itemTesId: number; nilai: string }[]
): SaveHasilTesPayload {
  return {
    pemeriksaan_khusus_id: pkId,
    data: [
      {
        peserta_id: pesertaId,
        item_tes: items
          .filter((i) => i.nilai.trim() !== "")
          .map((i) => ({ item_tes_id: i.itemTesId, nilai: i.nilai })),
      },
    ],
  };
}

export function buildRadarChartData(visualisasi: PkVisualisasiApiResponse) {
  return visualisasi.aspek.map((a) => ({
    aspek: a.nama,
    nilai: a.nilai_performa ?? 0,
    target: 100,
  }));
}

export function buildBarChartData(visualisasi: PkVisualisasiApiResponse) {
  return buildRadarChartData(visualisasi);
}

export function buildVisualisasiInsights(visualisasi: PkVisualisasiApiResponse) {
  const aspek = visualisasi.aspek.filter((a) => a.nilai_performa != null);
  if (aspek.length === 0) {
    return {
      best: null,
      worst: null,
      average: 0,
      overall: visualisasi.nilai_keseluruhan ?? 0,
    };
  }

  const sorted = [...aspek].sort((a, b) => (b.nilai_performa ?? 0) - (a.nilai_performa ?? 0));
  const average = aspek.reduce((sum, a) => sum + (a.nilai_performa ?? 0), 0) / aspek.length;

  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
    average,
    overall: visualisasi.nilai_keseluruhan ?? average,
  };
}

export function countAspekFromSetup(setup?: PkSetupResult | null): number {
  return setup?.aspek?.length ?? 0;
}

export function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((p) => p.charAt(0)).join("").toUpperCase();
}

export function getPkStatusLabel(status: PkStatus): string {
  if (status === "selesai") return "Selesai";
  if (status === "sebagian") return "Berjalan";
  return "Belum";
}
