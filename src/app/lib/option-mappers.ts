import type { OptionItem } from "@/api/options";
import type { CascadeLevel } from "@/app/components/ui/cascade-picker";
import type { MasterDataOption } from "@/app/components/ui/master-data-picker";

type OptionLike = {
  id: number;
  nama: string;
  label?: string;
  [key: string]: unknown;
};

export function toMasterDataOption(item: OptionLike): MasterDataOption {
  return {
    id: String(item.id),
    label: item.label ?? item.nama,
    value: String(item.id),
    metadata: item,
  };
}

export function toMasterDataOptions(items: OptionLike[]): MasterDataOption[] {
  return items.map(toMasterDataOption);
}

export function toCascadeLevel(item: OptionItem): CascadeLevel {
  return {
    id: String(item.id),
    label: item.nama,
  };
}

export function toCascadeLevels(items: OptionItem[]): CascadeLevel[] {
  return items.map(toCascadeLevel);
}
