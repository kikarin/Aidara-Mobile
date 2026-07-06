import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search, Plus, Filter, X, Activity,
  ChevronRight, ArrowLeft, Calendar, BarChart2, Clock, Loader2
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { cn } from "../ui/utils";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ErrorState } from "../ui/error-state";
import { EmptyState } from "../ui/empty-state";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useProgramFilterCabor,
  useProgramFilterKategori,
  useProgramLatihanInfiniteList,
} from "@/hooks/use-program-latihan";
import { useProgramAccess } from "@/hooks/use-program-access";
import {
  mapProgramLatihanList,
  type ProgramLatihan,
  type TahapProgram,
} from "@/app/lib/program-mappers";
import { parseApiError } from "@/hooks/use-api-error";

export type { ProgramLatihan, TahapProgram };

const TAHAP_CONFIG: Record<TahapProgram, { label: string; color: string; bg: string }> = {
  "persiapan-umum":   { label: "Persiapan Umum",   color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-900/30" },
  "persiapan-khusus": { label: "Persiapan Khusus",  color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  "pra-pertandingan": { label: "Pra Pertandingan",  color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-100 dark:bg-amber-900/30" },
  "pertandingan":     { label: "Pertandingan",      color: "text-primary",                        bg: "bg-primary/10" },
  "transisi":         { label: "Transisi",           color: "text-success",                        bg: "bg-success/10" },
};

export const ProgramStageBadge: React.FC<{ tahap: TahapProgram; size?: "sm" | "md" }> = ({ tahap, size = "md" }) => {
  const cfg = TAHAP_CONFIG[tahap];
  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-semibold",
      cfg.color, cfg.bg,
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"
    )}>
      {cfg.label}
    </span>
  );
};

function getProgramStatus(p: ProgramLatihan): "berjalan" | "akan-datang" | "selesai" {
  const today = new Date();
  if (isFuture(p.periode_mulai)) return "akan-datang";
  if (isPast(p.periode_selesai)) return "selesai";
  return "berjalan";
}

function getProgramProgress(p: ProgramLatihan): number {
  const total = differenceInDays(p.periode_selesai, p.periode_mulai);
  const elapsed = differenceInDays(new Date(), p.periode_mulai);
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}

const TAHAP_OPTIONS = Object.keys(TAHAP_CONFIG) as TahapProgram[];

interface ProgramCardProps {
  program: ProgramLatihan;
  onClick: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onClick }) => {
  const status = getProgramStatus(program);
  const progress = getProgramProgress(program);
  const totalDays = differenceInDays(program.periode_selesai, program.periode_mulai);
  const elapsed = differenceInDays(new Date(), program.periode_mulai);
  const remaining = Math.max(0, totalDays - elapsed);

  const statusConfig = {
    "berjalan":    { label: "Sedang Berjalan", dot: "bg-success" },
    "akan-datang": { label: "Akan Datang",     dot: "bg-amber-500" },
    "selesai":     { label: "Selesai",          dot: "bg-muted-foreground" },
  };
  const sc = statusConfig[status];

  return (
    <Card
      onClick={onClick}
      className="p-0 overflow-hidden border border-border cursor-pointer active:scale-[0.98] transition-transform duration-150 shadow-sm hover:shadow-md"
    >
      {/* Header strip */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-surface-2 flex items-center justify-center text-xl shrink-0">
          {program.cabor_icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("w-2 h-2 rounded-full shrink-0", sc.dot)} />
            <span className="text-xs text-muted-foreground">{sc.label}</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
            {program.nama_program}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {program.cabor} · {program.kategori}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
      </div>

      {/* Stage badge */}
      <div className="px-4 pb-3">
        <ProgramStageBadge tahap={program.tahap} size="sm" />
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{format(program.periode_mulai, "d MMM yy", { locale: idLocale })}</span>
          <span className="font-semibold text-foreground">{status === "berjalan" ? `${progress}%` : status === "selesai" ? "100%" : "0%"}</span>
          <span>{format(program.periode_selesai, "d MMM yy", { locale: idLocale })}</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              status === "selesai" ? "bg-muted-foreground" :
              status === "akan-datang" ? "bg-amber-400" : "bg-primary"
            )}
            style={{ width: `${status === "selesai" ? 100 : status === "akan-datang" ? 0 : progress}%` }}
          />
        </div>
      </div>

      {/* Footer stats */}
      <div className="px-4 py-3 bg-surface-2 flex items-center gap-4 border-t border-border">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{program.jumlah_rekap}</span> rekap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {status === "berjalan" ? <><span className="font-semibold text-foreground">{remaining}</span> hari tersisa</> :
             status === "selesai" ? <span className="font-semibold">Selesai</span> :
             <><span className="font-semibold text-foreground">{differenceInDays(program.periode_mulai, new Date())}</span> hari lagi</>}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{totalDays} hari total</span>
        </div>
      </div>
    </Card>
  );
};

