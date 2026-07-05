import * as React from "react";
import { X, Plus, Search } from "lucide-react";
import { Badge } from "./badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./drawer";
import { Input } from "./input";
import { Button } from "./button";

export interface ChipOption {
  id: string;
  label: string;
}

interface MultiSelectChipsProps {
  options: ChipOption[];
  selected: ChipOption[];
  onChange: (selected: ChipOption[]) => void;
  label: string;
  placeholder?: string;
  maxDisplay?: number;
}

export const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({
  options,
  selected,
  onChange,
  label,
  placeholder = "Pilih...",
  maxDisplay = 3
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  const handleToggle = (option: ChipOption) => {
    const isSelected = selected.some(item => item.id === option.id);
    if (isSelected) {
      onChange(selected.filter(item => item.id !== option.id));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleRemove = (optionId: string) => {
    onChange(selected.filter(item => item.id !== optionId));
  };

  const displayedSelected = selected.slice(0, maxDisplay);
  const remainingCount = selected.length - maxDisplay;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {/* Selected Chips Display */}
      <div className="flex flex-wrap gap-2">
        {displayedSelected.map(option => (
          <Badge
            key={option.id}
            variant="secondary"
            className="pl-3 pr-1 py-1.5 flex items-center gap-1.5"
          >
            <span className="text-xs">{option.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(option.id);
              }}
              className="h-4 w-4 rounded-full hover:bg-surface-2 flex items-center justify-center transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {remainingCount > 0 && (
          <Badge variant="outline" className="px-3 py-1.5">
            <span className="text-xs">+{remainingCount} lainnya</span>
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-7 px-3"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          {selected.length === 0 ? placeholder : "Tambah"}
        </Button>
      </div>

      {/* Selection Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>{label}</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                className="pl-10"
                autoFocus
              />
            </div>

            {/* Selected Count */}
            {selected.length > 0 && (
              <div className="flex items-center justify-between px-2">
                <span className="text-sm text-muted-foreground">
                  {selected.length} dipilih
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange([])}
                  className="h-8"
                >
                  Hapus Semua
                </Button>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filteredOptions.map(option => {
                const isSelected = selected.some(item => item.id === option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleToggle(option)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-surface-2"
                    }`}
                  >
                    <span className={`text-sm ${
                      isSelected ? "text-primary font-medium" : "text-foreground"
                    }`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <X className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Done Button */}
            <Button
              onClick={() => setOpen(false)}
              className="w-full"
            >
              Selesai
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
