import * as React from "react";
import * as optionsApi from "@/api/options";
import { toCascadeLevels } from "@/app/lib/option-mappers";
import {
  CascadePicker,
  type CascadeLevel,
} from "@/app/components/ui/cascade-picker";
import { useOptionsList } from "@/hooks/use-options";

interface KecamatanKelurahanPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSelect: (kecamatan: CascadeLevel, kelurahan: CascadeLevel) => void;
  selected?: { level1?: CascadeLevel; level2?: CascadeLevel };
}

export const KecamatanKelurahanPicker: React.FC<KecamatanKelurahanPickerProps> = ({
  open,
  onOpenChange,
  title = "Pilih Kecamatan & Kelurahan",
  onSelect,
  selected,
}) => {
  const {
    options: kecamatanOptions,
    isLoading,
    errorMessage,
    refetch,
  } = useOptionsList("kecamatan");

  const level1Options = React.useMemo(
    () =>
      kecamatanOptions.map((item) => ({
        id: item.id,
        label: item.label,
      })),
    [kecamatanOptions]
  );

  const handleLoadKelurahan = React.useCallback(async (kecamatanId: string) => {
    const response = await optionsApi.getKelurahanByKecamatan(Number.parseInt(kecamatanId, 10));
    const data = optionsApi.unwrapOptionsData(response);
    return toCascadeLevels(data);
  }, []);

  return (
    <CascadePicker
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      level1Options={level1Options}
      level1Loading={isLoading}
      level1Error={errorMessage}
      onRetryLevel1={() => void refetch()}
      onLoadLevel2={handleLoadKelurahan}
      onSelect={onSelect}
      selected={selected}
    />
  );
};

export type { CascadeLevel };
