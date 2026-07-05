import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { MedalBadge } from "../ui/medal-badge";
import { SportsAvatar } from "../ui/sports-avatar";
import { Button } from "../ui/button";
import { ArrowLeft, Trophy, Users, User, Filter } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { ErrorState } from "../ui/error-state";
import { EmptyState } from "../ui/empty-state";
import { usePrestasiList } from "@/hooks/use-prestasi";
import {
  formatRupiah,
  formatKategoriLabel,
  getBonusTextClass,
  JENIS_PRESTASI_OPTIONS,
  mapPrestasiGroups,
  type GlobalPrestasiItem,
  type JenisPrestasiFilter,
  type PrestasiGroupUi,
} from "@/app/lib/prestasi-mappers";
import { parseApiError } from "@/hooks/use-api-error";

interface PrestasiGlobalScreenProps {
  onBack: () => void;
}

const roleLabels = {
  athlete: "Atlet",
  coach: "Pelatih",
  support: "Tenaga Pendukung",
};

export const PrestasiGlobalScreen: React.FC<PrestasiGlobalScreenProps> = ({ onBack }) => {
  const [kategoriFilter, setKategoriFilter] = React.useState<number | "all">("all");
  const [jenisFilter, setJenisFilter] = React.useState<JenisPrestasiFilter>("all");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [selectedAchievement, setSelectedAchievement] = React.useState<GlobalPrestasiItem | null>(null);

  const [draftKategori, setDraftKategori] = React.useState<number | "all">("all");
  const [draftJenis, setDraftJenis] = React.useState<JenisPrestasiFilter>("all");

  const prestasiQuery = usePrestasiList({
    kategori_peserta_id: kategoriFilter === "all" ? undefined : kategoriFilter,
    jenis_prestasi: jenisFilter === "all" ? undefined : jenisFilter,
  });

  const error = prestasiQuery.error ? parseApiError(prestasiQuery.error) : null;
  const groups = React.useMemo(
    () => mapPrestasiGroups(prestasiQuery.data?.groups ?? []),
    [prestasiQuery.data?.groups]
  );
  const kategoriOptions = prestasiQuery.data?.kategoriPesertaList ?? [];
  const totalBonus = prestasiQuery.data?.totalBonus ?? 0;
  const totalMedali = prestasiQuery.data?.totalMedali ?? { Emas: 0, Perak: 0, Perunggu: 0 };

  const openFilter = () => {
    setDraftKategori(kategoriFilter);
    setDraftJenis(jenisFilter);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setKategoriFilter(draftKategori);
    setJenisFilter(draftJenis);
    setFilterOpen(false);
  };

  const AchievementCard: React.FC<{ achievement: GlobalPrestasiItem }> = ({ achievement }) => (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedAchievement(achievement)}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <SportsAvatar
            src={achievement.avatar}
            fallback={achievement.participantName.substring(0, 2).toUpperCase()}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">{achievement.participantName}</h4>
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">{achievement.eventName}</p>
          </div>
          {achievement.medal && (
            <MedalBadge type={achievement.medal} size="sm" showIcon={false} />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {achievement.rank.startsWith("Juara") ? achievement.rank : `Juara ${achievement.rank}`}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {achievement.level}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {achievement.dateLabel}
          </Badge>
          {achievement.isTeam && (
            <Badge variant="physical" className="text-xs flex items-center gap-1">
              <Users className="h-3 w-3" />
              Beregu
            </Badge>
          )}
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-sm text-foreground">{achievement.sport}</p>
          {achievement.bonus > 0 && (
            <p className={`text-success font-medium mt-1 tabular-nums ${getBonusTextClass(achievement.bonus)}`}>
              Bonus: {formatRupiah(achievement.bonus)}
            </p>
          )}
        </div>

        {achievement.disability && (
          <div className="pt-2 border-t border-border">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {achievement.disability}
              </Badge>
              {achievement.classification && (
                <Badge variant="secondary" className="text-xs">
                  {achievement.classification}
                </Badge>
              )}
              {achievement.iq && (
                <Badge variant="outline" className="text-xs">
                  IQ: {achievement.iq}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  const GroupSection: React.FC<{ group: PrestasiGroupUi }> = ({ group }) => (
    <div className="space-y-3">
      <div className="rounded-xl bg-surface-2/60 border border-border px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">{group.kategoriNama}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{group.count} prestasi</p>
          </div>
          <div className="flex flex-wrap gap-1 justify-end shrink-0">
            {group.totalMedali.Emas > 0 && (
              <Badge variant="gold" className="text-xs">
                Emas {group.totalMedali.Emas}
              </Badge>
            )}
            {group.totalMedali.Perak > 0 && (
              <Badge variant="silver" className="text-xs">
                Perak {group.totalMedali.Perak}
              </Badge>
            )}
            {group.totalMedali.Perunggu > 0 && (
              <Badge variant="bronze" className="text-xs">
                Perunggu {group.totalMedali.Perunggu}
              </Badge>
            )}
          </div>
        </div>
        {group.totalBonus > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Total Bonus Kategori</p>
            <p className={`text-success tabular-nums ${getBonusTextClass(group.totalBonus)}`}>
              {formatRupiah(group.totalBonus)}
            </p>
          </div>
        )}
      </div>
      {group.prestasi.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );

  const hasActiveFilter = kategoriFilter !== "all" || jenisFilter !== "all";

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">Feed Prestasi</h2>
            <p className="text-sm text-muted-foreground">Pencapaian Terbaru</p>
          </div>
          <Button
            variant={hasActiveFilter ? "default" : "outline"}
            size="icon"
            onClick={openFilter}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {prestasiQuery.isLoading && (
          <div className="space-y-3">
            <div className="h-24 rounded-card bg-surface-2 border border-border animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-card bg-surface-2 border border-border animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <ErrorState
            type={error.statusCode === 403 ? "403" : "generic"}
            message={error.message}
            onRetry={() => void prestasiQuery.refetch()}
          />
        )}

        {!prestasiQuery.isLoading && !error && (
          <>
            <Card className="bg-gradient-to-br from-primary/5 via-surface to-surface border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Ringkasan Total</h3>
                </div>
                <div className="rounded-xl bg-surface-2 border border-border p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">Total Bonus</p>
                  <p className={`text-success tabular-nums break-words ${getBonusTextClass(totalBonus)}`}>
                    {formatRupiah(totalBonus)}
                  </p>
                </div>
                <div className="rounded-xl bg-surface-2 border border-border p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Total Medali</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="gold" className="text-xs">
                      Emas {totalMedali.Emas}
                    </Badge>
                    <Badge variant="silver" className="text-xs">
                      Perak {totalMedali.Perak}
                    </Badge>
                    <Badge variant="bronze" className="text-xs">
                      Perunggu {totalMedali.Perunggu}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {hasActiveFilter && (
              <div className="flex flex-wrap gap-2">
                {kategoriFilter !== "all" && (
                  <Badge variant="primary" className="text-xs">
                    {formatKategoriLabel(
                      kategoriOptions.find((k) => k.id === kategoriFilter)?.nama ?? "Kategori"
                    )}
                  </Badge>
                )}
                {jenisFilter !== "all" && (
                  <Badge variant="primary" className="text-xs">
                    {JENIS_PRESTASI_OPTIONS.find((j) => j.value === jenisFilter)?.label}
                  </Badge>
                )}
              </div>
            )}

            {groups.length === 0 && (
              <EmptyState
                icon={Trophy}
                title="Belum Ada Prestasi"
                description="Data prestasi akan muncul setelah tersedia di sistem"
              />
            )}

            {groups.map((group) => (
              <GroupSection key={group.kategoriId ?? `unknown-${group.kategoriNama}`} group={group} />
            ))}
          </>
        )}
      </div>

      <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter Prestasi</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Kategori Peserta</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDraftKategori("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    draftKategori === "all"
                      ? "bg-primary text-white"
                      : "bg-surface-2 text-foreground hover:bg-muted"
                  }`}
                >
                  Semua
                </button>
                {kategoriOptions.map((kategori) => (
                  <button
                    key={kategori.id}
                    onClick={() => setDraftKategori(kategori.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      draftKategori === kategori.id
                        ? "bg-primary text-white"
                        : "bg-surface-2 text-foreground hover:bg-muted"
                    }`}
                  >
                    {kategori.nama}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Jenis Prestasi</p>
              <div className="flex flex-wrap gap-2">
                {JENIS_PRESTASI_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDraftJenis(option.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      draftJenis === option.value
                        ? "bg-primary text-white"
                        : "bg-surface-2 text-foreground hover:bg-muted"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={applyFilter} className="w-full">
              Terapkan Filter
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Detail Prestasi</DrawerTitle>
          </DrawerHeader>
          {selectedAchievement && (
            <div className="px-4 pb-6 space-y-4">
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <SportsAvatar
                    src={selectedAchievement.avatar}
                    fallback={selectedAchievement.participantName.substring(0, 2).toUpperCase()}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{selectedAchievement.participantName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {roleLabels[selectedAchievement.participantRole]}
                    </p>
                  </div>
                  {selectedAchievement.medal && (
                    <MedalBadge type={selectedAchievement.medal} size="sm" />
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Event</label>
                    <p className="text-sm text-foreground">{selectedAchievement.eventName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Cabang Olahraga</label>
                    <p className="text-sm text-foreground">{selectedAchievement.sport}</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Peringkat</label>
                      <p className="text-sm text-foreground">
                        {selectedAchievement.rank.startsWith("Juara")
                          ? selectedAchievement.rank
                          : `Juara ${selectedAchievement.rank}`}
                      </p>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Tingkat</label>
                      <p className="text-sm text-foreground">{selectedAchievement.level}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Kategori Peserta</label>
                    <p className="text-sm text-foreground">{selectedAchievement.kategoriPeserta}</p>
                  </div>
                  {selectedAchievement.isTeam && selectedAchievement.teamMembers && (
                    <div>
                      <label className="text-xs text-muted-foreground">Anggota Beregu</label>
                      <p className="text-sm text-foreground">
                        {selectedAchievement.teamMembers.join(", ")}
                      </p>
                    </div>
                  )}
                  {selectedAchievement.bonus > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground">Bonus</label>
                      <p className={`text-success tabular-nums ${getBonusTextClass(selectedAchievement.bonus)}`}>
                        {formatRupiah(selectedAchievement.bonus)}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};
