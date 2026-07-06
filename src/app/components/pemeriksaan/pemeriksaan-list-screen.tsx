import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search, Plus, Filter, X, Users, FlaskConical, Calendar,
  ChevronRight, BarChart2, Loader2
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { cn } from "../ui/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ErrorState } from "../ui/error-state";
import { EmptyState } from "../ui/empty-state";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { usePemeriksaanInfiniteList } from "@/hooks/use-pemeriksaan";
import { useCaborOptions } from "@/hooks/use-options";
import {
  mapPemeriksaanList,
  type Pemeriksaan,
  type PemeriksaanStatus,
} from "@/app/lib/pemeriksaan-mappers";
import { parseApiError } from "@/hooks/use-api-error";
import { usePemeriksaanAccess } from "@/hooks/use-pemeriksaan-access";

export type { Pemeriksaan, PemeriksaanStatus };

export const STATUS_CONFIG: Record<PemeriksaanStatus, {
  label: string; color: string; bg: string; icon: React.FC<any>
}> = {
  belum:    { label: "Belum Dimulai", color: "text-muted-foreground", bg: "bg-muted",       icon: FlaskConical },
  sebagian: { label: "Sebagian",      color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: FlaskConical },
  selesai:  { label: "Selesai",       color: "text-success",          bg: "bg-success/10",  icon: FlaskConical },
};

export const StatusPemeriksaanBadge: React.FC<{ status: PemeriksaanStatus; size?: "sm" | "md" }> = ({ status, size = "md" }) => {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-semibold",
      cfg.color, cfg.bg,
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
    )}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const STATUS_OPTIONS: PemeriksaanStatus[] = ["belum", "sebagian", "selesai"];

interface PemeriksaanListScreenProps {
  onSelectPemeriksaan: (p: Pemeriksaan) => void;
  onCreatePemeriksaan: () => void;
}

