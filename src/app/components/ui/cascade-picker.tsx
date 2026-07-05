import * as React from "react";
import { ChevronRight, Loader2, Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./drawer";
import { Badge } from "./badge";
import { Button } from "./button";
import { ErrorState } from "./error-state";

export interface CascadeLevel {
  id: string;
  label: string;
}

interface CascadePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  level1Options: CascadeLevel[];
  level1Loading?: boolean;
  level1Error?: string;
  onRetryLevel1?: () => void;
  onLoadLevel2: (level1Id: string) => Promise<CascadeLevel[]>;
  onSelect: (level1: CascadeLevel, level2: CascadeLevel) => void;
  selected?: { level1?: CascadeLevel; level2?: CascadeLevel };
  level1Label?: string;
  level2Label?: string;
  level1EmptyMessage?: string;
  level2EmptyMessage?: string;
}

export const CascadePicker: React.FC<CascadePickerProps> = ({
  open,
  onOpenChange,
  title,
  level1Options,
  level1Loading = false,
  level1Error,
  onRetryLevel1,
  onLoadLevel2,
  onSelect,
  selected,
  level1Label = "Kecamatan",
  level2Label = "Kelurahan",
  level1EmptyMessage = "Tidak ada kecamatan",
  level2EmptyMessage = "Tidak ada kelurahan",
}) => {
  const [selectedLevel1, setSelectedLevel1] = React.useState<CascadeLevel | null>(
    selected?.level1 || null
  );
  const [level2Options, setLevel2Options] = React.useState<CascadeLevel[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [level2Error, setLevel2Error] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<1 | 2>(selected?.level1 ? 2 : 1);

  const handleLevel1Select = async (option: CascadeLevel) => {
    setSelectedLevel1(option);
    setLoading(true);
    setLevel2Error(null);
    setStep(2);

    try {
      const level2Data = await onLoadLevel2(option.id);
      setLevel2Options(level2Data);
    } catch {
      setLevel2Options([]);
      setLevel2Error("Gagal memuat data kelurahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLevel2 = async () => {
    if (!selectedLevel1) return;
    setLoading(true);
    setLevel2Error(null);

    try {
      const level2Data = await onLoadLevel2(selectedLevel1.id);
      setLevel2Options(level2Data);
    } catch {
      setLevel2Options([]);
      setLevel2Error("Gagal memuat data kelurahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLevel2Select = (option: CascadeLevel) => {
    if (selectedLevel1) {
      onSelect(selectedLevel1, option);
      onOpenChange(false);
      resetState();
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedLevel1(null);
    setLevel2Options([]);
  };

  const resetState = () => {
    setStep(selected?.level1 ? 2 : 1);
    setSelectedLevel1(selected?.level1 || null);
    setLevel2Options([]);
    setLevel2Error(null);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetState();
      }}
    >
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-8 w-8 p-0"
              >
                ←
              </Button>
            )}
            <DrawerTitle>{title}</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className={`flex items-center gap-2 ${step === 1 ? "text-primary" : "text-success"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                step === 1 ? "bg-primary text-white" : "bg-success text-white"
              }`}>
                {step === 2 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="text-xs">{level1Label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center gap-2 ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                step === 2 ? "bg-primary text-white" : "bg-surface-2 border border-border"
              }`}>
                2
              </div>
              <span className="text-xs">{level2Label}</span>
            </div>
          </div>

          {/* Step 1: Level 1 Selection */}
          {step === 1 && level1Loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {step === 1 && !level1Loading && level1Error && (
            <ErrorState
              type="generic"
              message={level1Error}
              onRetry={onRetryLevel1}
            />
          )}

          {step === 1 && !level1Loading && !level1Error && (
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {level1Options.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">{level1EmptyMessage}</p>
                </div>
              ) : (
                level1Options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleLevel1Select(option)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-2 transition-colors"
                  >
                    <span className="text-sm text-foreground">{option.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 2: Level 2 Selection */}
          {step === 2 && (
            <div className="space-y-3">
              {selectedLevel1 && (
                <div className="px-2">
                  <Badge variant="outline">{selectedLevel1.label}</Badge>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : level2Error ? (
                <ErrorState
                  type="generic"
                  message={level2Error}
                  onRetry={handleRetryLevel2}
                />
              ) : (
                <div className="space-y-1 max-h-[450px] overflow-y-auto">
                  {level2Options.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm text-muted-foreground">{level2EmptyMessage}</p>
                    </div>
                  ) : (
                    level2Options.map(option => (
                      <button
                        key={option.id}
                        onClick={() => handleLevel2Select(option)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                          selected?.level2?.id === option.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-surface-2"
                        }`}
                      >
                        <span className={`text-sm ${
                          selected?.level2?.id === option.id ? "text-primary font-medium" : "text-foreground"
                        }`}>
                          {option.label}
                        </span>
                        {selected?.level2?.id === option.id && (
                          <Badge variant="primary">Dipilih</Badge>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
