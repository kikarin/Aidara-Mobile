import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search, Plus, Zap, ChevronRight, Users, Calendar, CheckCircle, Clock, Loader2,
} from "lucide-react";
import { cn } from "../ui/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ErrorState } from "../ui/error-state";
import { EmptyState } from "../ui/empty-state";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { usePkInfiniteList } from "@/hooks/use-pemeriksaan-khusus";
import {
  getPkStatusLabel,
  mapPkList,
  type Assessment,
  type PkStatus,
} from "@/app/lib/pk-mappers";
import { parseApiError } from "@/hooks/use-api-error";
import { usePemeriksaanAccess } from "@/hooks/use-pemeriksaan-access";

export type { Assessment };

const STATUS_CONFIG: Record<PkStatus, { label: string; color: string; bg: string; icon: React.FC<any> }> = {
  belum:    { label: "Belum",    color: "text-muted-foreground", bg: "bg-muted", icon: Clock },
  sebagian: { label: "Berjalan", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Loader2 },
  selesai:  { label: "Selesai",  color: "text-success", bg: "bg-success/10", icon: CheckCircle },
};

interface PkListScreenProps {
  onSelectAssessment: (a: Assessment) => void;
  onCreateAssessment: () => void;
}

export const PkListScreen: React.FC<PkListScreenProps> = ({ onSelectAssessment, onCreateAssessment }) => {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const { canManagePk, isViewOnly } = usePemeriksaanAccess();

  const listQuery = usePkInfiniteList({
    search: debouncedSearch || undefined,
    sort: "tanggal_pemeriksaan",
    order: "desc",
  });

  const items = mapPkList(listQuery.data?.pages.flatMap((p) => p.items) ?? []);
  const hasMore = listQuery.hasNextPage;

  const stats = {
    total: items.length,
    belum: items.filter((a) => a.status === "belum").length,
    sebagian: items.filter((a) => a.status === "sebagian").length,
    selesai: items.filter((a) => a.status === "selesai").length,
  };

  React.useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !listQuery.isFetchingNextPage) {
          listQuery.fetchNextPage();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, listQuery.isFetchingNextPage, listQuery.fetchNextPage, items.length]);

  const error = listQuery.error ? parseApiError(listQuery.error) : null;

  if (listQuery.isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Memuat pemeriksaan fisik...</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="px-4 pt-4">
        <ErrorState message={error.message} onRetry={() => listQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-background pb-tab-bar">
      <div className="px-4 pt-3 pb-3 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pemeriksaan fisik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-surface-2 border-0 rounded-xl"
            />
          </div>
          {canManagePk && (
            <Button onClick={onCreateAssessment} className="rounded-xl h-9 px-3 shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Buat
            </Button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Belum", value: stats.belum, color: "text-muted-foreground" },
            { label: "Berjalan", value: stats.sebagian, color: "text-amber-600 dark:text-amber-400" },
            { label: "Selesai", value: stats.selesai, color: "text-success" },
          ].map((s) => (
            <Card key={s.label} className="p-2.5 border border-border bg-surface text-center">
              <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {items.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="Tidak ada pemeriksaan fisik"
            description={canManagePk ? "Buat pemeriksaan fisik untuk mulai evaluasi performa." : "Belum ada pemeriksaan fisik yang tersedia untuk Anda."}
            actionLabel={canManagePk ? "Buat Pemeriksaan" : undefined}
            onAction={canManagePk ? onCreateAssessment : undefined}
          />
        ) : (
          items.map((a) => {
            const sc = STATUS_CONFIG[a.status];
            const Icon = sc.icon;
            return (
              <Card
                key={a.id}
                onClick={() => onSelectAssessment(a)}
                className="p-0 overflow-hidden border border-border cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
              >
                <div className="px-4 pt-3 pb-3 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-sm font-bold shrink-0">
                    {a.cabor_icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">{a.nama}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.cabor} · {a.cabor_kategori}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", sc.color, sc.bg)}>
                    <Icon className="h-3 w-3" /> {getPkStatusLabel(a.status)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(a.tanggal, "d MMM yyyy", { locale: idLocale })}
                  </span>
                </div>
                {!isViewOnly && (
                  <div className="px-4 py-2.5 bg-surface-2 border-t border-border flex gap-4">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-semibold text-foreground">{a.jumlah_peserta}</span> peserta
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      <span className="font-semibold text-foreground">{a.jumlah_atlet}</span> atlet
                    </span>
                  </div>
                )}
              </Card>
            );
          })
        )}

        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {listQuery.isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
          </div>
        )}
      </div>
    </div>
  );
};