export const PemeriksaanListScreen: React.FC<PemeriksaanListScreenProps> = ({
  onSelectPemeriksaan,
  onCreatePemeriksaan,
}) => {
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [caborId, setCaborId] = React.useState<number | undefined>();
  const [statusFilter, setStatusFilter] = React.useState<PemeriksaanStatus | undefined>();
  const [tanggalFilter, setTanggalFilter] = React.useState("");
  const [filterStartDate, setFilterStartDate] = React.useState("");
  const [filterEndDate, setFilterEndDate] = React.useState("");

  const debouncedSearch = useDebouncedValue(search);
  const caborOptionsQuery = useCaborOptions();
  const { canManagePemeriksaan } = usePemeriksaanAccess();

  const listQuery = usePemeriksaanInfiniteList({
    search: debouncedSearch || undefined,
    cabor_id: caborId,
    status: statusFilter,
    tanggal_pemeriksaan: tanggalFilter || undefined,
    filter_start_date: filterStartDate || undefined,
    filter_end_date: filterEndDate || undefined,
    sort: "tanggal_pemeriksaan",
    order: "desc",
  });

  const items = React.useMemo(() => {
    const apiItems = listQuery.data?.pages.flatMap((page) => page.items) ?? [];
    return mapPemeriksaanList(apiItems);
  }, [listQuery.data]);

  const caborOptions = caborOptionsQuery.data ?? [];
  const selectedCaborName = caborOptions.find((c) => c.id === caborId)?.nama;

  const totalFilters =
    (caborId ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (tanggalFilter ? 1 : 0) +
    (filterStartDate || filterEndDate ? 1 : 0);

  const stats = {
    total: listQuery.data?.pages[0]?.meta.total ?? items.length,
    belum: items.filter((p) => p.status === "belum").length,
    sebagian: items.filter((p) => p.status === "sebagian").length,
    selesai: items.filter((p) => p.status === "selesai").length,
  };

  const clearFilters = () => {
    setCaborId(undefined);
    setStatusFilter(undefined);
    setTanggalFilter("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const hasMore = listQuery.hasNextPage;

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

  return (
    <div className="bg-background pb-tab-bar">
      <div className="sticky top-0 z-30 bg-background px-4 pt-3 pb-3 space-y-3 border-b border-border">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pemeriksaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-surface-2 border-0 rounded-xl"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFilterOpen(true)}
            className={cn("rounded-xl h-9 w-9 relative shrink-0", totalFilters > 0 && "text-primary")}
          >
            <Filter className="h-5 w-5" />
            {totalFilters > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalFilters}
              </span>
            )}
          </Button>
        </div>

        {totalFilters > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {selectedCaborName && (
              <button onClick={() => setCaborId(undefined)}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full shrink-0 font-medium">
                {selectedCaborName} <X className="h-3 w-3" />
              </button>
            )}
            {statusFilter && (
              <button onClick={() => setStatusFilter(undefined)}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full shrink-0 font-medium">
                {STATUS_CONFIG[statusFilter].label} <X className="h-3 w-3" />
              </button>
            )}
            {tanggalFilter && (
              <button onClick={() => setTanggalFilter("")}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full shrink-0 font-medium">
                {tanggalFilter} <X className="h-3 w-3" />
              </button>
            )}
            {(filterStartDate || filterEndDate) && (
              <button onClick={() => { setFilterStartDate(""); setFilterEndDate(""); }}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full shrink-0 font-medium">
                {filterStartDate || "..."} — {filterEndDate || "..."} <X className="h-3 w-3" />
              </button>
            )}
            <button onClick={clearFilters} className="text-xs text-muted-foreground underline shrink-0">Hapus semua</button>
          </div>
        )}
      </div>

      <div className="px-4 pb-3 pt-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Belum", value: stats.belum, color: "text-muted-foreground" },
            { label: "Sebagian", value: stats.sebagian, color: "text-amber-600 dark:text-amber-400" },
            { label: "Selesai", value: stats.selesai, color: "text-success" },
          ].map((s) => (
            <Card key={s.label} className="p-2.5 border border-border text-center bg-surface">
              <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 space-y-3">
        {listQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Memuat pemeriksaan...</p>
          </div>
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => listQuery.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="Tidak ada pemeriksaan"
            description={canManagePemeriksaan ? "Coba ubah filter atau buat pemeriksaan baru" : "Belum ada pemeriksaan yang tersedia untuk Anda"}
            actionLabel={canManagePemeriksaan ? "Tambah Pemeriksaan" : undefined}
            onAction={canManagePemeriksaan ? onCreatePemeriksaan : undefined}
          />
        ) : (
          items.map((p) => (
            <Card
              key={p.id}
              onClick={() => onSelectPemeriksaan(p)}
              className="p-0 overflow-hidden border border-border cursor-pointer active:scale-[0.98] transition-transform shadow-sm hover:shadow-md"
            >
              <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-sm font-bold shrink-0">
                  {p.cabor_icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">{p.nama}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.cabor} · {p.kategori}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              </div>

              <div className="px-4 pb-3 flex flex-wrap gap-2 items-center">
                <StatusPemeriksaanBadge status={p.status} size="sm" />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(p.tanggal, "d MMM yyyy", { locale: idLocale })}
                </span>
              </div>

              {p.status === "sebagian" && canManagePemeriksaan && (
                <div className="px-4 pb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress input</span>
                    <span className="font-semibold text-amber-600">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              )}

              <div className="px-4 py-2.5 bg-surface-2 border-t border-border flex gap-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">{p.jumlah_parameter}</span> parameter
                </span>
                {canManagePemeriksaan && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground">{p.jumlah_peserta}</span> peserta
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto truncate max-w-[40%]">
                  {p.tenaga_pendukung}
                </span>
              </div>
            </Card>
          ))
        )}

        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {listQuery.isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
          </div>
        )}
      </div>

      {canManagePemeriksaan && (
        <button
          onClick={onCreatePemeriksaan}
          className="fab-above-tab-bar flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Tambah
        </button>
      )}

      <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Filter Pemeriksaan</DrawerTitle></DrawerHeader>
          <div className="px-4 pb-6 space-y-5">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cabor</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setCaborId(undefined)}
                  className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    !caborId ? "bg-primary text-white border-primary" : "bg-surface border-border text-foreground"
                  )}>Semua</button>
                {caborOptions.map((c) => (
                  <button key={c.id} onClick={() => setCaborId(c.id)}
                    className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      caborId === c.id ? "bg-primary text-white border-primary" : "bg-surface border-border text-foreground"
                    )}>{c.nama}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setStatusFilter(undefined)}
                  className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    !statusFilter ? "bg-primary text-white border-primary" : "bg-surface border-border text-foreground"
                  )}>Semua</button>
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      statusFilter === s ? "bg-primary text-white border-primary" : "bg-surface border-border text-foreground"
                    )}>{STATUS_CONFIG[s].label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tanggal Pemeriksaan</p>
              <Input type="date" value={tanggalFilter} onChange={(e) => setTanggalFilter(e.target.value)} className="rounded-xl text-sm" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rentang Tanggal Dibuat</p>
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="rounded-xl text-sm" />
                <Input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="rounded-xl text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-button" onClick={clearFilters}>Reset</Button>
              <Button className="flex-1 rounded-button" onClick={() => setFilterOpen(false)}>Terapkan</Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
