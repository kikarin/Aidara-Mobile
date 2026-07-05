import type { CaborLastThreePemeriksaan, CaborRankingPerbandingan3Tes } from "@/api/cabor-types";
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

export function findParticipantRank(
  ranking: CaborRankingPerbandingan3Tes[],
  pesertaId: number,
  pesertaType: string
): { rank: number; nilai: number; total: number } | null {
  const athletes = ranking.filter((entry) => entry.peserta_type === PESERTA_TYPE_ATLET);
  const index = athletes.findIndex(
    (entry) => entry.peserta_id === pesertaId && entry.peserta_type === pesertaType
  );

  if (index < 0) return null;

  return {
    rank: index + 1,
    nilai: athletes[index].nilai_rata_rata,
    total: athletes.length,
  };
}

export function findTopAthlete(
  ranking: CaborRankingPerbandingan3Tes[]
): CaborRankingPerbandingan3Tes | null {
  return ranking.find((entry) => entry.peserta_type === PESERTA_TYPE_ATLET) ?? null;
}
