export interface BiodataOption {
  value: string;
  label: string;
}

function toOptions(values: string[]): BiodataOption[] {
  return values.map((value) => ({ value, label: value }));
}

export const AGAMA_OPTIONS: BiodataOption[] = toOptions([
  "Islam",
  "Kristen Protestan",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Kepercayaan",
]);

export const UKURAN_BAJU_OPTIONS: BiodataOption[] = toOptions([
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
]);

export const UKURAN_CELANA_OPTIONS: BiodataOption[] = toOptions([
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
]);

export const UKURAN_SEPATU_OPTIONS: BiodataOption[] = toOptions([
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
]);

export const KELAS_SEKOLAH_OPTIONS: BiodataOption[] = toOptions([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "X",
  "XI",
  "XII",
]);

export const DISABILITAS_OPTIONS: BiodataOption[] = toOptions([
  "Tidak Ada",
  "Fisik",
  "Netra",
  "Rungu",
  "Intelektual",
  "Ganda",
]);

export const KLASIFIKASI_NPCI_OPTIONS: BiodataOption[] = toOptions([
  "Tidak Ada",
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "S6",
  "S7",
  "S8",
  "S9",
  "S10",
  "S11",
  "S12",
  "S13",
  "S14",
]);

export const JENIS_KELAMIN_OPTIONS: BiodataOption[] = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

export function mapApiListToOptions(
  items: Array<{ id: number; nama: string }>
): BiodataOption[] {
  return items.map((item) => ({ value: item.nama, label: item.nama }));
}
