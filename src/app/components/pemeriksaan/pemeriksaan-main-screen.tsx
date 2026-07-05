import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { PemeriksaanListScreen, type Pemeriksaan } from "./pemeriksaan-list-screen";
import { PemeriksaanFormScreen } from "./pemeriksaan-form-screen";
import { PemeriksaanDetailScreen } from "./pemeriksaan-detail-screen";
import { PkFormScreen } from "./pk-form-screen";
import { InputNilaiScreen } from "./input-nilai-screen";
import { StatistikParameterScreen } from "./statistik-parameter-screen";
import { PkListScreen, type Assessment } from "./pk-list-screen";
import { AssessmentDetailScreen } from "./assessment-detail-screen";
import type { PemeriksaanParameter } from "@/app/lib/pemeriksaan-mappers";
import { usePemeriksaanAccess } from "@/hooks/use-pemeriksaan-access";
import { PageLoadingSkeleton } from "../ui/page-loading-skeleton";

type Segment = "pemeriksaan" | "khusus";

type InternalScreen =
  | "list"
  | "create"
  | "edit"
  | "detail"
  | "input-nilai"
  | "statistik"
  | "pk-list"
  | "pk-create"
  | "assessment-detail";

interface PemeriksaanMainScreenProps {
  onBack: () => void;
}

export const PemeriksaanMainScreen: React.FC<PemeriksaanMainScreenProps> = ({ onBack }) => {
  const { isViewOnly, canManagePemeriksaan, canManagePk, isLoading } = usePemeriksaanAccess();
  const [segment, setSegment] = React.useState<Segment>("pemeriksaan");
  const [screen, setScreen] = React.useState<InternalScreen>("list");
  const [selectedPemeriksaan, setSelectedPemeriksaan] = React.useState<Pemeriksaan | null>(null);
  const [selectedAssessment, setSelectedAssessment] = React.useState<Assessment | null>(null);
  const [selectedParam, setSelectedParam] = React.useState<PemeriksaanParameter | null>(null);

  const handleSegmentChange = (seg: Segment) => {
    setSegment(seg);
    setScreen(seg === "pemeriksaan" ? "list" : "pk-list");
  };

  const handleBack = () => {
    if (screen === "detail" || screen === "create" || screen === "edit") setScreen("list");
    else if (screen === "input-nilai" || screen === "statistik") setScreen("detail");
    else if (screen === "assessment-detail" || screen === "pk-create") setScreen("pk-list");
    else onBack();
  };

  const showTopHeader = screen === "list" || screen === "pk-list";

  React.useEffect(() => {
    if ((screen === "create" || screen === "edit") && !canManagePemeriksaan) {
      setScreen("list");
      setSegment("pemeriksaan");
    }
    if (screen === "pk-create" && !canManagePk) {
      setScreen("pk-list");
      setSegment("khusus");
    }
  }, [screen, canManagePemeriksaan, canManagePk]);

  if (isLoading) {
    return <PageLoadingSkeleton variant="detail" />;
  }

  return (
    <div className="bg-background">
      {showTopHeader && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-base font-bold">Pemeriksaan</h1>
              <p className="text-xs text-muted-foreground">Kesehatan & Performa</p>
            </div>
          </div>

          <div className="flex p-1 bg-surface-2 rounded-2xl">
            {([
              { value: "pemeriksaan", label: "Pemeriksaan" },
              { value: "khusus",      label: "Pemeriksaan Fisik" },
            ] as const).map((seg) => (
              <button
                key={seg.value}
                onClick={() => handleSegmentChange(seg.value)}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                  segment === seg.value
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {segment === "pemeriksaan" && screen === "list" && (
          <PemeriksaanListScreen
            onSelectPemeriksaan={(p) => { setSelectedPemeriksaan(p); setScreen("detail"); }}
            onCreatePemeriksaan={() => setScreen("create")}
          />
        )}
        {segment === "pemeriksaan" && screen === "create" && (
          <PemeriksaanFormScreen
            onBack={() => setScreen("list")}
            onSaved={(item) => { setSelectedPemeriksaan(item); setScreen("detail"); }}
          />
        )}
        {segment === "pemeriksaan" && screen === "edit" && selectedPemeriksaan && (
          <PemeriksaanFormScreen
            editItem={selectedPemeriksaan}
            onBack={() => setScreen("detail")}
            onSaved={(item) => { setSelectedPemeriksaan(item); setScreen("detail"); }}
          />
        )}
        {segment === "pemeriksaan" && screen === "detail" && selectedPemeriksaan && (
          <PemeriksaanDetailScreen
            pemeriksaan={selectedPemeriksaan}
            onBack={() => setScreen("list")}
            onEdit={() => setScreen("edit")}
            onInputNilai={() => setScreen("input-nilai")}
            onStatistik={(param) => { setSelectedParam(param); setScreen("statistik"); }}
          />
        )}
        {segment === "pemeriksaan" && screen === "input-nilai" && selectedPemeriksaan && (
          <InputNilaiScreen
            pemeriksaan={selectedPemeriksaan}
            onBack={() => setScreen("detail")}
          />
        )}
        {segment === "pemeriksaan" && screen === "statistik" && selectedParam && (
          <StatistikParameterScreen
            parameterId={selectedParam.id}
            caborId={selectedPemeriksaan?.cabor_id}
            paramNama={selectedParam.nama}
            satuan={selectedParam.satuan}
            onBack={() => setScreen("detail")}
          />
        )}

        {segment === "khusus" && screen === "pk-list" && (
          <PkListScreen
            onSelectAssessment={(a) => { setSelectedAssessment(a); setScreen("assessment-detail"); }}
            onCreateAssessment={() => setScreen("pk-create")}
          />
        )}
        {segment === "khusus" && screen === "pk-create" && (
          <PkFormScreen
            onBack={() => setScreen("pk-list")}
            onSaved={(item) => { setSelectedAssessment(item); setScreen("assessment-detail"); }}
          />
        )}
        {segment === "khusus" && screen === "assessment-detail" && selectedAssessment && (
          <AssessmentDetailScreen
            assessment={selectedAssessment}
            onBack={() => setScreen("pk-list")}
            viewOnly={isViewOnly}
          />
        )}
    </div>
  );
};
