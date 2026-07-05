import * as React from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ProgramListScreen } from "@/app/components/program/program-list-screen";
import { ProgramFormScreen } from "@/app/components/program/program-form-screen";
import { ProgramDetailScreen } from "@/app/components/program/program-detail-screen";
import { RekapHomeScreen } from "@/app/components/program/rekap-home-screen";
import { RekapFormScreen } from "@/app/components/program/rekap-form-screen";
import { RekapDetailScreen } from "@/app/components/program/rekap-detail-screen";
import { AbsenAtletScreen } from "@/app/components/program/absen-atlet-screen";
import { AbsenMonitorScreen } from "@/app/components/program/absen-monitor-screen";
import { PageLoadingSkeleton } from "@/app/components/ui/page-loading-skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { useProgramDetail } from "@/hooks/use-program-latihan";
import { useRekapAbsenList } from "@/hooks/use-rekap-absen";
import { useProgramAccess } from "@/hooks/use-program-access";
import { parseApiError } from "@/hooks/use-api-error";
import { mapRekapAbsenList } from "@/app/lib/program-mappers";

function RequireManageProgram({ children }: { children: React.ReactNode }) {
  const { isAtlet, isLoading } = useProgramAccess();
  if (isLoading) return <PageLoadingSkeleton variant="detail" />;
  if (isAtlet) return <Navigate to="/program" replace />;
  return <>{children}</>;
}

export function ProgramListPage() {
  const navigate = useNavigate();
  const { canManageProgram } = useProgramAccess();

  return (
    <ProgramListScreen
      onBack={() => navigate("/")}
      onSelectProgram={(p) => navigate(`/program/${p.id}`)}
      onCreateProgram={canManageProgram ? () => navigate("/program/create") : undefined}
    />
  );
}

export function ProgramCreatePage() {
  const navigate = useNavigate();

  return (
    <RequireManageProgram>
      <ProgramFormScreen
        onBack={() => navigate("/program")}
        onSaved={(program) => navigate(`/program/${program.id}`)}
      />
    </RequireManageProgram>
  );
}

export function ProgramDetailPage() {
  const navigate = useNavigate();
  const { programId = "" } = useParams();
  const programQuery = useProgramDetail(programId);
  const { canManageProgram } = useProgramAccess();

  if (programQuery.isLoading) return <PageLoadingSkeleton variant="detail" />;

  if (programQuery.error || !programQuery.data) {
    return (
      <div className="px-4 pt-4">
        <ErrorState
          message={programQuery.error ? parseApiError(programQuery.error).message : "Program tidak ditemukan"}
          onRetry={() => programQuery.refetch()}
        />
      </div>
    );
  }

  const program = programQuery.data;

  return (
    <ProgramDetailScreen
      program={program}
      onBack={() => navigate("/program")}
      onEdit={() => navigate(`/program/${programId}/edit`)}
      onOpenRekap={() => navigate(`/program/${programId}/rekap`)}
      onOpenAbsen={() => navigate(`/program/${programId}/absen`)}
      onOpenMonitoring={canManageProgram ? () => navigate(`/program/${programId}/monitoring`) : undefined}
      onDeleted={() => {
        toast.success("Program dihapus");
        navigate("/program");
      }}
    />
  );
}

export function ProgramEditPage() {
  const navigate = useNavigate();
  const { programId = "" } = useParams();
  const programQuery = useProgramDetail(programId);

  return (
    <RequireManageProgram>
      {programQuery.isLoading ? (
        <PageLoadingSkeleton variant="detail" />
      ) : !programQuery.data ? (
        <div className="px-4 pt-4">
          <ErrorState message="Program tidak ditemukan" onRetry={() => programQuery.refetch()} />
        </div>
      ) : (
        <ProgramFormScreen
          editProgram={programQuery.data}
          onBack={() => navigate(`/program/${programId}`)}
          onSaved={() => navigate(`/program/${programId}`)}
        />
      )}
    </RequireManageProgram>
  );
}

export function RekapHomePage() {
  const navigate = useNavigate();
  const { programId = "" } = useParams();
  const programQuery = useProgramDetail(programId);

  return (
    <RequireManageProgram>
      {programQuery.isLoading ? (
        <PageLoadingSkeleton variant="detail" />
      ) : !programQuery.data ? (
        <div className="px-4 pt-4">
          <ErrorState message="Program tidak ditemukan" onRetry={() => programQuery.refetch()} />
        </div>
      ) : (
        <RekapHomeScreen
          program={programQuery.data}
          onBack={() => navigate(`/program/${programId}`)}
          onCreateRekap={() => navigate(`/program/${programId}/rekap/create`)}
          onEditRekap={(rekap) => navigate(`/program/${programId}/rekap/${rekap.id}/edit`)}
          onViewRekap={(rekap) => navigate(`/program/${programId}/rekap/${rekap.id}`)}
        />
      )}
    </RequireManageProgram>
  );
}

