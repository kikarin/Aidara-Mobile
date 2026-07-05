import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Filter, Users, UserCog, Briefcase, ArrowLeft, Loader2, Trophy } from "lucide-react";
import { ErrorState } from "../ui/error-state";
import { EmptyState } from "../ui/empty-state";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useCaborList } from "@/hooks/use-cabor";
import { useOptionsList } from "@/hooks/use-options";
import { mapCaborList, type CaborData } from "@/app/lib/cabor-mappers";
import { parseApiError } from "@/hooks/use-api-error";

export type { CaborData };

const PAGE_SIZE = 10;

interface CaborListScreenProps {
  onBack: () => void;
  onSelectCabor: (cabor: CaborData) => void;
}

export const CaborListScreen: React.FC<CaborListScreenProps> = ({
  onBack,
  onSelectCabor,
}) => {
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [kategoriId, setKategoriId] = React.useState<number | undefined>();
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(search);
  const kategoriOptions = useOptionsList("kategori_peserta");

  const caborQuery = useCaborList({
    search: debouncedSearch || undefined,
    kategori_peserta_id: kategoriId,
    sort: "nama",
    order: "asc",
  });

  const caborList = React.useMemo(
    () => mapCaborList(caborQuery.data ?? []),
    [caborQuery.data]
  );

  const visibleList = caborList.slice(0, visibleCount);
  const hasMore = visibleCount < caborList.length;

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, kategoriId]);

  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, visibleList.length]);

  const error = caborQuery.error ? parseApiError(caborQuery.error) : null;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">Cabang Olahraga</h2>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari cabang olahraga..."
              className="pl-10"
            />
          </div>
          <Button
            variant={filterOpen ? "default" : "outline"}
            size="icon"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {filterOpen && (
          <Card className="p-3 space-y-2">
            <p className="text-sm font-medium text-foreground">Filter Kategori Peserta</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={kategoriId === undefined ? "default" : "outline"}
                onClick={() => setKategoriId(undefined)}
              >
                Semua
              </Button>
              {kategoriOptions.options.map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={kategoriId === Number(opt.value) ? "default" : "outline"}
                  onClick={() => setKategoriId(Number(opt.value))}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {caborQuery.isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-card bg-surface-2 border border-border animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <ErrorState
            type={error.statusCode === 403 ? "403" : "generic"}
            message={error.message}
            onRetry={() => void caborQuery.refetch()}
          />
        )}

        {!caborQuery.isLoading && !error && caborList.length === 0 && (
          <EmptyState
            icon={Trophy}
            title="Tidak Ada Cabor"
            description="Belum ada cabang olahraga yang tersedia untuk akun Anda"
          />
        )}

        {!caborQuery.isLoading && !error && visibleList.length > 0 && (
          <div className="space-y-3">
            {visibleList.map((cabor) => (
              <Card
                key={cabor.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
                onClick={() => onSelectCabor(cabor)}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                      {cabor.icon}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <h3 className="text-lg font-semibold text-foreground">{cabor.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{cabor.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {cabor.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cabor.athleteCount}</p>
                        <p className="text-xs text-muted-foreground">Atlet</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-accent-2/10 flex items-center justify-center">
                        <UserCog className="h-4 w-4 text-accent-2" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cabor.coachCount}</p>
                        <p className="text-xs text-muted-foreground">Pelatih</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cabor.supportStaffCount}</p>
                        <p className="text-xs text-muted-foreground">Pendukung</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
