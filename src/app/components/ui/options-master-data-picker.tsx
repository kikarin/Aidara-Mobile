import * as React from "react";
import type { AllOptionsKey } from "@/api/options";
import {
  MasterDataPicker,
  type MasterDataOption,
} from "@/app/components/ui/master-data-picker";
import { useOptionsList } from "@/hooks/use-options";

const OPTION_TITLES: Record<AllOptionsKey, string> = {
  kecamatan: "Pilih Kecamatan",
  tingkat: "Pilih Tingkat",
  jenis_dokumen: "Pilih Jenis Dokumen",
  kategori_peserta: "Pilih Kategori Peserta",
  cabor: "Pilih Cabang Olahraga",
  kategori_atlet: "Pilih Kategori Atlet",
  posisi_atlet: "Pilih Posisi Atlet",
  kategori_prestasi_pelatih: "Pilih Kategori Prestasi",
};

type OptionsMasterDataPickerProps = Omit<
  React.ComponentProps<typeof MasterDataPicker>,
  "options" | "loading" | "error" | "onRetry" | "title"
> & {
  optionKey: AllOptionsKey;
  title?: string;
};

export const OptionsMasterDataPicker: React.FC<OptionsMasterDataPickerProps> = ({
  optionKey,
  title,
  emptyMessage,
  ...pickerProps
}) => {
  const { options, isLoading, errorMessage, refetch } = useOptionsList(optionKey);

  return (
    <MasterDataPicker
      {...pickerProps}
      title={title ?? OPTION_TITLES[optionKey]}
      options={options}
      loading={isLoading}
      error={errorMessage}
      onRetry={() => void refetch()}
      emptyMessage={emptyMessage ?? `Tidak ada ${OPTION_TITLES[optionKey].replace("Pilih ", "").toLowerCase()}`}
    />
  );
};

export type { MasterDataOption };
