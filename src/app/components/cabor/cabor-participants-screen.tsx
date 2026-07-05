import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { SportsAvatar } from "../ui/sports-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, ArrowLeft } from "lucide-react";
import { ErrorState } from "../ui/error-state";
import { useCaborPeserta } from "@/hooks/use-cabor";
import { mapPesertaItem, type CaborParticipant } from "@/app/lib/cabor-mappers";
import { parseApiError } from "@/hooks/use-api-error";

interface CaborParticipantsScreenProps {
  caborId: string;
  caborName: string;
  onBack: () => void;
}

export const CaborParticipantsScreen: React.FC<CaborParticipantsScreenProps> = ({
  caborId,
  caborName,
  onBack,
}) => {
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("athletes");

  const pesertaQuery = useCaborPeserta(caborId);
  const error = pesertaQuery.error ? parseApiError(pesertaQuery.error) : null;

  const athletes = React.useMemo(
    () => (pesertaQuery.data?.atlet ?? []).map((item) => mapPesertaItem(item, "atlet")),
    [pesertaQuery.data?.atlet]
  );
  const coaches = React.useMemo(
    () => (pesertaQuery.data?.pelatih ?? []).map((item) => mapPesertaItem(item, "pelatih")),
    [pesertaQuery.data?.pelatih]
  );
  const support = React.useMemo(
    () =>
      (pesertaQuery.data?.tenaga_pendukung ?? []).map((item) => mapPesertaItem(item, "support")),
    [pesertaQuery.data?.tenaga_pendukung]
  );

  const getFilteredData = (data: CaborParticipant[]) => {
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.position?.toLowerCase().includes(searchLower)
    );
  };

  const ParticipantCard: React.FC<{ participant: CaborParticipant }> = ({ participant }) => (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <SportsAvatar
          src={participant.avatar}
          fallback={participant.name.substring(0, 2).toUpperCase()}
          size="lg"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{participant.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            {participant.age !== "-" && (
              <Badge variant="outline" className="text-xs">
                {participant.age} tahun
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {participant.gender === "male" ? "L" : "P"}
            </Badge>
          </div>
          {participant.position && (
            <p className="text-sm text-muted-foreground mt-1">{participant.position}</p>
          )}
        </div>
      </div>
    </Card>
  );

  const renderTabContent = (data: CaborParticipant[], emptyLabel: string) => {
    const filtered = getFilteredData(data);
    if (filtered.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        </div>
      );
    }
    return filtered.map((participant) => (
      <ParticipantCard key={participant.id} participant={participant} />
    ));
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">Peserta</h2>
            <p className="text-sm text-muted-foreground">{caborName}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {pesertaQuery.isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-card bg-surface-2 border border-border animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <ErrorState
            type={error.statusCode === 403 ? "403" : "generic"}
            message={error.message}
            onRetry={() => void pesertaQuery.refetch()}
          />
        )}

        {!pesertaQuery.isLoading && !error && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari peserta..."
                className="pl-10"
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="athletes">Atlet ({athletes.length})</TabsTrigger>
                <TabsTrigger value="coaches">Pelatih ({coaches.length})</TabsTrigger>
                <TabsTrigger value="support">Pendukung ({support.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="athletes" className="space-y-3 mt-4">
                {renderTabContent(athletes, "Tidak ada atlet ditemukan")}
              </TabsContent>

              <TabsContent value="coaches" className="space-y-3 mt-4">
                {renderTabContent(coaches, "Tidak ada pelatih ditemukan")}
              </TabsContent>

              <TabsContent value="support" className="space-y-3 mt-4">
                {renderTabContent(support, "Tidak ada tenaga pendukung ditemukan")}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};