interface ProgramListScreenProps {
  onBack: () => void;
  onSelectProgram: (program: ProgramLatihan) => void;
  onCreateProgram?: () => void;
}

export const ProgramListScreen: React.FC<ProgramListScreenProps> = ({
  onBack,
  onSelectProgram,
  onCreateProgram,
}) => {
  const { canManageProgram, isAtlet } = useProgramAccess();
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [caborId, setCaborId] = React.useState<number | undefined>();
  const [kategoriId, setKategoriId] = React.useState<number | undefined>();
  const [selectedTahap, setSelectedTahap] = React.useState<TahapProgram[]>([]);
  const [filterStartDate, setFilterStartDate] = React.useState("");
  const [filterEndDate, setFilterEndDate] = React.useState("");

  const debouncedSearch = useDebouncedValue(search);

  const caborFilterQuery = useProgramFilterCabor();
  const kategoriFilterQuery = useProgramFilterKategori(caborId);

  const listQuery = useProgramLatihanInfiniteList({
    search: debouncedSearch || undefined,
    cabor_id: caborId,
    cabor_kategori_id: kategoriId,
    filter_start_date: filterStartDate || undefined,
    filter_end_date: filterEndDate || undefined,
    sort: "created_at",
    order: "desc",
  });

  const programs = React.useMemo(() => {
    const apiItems = listQuery.data?.pages.flatMap((page) => page.items) ?? [];
    return mapProgramLatihanList(apiItems);
  }, [listQuery.data]);

  const filtered = programs.filter((p) =>
    selectedTahap.length === 0 || selectedTahap.includes(p.tahap)
  );

  const totalFilters =
    (caborId ? 1 : 0) +
    (kategoriId ? 1 : 0) +
    selectedTahap.length +
    (filterStartDate ? 1 : 0) +
    (filterEndDate ? 1 : 0);

  const stats = {
    total: listQuery.data?.pages[0]?.meta.total ?? filtered.length,
    berjalan: filtered.filter((p) => getProgramStatus(p) === "berjalan").length,
    akandatang: filtered.filter((p) => getProgramStatus(p) === "akan-datang").length,
    selesai: filtered.filter((p) => getProgramStatus(p) === "selesai").length,
  };

  const clearFilters = () => {
    setCaborId(undefined);
    setKategoriId(undefined);
    setSelectedTahap([]);
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const toggleTahap = (val: TahapProgram) => {
    setSelectedTahap((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
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
  }, [hasMore, listQuery.isFetchingNextPage, listQuery.fetchNextPage, filtered.length]);

  const error = listQuery.error ? parseApiError(listQuery.error) : null;
  const caborOptions = caborFilterQuery.data ?? [];
  const kategoriOptions = kategoriFilterQuery.data ?? [];
  const selectedCaborName = caborOptions.find((c) => c.id === caborId)?.nama;
  const selectedKategoriName = kategoriOptions.find((k) => k.id === kategoriId)?.nama;

  return (
    <div className="flex flex-col min-h-full bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 rounded-xl h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground leading-tight">Program Latihan</h1>
            <p className="text-xs text-muted-foreground">
              {isAtlet ? "Program latihan saya" : "Kelola program latihan"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFilterOpen(true)}
            className={cn("rounded-xl h-9 w-9 relative", totalFilters > 0 && "text-primary")}
          >
            <Filter className="h-5 w-5" />
            {totalFilters > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalFilters}
              </span>
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-surface-2 border-0 rounded-xl"
            />
          </div>
        </div>

        {/* Active filter chips */}
        {totalFilters > 0 && (
          <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
            {selectedCaborName && (
              <button
                onClick={() => { setCaborId(undefined); setKategoriId(undefined); }}
                className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
              >
                {selectedCaborName} <X className="h-3 w-3" />
              </button>
            )}
            {selectedKategoriName && (
              <button
                onClick={() => setKategoriId(undefined)}
                className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
              >
                {selectedKategoriName} <X className="h-3 w-3" />
              </button>
            )}
            {selectedTahap.map((t) => (
              <button
                key={t}
                onClick={() => toggleTahap(t)}
                className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
              >
                {TAHAP_CONFIG[t].label} <X className="h-3 w-3" />
              </button>
            ))}
            {(filterStartDate || filterEndDate) && (
              <button
                onClick={() => { setFilterStartDate(""); setFilterEndDate(""); }}
                className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
              >
                {filterStartDate || "..."} — {filterEndDate || "..."} <X className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground underline shrink-0 ml-1"
            >
              Hapus semua
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: stats.total, color: "text-foreground", bg: "bg-surface" },
            { label: "Berjalan", value: stats.berjalan, color: "text-success", bg: "bg-success/10" },
            { label: "Datang", value: stats.akandatang, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: "Selesai", value: stats.selesai, color: "text-muted-foreground", bg: "bg-surface-2" },
          ].map((s) => (
            <Card key={s.label} className={cn("p-2.5 border border-border text-center", s.bg)}>
              <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Program list */}
        {listQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-card bg-surface-2 border border-border animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => listQuery.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Tidak ada program"
            description={isAtlet ? "Belum ada program latihan untuk Anda" : "Coba ubah filter atau tambah program baru"}
            actionLabel={canManageProgram ? "Tambah Program" : undefined}
            onAction={canManageProgram ? onCreateProgram : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((program) => (
              <ProgramCard key={program.id} program={program} onClick={() => onSelectProgram(program)} />
            ))}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {listQuery.isFetchingNextPage && (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {canManageProgram && onCreateProgram && (
        <button
          onClick={onCreateProgram}
          className="fab-above-tab-bar flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Tambah Program
        </button>
      )}

      {/* Filter Drawer */}
      <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Filter Program</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto space-y-5">
            {/* Cabor */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cabang Olahraga</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setCaborId(undefined); setKategoriId(undefined); }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    !caborId ? "bg-primary text-white border-primary" : "bg-surface border-border text-foreground"
                  )}
                >
                  Semua
                </button>
                {caborOptions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCaborId(c.id); setKategoriId(undefined); }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      caborId === c.id
                        ? "bg-primary text-white border-primary"
                        : "bg-surface border-border text-foreground"
                    )}
                  >
                    {c.nama}
                  </button>
                ))}
              </div>
            </div>

            {/* Kategori */}
            {caborId && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Kategori</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setKategoriId(undefined)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      !kategoriId ? "bg-primary text-white border-primary" : "bg-surface border-border text-foreground"
                    )}
                  >
                    Semua
                  </button>
                  {kategoriOptions.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => setKategoriId(k.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                        kategoriId === k.id
                          ? "bg-primary text-white border-primary"
                          : "bg-surface border-border text-foreground"
                      )}
                    >
                      {k.nama}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tahap */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tahap Program</p>
              <div className="flex flex-wrap gap-2">
                {TAHAP_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTahap(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      selectedTahap.includes(t)
                        ? "bg-primary text-white border-primary"
                        : "bg-surface border-border text-foreground"
                    )}
                  >
                    {TAHAP_CONFIG[t].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tanggal dibuat */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tanggal Dibuat</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="rounded-xl text-sm"
                />
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-button" onClick={clearFilters}>
                Reset
              </Button>
              <Button className="flex-1 rounded-button" onClick={() => setFilterOpen(false)}>
                Terapkan
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
