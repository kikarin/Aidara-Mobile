import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type {
  PrestasiItem,
  PrestasiKategoriGroup,
  PrestasiMedaliCount,
} from "@/api/prestasi-types";

export type MedalUiType = "gold" | "silver" | "bronze";
export type ParticipantRoleUi = "athlete" | "coach" | "support";

export interface GlobalPrestasiItem {
  id: string;
  participantName: string;
  participantRole: ParticipantRoleUi;
  eventName: string;
  medal: MedalUiType | null;
  rank: string;
  sport: string;
  cabor: string;
  date: string;
  dateLabel: string;
  level: string;
  bonus: number;
  isTeam: boolean;
  teamMembers?: string[];
  disability?: string;
  classification?: string;
  iq?: string;
  kategoriPeserta: string;
  avatar?: string;
}

export interface PrestasiGroupUi {
  kategoriId: number | null;
  kategoriNama: string;
  count: number;
  totalBonus: number;
  totalMedali: PrestasiMedaliCount;
  hasMore?: boolean;
  prestasi: GlobalPrestasiItem[];
}

export function mapMedaliToUi(medali: string): MedalUiType | null {
  if (medali === "Emas") return "gold";
  if (medali === "Perak") return "silver";
  if (medali === "Perunggu") return "bronze";
  return null;
}

export function mapPesertaTypeToRole(pesertaType: string): ParticipantRoleUi {
  if (pesertaType === "pelatih") return "coach";
  if (pesertaType === "tenaga_pendukung") return "support";
  return "athlete";
}

function formatPrestasiDate(value: string): string {
  try {
    return format(parseISO(value), "dd MMM yyyy", { locale: localeId });
  } catch {
    return value;
  }
}

function extractJuaraNumber(juara: string): string {
  const match = juara.match(/\d+/);
  return match?.[0] ?? juara;
}

export function mapPrestasiItem(item: PrestasiItem): GlobalPrestasiItem {
  const isTeam = item.is_beregu === true;
  const sportLabel = item.nomor_posisi && item.nomor_posisi !== "-"
    ? `${item.cabor} - ${item.nomor_posisi}`
    : item.cabor;

  return {
    id: String(item.id),
    participantName: item.nama,
    participantRole: mapPesertaTypeToRole(item.peserta_type),
    eventName: item.nama_event,
    medal: mapMedaliToUi(item.medali),
    rank: extractJuaraNumber(item.juara),
    sport: sportLabel,
    cabor: item.cabor,
    date: item.tanggal,
    dateLabel: formatPrestasiDate(item.tanggal),
    level: item.tingkat,
    bonus: item.bonus,
    isTeam,
    teamMembers: item.anggota_beregu?.map((a) => a.nama),
    disability: item.disabilitas && item.disabilitas !== "-" ? item.disabilitas : undefined,
    classification: item.klasifikasi && item.klasifikasi !== "-" ? item.klasifikasi : undefined,
    iq: item.iq && item.iq !== "-" ? item.iq : undefined,
    kategoriPeserta: item.kategori_peserta,
    avatar: item.foto_thumbnail || item.foto || undefined,
  };
}

export function mapPrestasiGroup(group: PrestasiKategoriGroup): PrestasiGroupUi {
  return {
    kategoriId: group.kategori_peserta_id,
    kategoriNama: formatKategoriLabel(group.kategori_peserta_nama),
    count: group.count,
    totalBonus: group.total_bonus,
    totalMedali: group.total_medali,
    hasMore: group.has_more,
    prestasi: group.prestasi.map(mapPrestasiItem),
  };
}

export function mapPrestasiGroups(groups: PrestasiKategoriGroup[]): PrestasiGroupUi[] {
  return groups.map(mapPrestasiGroup);
}

export function flattenPrestasiPreview(groups: PrestasiKategoriGroup[], limit = 5): GlobalPrestasiItem[] {
  return groups
    .flatMap((group) => group.prestasi)
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, limit)
    .map(mapPrestasiItem);
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKategoriLabel(nama: string): string {
  if (!nama || nama === "-") return "Lainnya";
  return nama;
}

export function getBonusTextClass(value: number): string {
  const formatted = formatRupiah(value);
  if (formatted.length > 16) return "text-sm font-bold leading-tight";
  if (formatted.length > 13) return "text-base font-bold leading-tight";
  return "text-lg font-bold leading-tight";
}

export const JENIS_PRESTASI_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "individu", label: "Individu" },
  { value: "ganda/mixed/beregu/double", label: "Beregu" },
] as const;

export type JenisPrestasiFilter = (typeof JENIS_PRESTASI_OPTIONS)[number]["value"];
