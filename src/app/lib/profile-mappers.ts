import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type {
  Biodata,
  BiodataAtlet,
  BiodataPelatih,
  DokumenItem,
  PesertaRole,
  PrestasiItem,
  SertifikatItem,
} from "@/api/profile-types";
import type { ProfileData } from "@/app/components/profile/profile-header";
import type { Achievement } from "@/app/components/profile/prestasi-tab";
import type { Certificate } from "@/app/components/profile/sertifikat-tab";
import type { Document } from "@/app/components/profile/dokumen-tab";

function formatDate(value?: string | null, pattern = "d MMMM yyyy"): string {
  if (!value) return "-";
  try {
    return format(parseISO(value), pattern, { locale: localeId });
  } catch {
    return value;
  }
}

function formatDateInput(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function jenisKelaminLabel(value?: string | null): string {
  if (value === "L") return "Laki-laki";
  if (value === "P") return "Perempuan";
  return "-";
}

function getFileTypeFromUrl(url?: string | null): string {
  if (!url) return "FILE";
  const ext = url.split(".").pop()?.split("?")[0]?.toUpperCase();
  return ext || "FILE";
}

function medaliToUi(medali?: string | null): Achievement["medal"] {
  if (medali === "Emas") return "gold";
  if (medali === "Perak") return "silver";
  if (medali === "Perunggu") return "bronze";
  return "bronze";
}

function rankFromPrestasi(item: PrestasiItem): string {
  const raw = item.juara || item.peringkat || "-";
  return raw.replace(/^Juara\s+/i, "");
}

export interface BiodataSection {
  title: string;
  fields: Array<{ label: string; value: string | string[] }>;
}

export function mapRoleToHeaderRole(role: PesertaRole): ProfileData["role"] {
  if (role === "pelatih") return "coach";
  if (role === "tenaga_pendukung") return "support";
  return "athlete";
}

export function mapBiodataToHeader(biodata: Biodata, role: PesertaRole): ProfileData {
  return {
    name: biodata.nama,
    email: biodata.email || "-",
    role: mapRoleToHeaderRole(role),
    avatar: biodata.foto_thumbnail || biodata.foto || undefined,
    isActive: true,
    sports: biodata.cabor || [],
    joinDate: formatDate(biodata.tanggal_bergabung),
  };
}

export function mapBiodataToSections(biodata: Biodata, role: PesertaRole): BiodataSection[] {
  const sections: BiodataSection[] = [
    {
      title: "Informasi Pribadi",
      fields: [
        { label: "Nama Lengkap", value: biodata.nama },
        { label: "NIK", value: biodata.nik || "-" },
        { label: "Tanggal Lahir", value: formatDate(biodata.tanggal_lahir) },
        { label: "Tempat Lahir", value: biodata.tempat_lahir || "-" },
        { label: "Jenis Kelamin", value: jenisKelaminLabel(biodata.jenis_kelamin) },
      ],
    },
    {
      title: "Informasi Kontak",
      fields: [
        { label: "Email", value: biodata.email || "-" },
        { label: "No. Telepon", value: biodata.no_hp || "-" },
      ],
    },
    {
      title: "Informasi Alamat",
      fields: [
        { label: "Alamat", value: biodata.alamat || "-" },
        { label: "Kecamatan", value: biodata.kecamatan?.nama || "-" },
        { label: "Kelurahan", value: biodata.kelurahan?.nama || "-" },
      ],
    },
    {
      title: "Informasi Keolahragaan",
      fields: [
        { label: "Cabang Olahraga", value: biodata.cabor?.length ? biodata.cabor : "-" },
        {
          label: "Kategori Peserta",
          value: biodata.kategori_peserta?.length
            ? biodata.kategori_peserta.map((item) => item.nama)
            : "-",
        },
      ],
    },
  ];

  if (role === "atlet") {
    const atlet = biodata as BiodataAtlet;
    sections.push({
      title: "Data Atlet",
      fields: [
        { label: "Sekolah", value: atlet.sekolah || "-" },
        { label: "Kelas", value: atlet.kelas_sekolah || "-" },
        { label: "Agama", value: atlet.agama || "-" },
        { label: "NISN", value: atlet.nisn || "-" },
        { label: "Kategori Atlet", value: atlet.kategori_atlet?.nama || "-" },
        { label: "Posisi Atlet", value: atlet.posisi_atlet?.nama || "-" },
        { label: "Ukuran Baju", value: atlet.ukuran_baju || "-" },
        { label: "Ukuran Celana", value: atlet.ukuran_celana || "-" },
        { label: "Ukuran Sepatu", value: atlet.ukuran_sepatu || "-" },
        { label: "Disabilitas", value: atlet.disabilitas || "-" },
        { label: "Klasifikasi", value: atlet.klasifikasi || "-" },
        { label: "IQ", value: atlet.iq || "-" },
      ],
    });
  }

  if (role === "pelatih") {
    const pelatih = biodata as BiodataPelatih;
    sections[3].fields.push({
      label: "Jenis Pelatih",
      value: pelatih.jenis_pelatih?.nama || "-",
    });
    sections.push({
      title: "Data Pelatih",
      fields: [
        {
          label: "Pekerjaan Selain Melatih",
          value: pelatih.pekerjaan_selain_melatih || "-",
        },
      ],
    });
  }

  return sections;
}

export function mapBiodataToFormValues(biodata: Biodata) {
  return {
    nik: biodata.nik || "",
    nama: biodata.nama || "",
    jenis_kelamin: (biodata.jenis_kelamin as "L" | "P" | "") || "",
    tempat_lahir: biodata.tempat_lahir || "",
    tanggal_lahir: formatDateInput(biodata.tanggal_lahir),
    tanggal_bergabung: formatDateInput(biodata.tanggal_bergabung),
    alamat: biodata.alamat || "",
    kecamatan_id: biodata.kecamatan?.id ? String(biodata.kecamatan.id) : "",
    kelurahan_id: biodata.kelurahan?.id ? String(biodata.kelurahan.id) : "",
    kecamatan_label: biodata.kecamatan?.nama || "",
    kelurahan_label: biodata.kelurahan?.nama || "",
    no_hp: biodata.no_hp || "",
    email: biodata.email || "",
    nisn: "nisn" in biodata ? biodata.nisn || "" : "",
    agama: "agama" in biodata ? biodata.agama || "" : "",
    sekolah: "sekolah" in biodata ? biodata.sekolah || "" : "",
    kelas_sekolah: "kelas_sekolah" in biodata ? biodata.kelas_sekolah || "" : "",
    ukuran_baju: "ukuran_baju" in biodata ? biodata.ukuran_baju || "" : "",
    ukuran_celana: "ukuran_celana" in biodata ? biodata.ukuran_celana || "" : "",
    ukuran_sepatu: "ukuran_sepatu" in biodata ? biodata.ukuran_sepatu || "" : "",
    disabilitas: "disabilitas" in biodata ? biodata.disabilitas || "" : "",
    klasifikasi: "klasifikasi" in biodata ? biodata.klasifikasi || "" : "",
    iq: "iq" in biodata ? biodata.iq || "" : "",
    pekerjaan_selain_melatih:
      "pekerjaan_selain_melatih" in biodata ? biodata.pekerjaan_selain_melatih || "" : "",
  };
}

export function mapSertifikatItem(item: SertifikatItem): Certificate {
  return {
    id: String(item.id),
    name: item.nama_sertifikat,
    organizer: item.penyelenggara || "-",
    issueDate: item.tanggal_terbit ? parseISO(item.tanggal_terbit) : new Date(),
    fileUrl: item.file_url || undefined,
    fileType: getFileTypeFromUrl(item.file_url),
  };
}

export function mapPrestasiItem(item: PrestasiItem): Achievement {
  const isTeam = item.jenis_prestasi && item.jenis_prestasi !== "individu";
  return {
    id: String(item.id),
    eventName: item.nama_event,
    medal: medaliToUi(item.medali),
    rank: rankFromPrestasi(item),
    level: item.tingkat?.nama || "-",
    date: item.tanggal ? parseISO(item.tanggal) : new Date(),
    bonus: item.bonus ?? undefined,
    type: isTeam ? "team" : "individual",
    teamMembers: item.anggota_beregu?.map((member) => member.nama),
    sport: item.kategori_peserta?.nama || item.keterangan || "-",
  };
}

export function mapDokumenItem(item: DokumenItem): Document {
  return {
    id: String(item.id),
    type: item.jenis_dokumen?.nama || "Dokumen",
    documentNumber: item.nomor || "-",
    fileUrl: item.file_url || "",
    fileType: getFileTypeFromUrl(item.file_url),
    uploadDate: new Date(),
  };
}

export function openFileUrl(url?: string | null): void {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function openAuthenticatedFile(
  fetchBlob: () => Promise<Blob>,
  mimeType = "application/pdf"
): Promise<void> {
  const blob = await fetchBlob();
  const typedBlob = blob.type ? blob : new Blob([blob], { type: mimeType });
  const objectUrl = URL.createObjectURL(typedBlob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
