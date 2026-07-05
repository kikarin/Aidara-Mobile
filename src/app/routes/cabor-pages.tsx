import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { CaborListScreen } from "@/app/components/cabor/cabor-list-screen";
import { CaborDetailScreen } from "@/app/components/cabor/cabor-detail-screen";
import { CaborParticipantsScreen } from "@/app/components/cabor/cabor-participants-screen";
import { CaborRankingScreen } from "@/app/components/cabor/cabor-ranking-screen";
import { CaborComparisonScreen } from "@/app/components/cabor/cabor-comparison-screen";
import { useCaborDetail } from "@/hooks/use-cabor";
import { PageLoadingSkeleton } from "@/app/components/ui/page-loading-skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { parseApiError } from "@/hooks/use-api-error";

export function CaborListPage() {
  const navigate = useNavigate();

  return (
    <CaborListScreen
      onBack={() => navigate("/")}
      onSelectCabor={(cabor) => navigate(`/cabor/${cabor.id}`)}
    />
  );
}

export function CaborListFromHomePage() {
  const navigate = useNavigate();

  return (
    <CaborListScreen
      onBack={() => navigate("/")}
      onSelectCabor={(cabor) => navigate(`/cabor/${cabor.id}`)}
    />
  );
}

export function CaborDetailPage() {
  const navigate = useNavigate();
  const { caborId = "" } = useParams();

  return (
    <CaborDetailScreen
      caborId={caborId}
      onBack={() => navigate("/cabor")}
      onNavigateTo={(screen) => {
        if (screen === "participants") navigate(`/cabor/${caborId}/participants`);
        if (screen === "ranking") navigate(`/cabor/${caborId}/ranking`);
        if (screen === "comparison") navigate(`/cabor/${caborId}/comparison`);
      }}
    />
  );
}

export function CaborParticipantsPage() {
  const navigate = useNavigate();
  const { caborId = "" } = useParams();
  const detailQuery = useCaborDetail(caborId);

  if (detailQuery.isLoading) return <PageLoadingSkeleton variant="detail" />;
  if (detailQuery.error) {
    return (
      <div className="px-4 pt-4">
        <ErrorState message={parseApiError(detailQuery.error).message} onRetry={() => detailQuery.refetch()} />
      </div>
    );
  }

  return (
    <CaborParticipantsScreen
      caborId={caborId}
      caborName={detailQuery.data?.nama ?? ""}
      onBack={() => navigate(`/cabor/${caborId}`)}
    />
  );
}

export function CaborRankingPage() {
  const navigate = useNavigate();
  const { caborId = "" } = useParams();
  const detailQuery = useCaborDetail(caborId);

  if (detailQuery.isLoading) return <PageLoadingSkeleton variant="detail" />;

  return (
    <CaborRankingScreen
      caborId={caborId}
      caborName={detailQuery.data?.nama ?? ""}
      onBack={() => navigate(`/cabor/${caborId}`)}
    />
  );
}

export function CaborComparisonPage() {
  const navigate = useNavigate();
  const { caborId = "" } = useParams();
  const detailQuery = useCaborDetail(caborId);

  if (detailQuery.isLoading) return <PageLoadingSkeleton variant="detail" />;

  return (
    <CaborComparisonScreen
      caborId={caborId}
      caborName={detailQuery.data?.nama ?? ""}
      onBack={() => navigate(`/cabor/${caborId}`)}
    />
  );
}