export function RekapCreatePage() {
  const navigate = useNavigate();
  const { programId = "" } = useParams();
  const programQuery = useProgramDetail(programId);

  return (
    <RequireManageProgram>
      {programQuery.isLoading ? (
        <PageLoadingSkeleton variant="detail" />
      ) : !programQuery.data ? null : (
        <RekapFormScreen
          program={programQuery.data}
          onBack={() => navigate(`/program/${programId}/rekap`)}
          onSaved={() => navigate(`/program/${programId}/rekap`)}
        />
      )}
    </RequireManageProgram>
  );
}

export function RekapEditPage() {
  const navigate = useNavigate();
  const { programId = "", rekapId = "" } = useParams();
  const programQuery = useProgramDetail(programId);
  const rekapQuery = useRekapAbsenList(programId);

  return (
    <RequireManageProgram>
      {programQuery.isLoading || rekapQuery.isLoading ? (
        <PageLoadingSkeleton variant="detail" />
      ) : (() => {
        const rekap = mapRekapAbsenList(rekapQuery.data?.items ?? [], programId).find((r) => r.id === rekapId);
        if (!programQuery.data || !rekap) {
          return (
            <div className="px-4 pt-4">
              <ErrorState message="Rekap tidak ditemukan" onRetry={() => rekapQuery.refetch()} />
            </div>
          );
        }
        return (
          <RekapFormScreen
            program={programQuery.data}
            editRekap={rekap}
            onBack={() => navigate(`/program/${programId}/rekap`)}
            onSaved={() => navigate(`/program/${programId}/rekap`)}
          />
        );
      })()}
    </RequireManageProgram>
  );
}

export function AbsenAtletPage() {
  const navigate = useNavigate();
  const { programId = "" } = useParams();
  const programQuery = useProgramDetail(programId);
  const { isAtlet, isLoading } = useProgramAccess();

  if (isLoading || programQuery.isLoading) return <PageLoadingSkeleton variant="detail" />;
  if (!isAtlet) return <Navigate to={`/program/${programId}`} replace />;
  if (!programQuery.data) {
    return (
      <div className="px-4 pt-4">
        <ErrorState message="Program tidak ditemukan" onRetry={() => programQuery.refetch()} />
      </div>
    );
  }

  return (
    <AbsenAtletScreen
      program={programQuery.data}
      onBack={() => navigate(`/program/${programId}`)}
      onSaved={() => navigate(`/program/${programId}`)}
    />
  );
}

export function AbsenMonitorPage() {
  const navigate = useNavigate();
  const { programId = "" } = useParams();
  const programQuery = useProgramDetail(programId);

  return (
    <RequireManageProgram>
      {programQuery.isLoading ? (
        <PageLoadingSkeleton variant="detail" />
      ) : !programQuery.data ? (
        <div className="px-4 pt-4">
          <ErrorState message="Program tidak ditemukan" onRetry={() => programQuery.refetch()} />
        </div>
      ) : (
        <AbsenMonitorScreen
          program={programQuery.data}
          onBack={() => navigate(`/program/${programId}`)}
        />
      )}
    </RequireManageProgram>
  );
}

export function RekapDetailPage() {
  const navigate = useNavigate();
  const { programId = "", rekapId = "" } = useParams();
  const programQuery = useProgramDetail(programId);
  const rekapQuery = useRekapAbsenList(programId);

  return (
    <RequireManageProgram>
      {programQuery.isLoading || rekapQuery.isLoading ? (
        <PageLoadingSkeleton variant="detail" />
      ) : (() => {
        const rekap = mapRekapAbsenList(rekapQuery.data?.items ?? [], programId).find((r) => r.id === rekapId);
        if (!programQuery.data || !rekap) {
          return (
            <div className="px-4 pt-4">
              <ErrorState message="Rekap tidak ditemukan" onRetry={() => rekapQuery.refetch()} />
            </div>
          );
        }
        return (
          <RekapDetailScreen
            rekap={rekap}
            program={programQuery.data}
            onBack={() => navigate(`/program/${programId}/rekap`)}
          />
        );
      })()}
    </RequireManageProgram>
  );
}
