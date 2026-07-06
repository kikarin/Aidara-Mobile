import type {
  CaborLastThreePemeriksaan,
  CaborRankingEntry,
  CaborRankingPerbandingan3Tes,
} from "@/api/cabor-types";
import type { PesertaRole } from "@/api/profile-types";

export interface RadarPoint {
  aspek: string;
  nilai: number;
  target: number;
}

export interface AspekScoreItem {
  nama: string;
  nilai: number;
  predikat?: string | null;
}

const PESERTA_TYPE_ATLET = "App\\Models\\Atlet";

export function roleToPesertaType(role?: PesertaRole): string {
  if (role === "pelatih") return "App\\Models\\Pelatih";
  if (role === "tenaga_pendukung") return "App\\Models\\TenagaPendukung";
  return PESERTA_TYPE_ATLET;
}

export function buildAveragedAspekRadar(tests: CaborLastThreePemeriksaan[]): RadarPoint[] {
  const totals = new Map<string, { sum: number; count: number }>();

  for (const test of tests) {
    for (const aspek of test.aspek) {
      if (aspek.nilai_performa == null) continue;
      const current = totals.get(aspek.nama) ?? { sum: 0, count: 0 };
      totals.set(aspek.nama, {
        sum: current.sum + aspek.nilai_performa,
        count: current.count + 1,
      });
    }
  }

  return Array.from(totals.entries()).map(([aspek, { sum, count }]) => ({
    aspek,
    nilai: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
    target: 100,
  }));
}

export function buildAveragedAspekScores(tests: CaborLastThreePemeriksaan[]): AspekScoreItem[] {
  const totals = new Map<string, { sum: number; count: number; predikat?: string | null }>();

  for (const test of tests) {
    for (const aspek of test.aspek) {
      if (aspek.nilai_performa == null) continue;
      const current = totals.get(aspek.nama) ?? { sum: 0, count: 0, predikat: aspek.predikat };
      totals.set(aspek.nama, {
        sum: current.sum + aspek.nilai_performa,
        count: current.count + 1,
        predikat: aspek.predikat ?? current.predikat,
      });
    }
  }

  return Array.from(totals.entries()).map(([nama, { sum, count, predikat }]) => ({
    nama,
    nilai: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
    predikat,
  }));
}

export function averageOverallScore(tests: CaborLastThreePemeriksaan[]): number | null {
  const values = tests
    .map((test) => test.nilai_keseluruhan)
    .filter((value): value is number => value != null);

  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function isAtletEntry(pesertaType: string): boolean {
  return pesertaType === PESERTA_TYPE_ATLET || pesertaType.endsWith("Atlet");
}

export function findParticipantRank(
  perbandinganRanking: CaborRankingPerbandingan3Tes[],
  totalRanking: CaborRankingEntry[],
  pesertaId: number,
  pesertaType: string
): { rank: number; nilai: number; total: number } | null {
  const athletesFromPerbandingan = perbandinganRanking.filter((entry) =>
    isAtletEntry(entry.peserta_type)
  );
  const perbandinganIndex = athletesFromPerbandingan.findIndex(
    (entry) => entry.peserta_id === pesertaId
  );

  if (perbandinganIndex >= 0) {
    return {
      rank: perbandinganIndex + 1,
      nilai: athletesFromPerbandingan[perbandinganIndex].nilai_rata_rata,
      total: athletesFromPerbandingan.length,
    };
  }

  const athletesFromTotal = totalRanking.filter((entry) => isAtletEntry(entry.peserta_type));
  const totalIndex = athletesFromTotal.findIndex((entry) => entry.peserta_id === pesertaId);

  if (totalIndex < 0) return null;

  return {
    rank: totalIndex + 1,
    nilai: athletesFromTotal[totalIndex].nilai,
    total: athletesFromTotal.length,
  };
}

export interface FeaturedAthlete {
  peserta_id: number;
  peserta_type: string;
  nama: string;
  nilai_rata_rata: number | null;
}

export function findTopAthlete(
  perbandinganRanking: CaborRankingPerbandingan3Tes[],
  totalRanking: CaborRankingEntry[] = []
): FeaturedAthlete | null {
  const fromPerbandingan = perbandinganRanking.find((entry) => isAtletEntry(entry.peserta_type));
  if (fromPerbandingan) {
    return {
      peserta_id: fromPerbandingan.peserta_id,
      peserta_type: fromPerbandingan.peserta_type,
      nama: fromPerbandingan.nama,
      nilai_rata_rata: fromPerbandingan.nilai_rata_rata,
    };
  }

  const fromTotal = totalRanking.find((entry) => isAtletEntry(entry.peserta_type));
  if (!fromTotal) return null;

  return {
    peserta_id: fromTotal.peserta_id,
    peserta_type: fromTotal.peserta_type,
    nama: fromTotal.nama,
    nilai_rata_rata: fromTotal.nilai,
  };
}
