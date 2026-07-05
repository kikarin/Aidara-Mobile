import * as React from "react";
import { useCaborLastThreePemeriksaan, useCaborList, useCaborRanking } from "@/hooks/use-cabor";
import { useProfileBiodata } from "@/hooks/use-profile";
import {
  averageOverallScore,
  buildAveragedAspekRadar,
  buildAveragedAspekScores,
  findParticipantRank,
  findTopAthlete,
  roleToPesertaType,
} from "@/app/lib/home-mappers";
import type { PesertaRole } from "@/api/profile-types";

export function useHomeDashboard() {
  const biodataQuery = useProfileBiodata();
  const caborListQuery = useCaborList();

  const biodata = biodataQuery.data;
  const role = biodata?.role;
  const pesertaId = biodata?.biodata.id;
  const pesertaName = biodata?.biodata.nama ?? "";
  const avatar = biodata?.biodata.foto_thumbnail || biodata?.biodata.foto || undefined;
  const caborName = biodata?.biodata.cabor?.[0];

  const caborId = React.useMemo(() => {
    if (!caborName) return null;
    const match = caborListQuery.data?.find((item) => item.nama === caborName);
    return match ? String(match.id) : null;
  }, [caborListQuery.data, caborName]);

  const rankingQuery = useCaborRanking(caborId ?? "");
  const rankingList = rankingQuery.data?.ranking_perbandingan_3_tes_terakhir ?? [];

  const isStaff = role === "pelatih" || role === "tenaga_pendukung";
  const topAthlete = React.useMemo(
    () => (isStaff ? findTopAthlete(rankingList) : null),
    [isStaff, rankingList]
  );

  const targetPesertaId = isStaff ? topAthlete?.peserta_id : pesertaId;
  const targetPesertaType = isStaff
    ? topAthlete?.peserta_type ?? roleToPesertaType("atlet")
    : roleToPesertaType(role);

  const lastThreeQuery = useCaborLastThreePemeriksaan(
    caborId,
    targetPesertaId ? String(targetPesertaId) : null,
    targetPesertaType
  );

  const lastThreeTests = lastThreeQuery.data ?? [];
  const radarData = React.useMemo(() => buildAveragedAspekRadar(lastThreeTests), [lastThreeTests]);
  const aspekScores = React.useMemo(() => buildAveragedAspekScores(lastThreeTests), [lastThreeTests]);
  const overallScore = React.useMemo(() => averageOverallScore(lastThreeTests), [lastThreeTests]);

  const participantRank = React.useMemo(() => {
    if (!pesertaId || isStaff) return null;
    return findParticipantRank(rankingList, pesertaId, roleToPesertaType(role as PesertaRole));
  }, [pesertaId, isStaff, rankingList, role]);

  const isLoading =
    biodataQuery.isLoading ||
    caborListQuery.isLoading ||
    rankingQuery.isLoading ||
    lastThreeQuery.isLoading;

  return {
    isLoading,
    role,
    pesertaName,
    avatar,
    caborName,
    caborId,
    isStaff,
    featuredAthleteName: isStaff ? topAthlete?.nama : pesertaName,
    overallScore,
    radarData,
    aspekScores,
    participantRank,
    hasPerformanceData: lastThreeTests.length > 0 && radarData.length > 0,
    refetch: async () => {
      await Promise.all([
        biodataQuery.refetch(),
        caborListQuery.refetch(),
        rankingQuery.refetch(),
        lastThreeQuery.refetch(),
      ]);
    },
  };
}
