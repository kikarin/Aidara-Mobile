import * as React from "react";
import { Search, ChevronRight, Clock, Loader2 } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./drawer";
import { Input } from "./input";
import { Badge } from "./badge";
import { ErrorState } from "./error-state";

export interface MasterDataOption {
  id: string;
  label: string;
  value: string;
  metadata?: Record<string, any>;
}

interface MasterDataPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: MasterDataOption[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onSelect: (option: MasterDataOption) => void;
  selectedId?: string;
  placeholder?: string;
  emptyMessage?: string;
  recentSelections?: MasterDataOption[];
}

export const MasterDataPicker: React.FC<MasterDataPickerProps> = ({
  open,
  onOpenChange,
  title,
  options,
  loading = false,
  error,
  onRetry,
  onSelect,
  selectedId,
  placeholder = "Cari...",
  emptyMessage = "Tidak ada data",
  recentSelections = []
}) => {
  const [search, setSearch] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(searchLower) ||
      option.value.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  const handleSelect = (option: MasterDataOption) => {
    onSelect(option);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Recent Selections */}
          {!search && recentSelections.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Terakhir dipilih</span>
              </div>
              <div className="space-y-1">
                {recentSelections.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-2 transition-colors"
                  >
                    <span className="text-sm text-foreground">{option.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <ErrorState
              type="generic"
              message={error}
              onRetry={onRetry}
            />
          )}

          {/* Options List */}
          {!loading && !error && (
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                </div>
              ) : (
                filteredOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                      selectedId === option.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-surface-2"
                    }`}
                  >
                    <span className={`text-sm ${
                      selectedId === option.id ? "text-primary font-medium" : "text-foreground"
                    }`}>
                      {option.label}
                    </span>
                    {selectedId === option.id && (
                      <Badge variant="primary">Dipilih</Badge>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
