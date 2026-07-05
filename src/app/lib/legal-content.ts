export type LegalPageSlug = "terms" | "privacy" | "pdp";

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalPageContent {
  slug: LegalPageSlug;
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: LegalSection[];
}

export const LEGAL_PAGES: Record<LegalPageSlug, LegalPageContent> = {
  terms: {
    slug: "terms",
    title: "Syarat & Ketentuan",
    subtitle: "Aidara — Dinas Kepemudaan dan Olahraga Kabupaten Bogor",
    updatedAt: "2 Juli 2026",
    sections: [
      {
        title: "1. Penerimaan Syarat",
        paragraphs: [
          "Dengan mengakses dan menggunakan aplikasi Aidara Mobile, Anda setuju untuk terikat oleh Syarat & Ketentuan ini.",
          "Aidara adalah sistem informasi keolahragaan yang dikelola Dinas Kepemudaan dan Olahraga (Dispora) Kabupaten Bogor.",
        ],
      },
      {
        title: "2. Penggunaan Layanan",
        paragraphs: [
          "Layanan ditujukan untuk atlet, pelatih, dan tenaga pendukung yang terdaftar resmi dalam sistem.",
          "Pengguna wajib menjaga kerahasiaan akun dan tidak membagikan kredensial login kepada pihak lain.",
          "Data yang diunggah harus akurat, sah, dan relevan dengan kegiatan keolahragaan.",
        ],
      },
      {
        title: "3. Hak Kekayaan Intelektual",
        paragraphs: [
          "Seluruh desain, logo, dan konten aplikasi merupakan milik Dispora Kabupaten Bogor kecuali dinyatakan lain.",
          "Pengguna tidak diperkenankan menyalin, mendistribusikan, atau memodifikasi aplikasi tanpa izin tertulis.",
        ],
      },
      {
        title: "4. Perubahan & Penghentian",
        paragraphs: [
          "Dispora berhak mengubah fitur, syarat, atau menghentikan layanan sewaktu-waktu dengan pemberitahuan melalui aplikasi.",
          "Pelanggaran syarat dapat mengakibatkan penangguhan atau penghapusan akses pengguna.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Kebijakan Privasi",
    subtitle: "Perlindungan data pribadi pengguna Aidara",
    updatedAt: "2 Juli 2026",
    sections: [
      {
        title: "1. Data yang Dikumpulkan",
        paragraphs: [
          "Aidara mengumpulkan data identitas (nama, NIK, email, nomor telepon), data olahraga (cabor, prestasi, pemeriksaan), serta foto/dokumen yang diunggah pengguna.",
          "Data lokasi dan foto absen latihan dikumpulkan hanya saat pengguna menggunakan fitur rekap absen.",
        ],
      },
      {
        title: "2. Tujuan Penggunaan",
        paragraphs: [
          "Data digunakan untuk manajemen atlet, program latihan, pemeriksaan kesehatan/performa, dan pelaporan keolahragaan.",
          "Data tidak dijual kepada pihak ketiga untuk tujuan komersial.",
        ],
      },
      {
        title: "3. Penyimpanan & Keamanan",
        paragraphs: [
          "Data disimpan di server yang dikelola pemerintah dengan akses terbatas dan enkripsi HTTPS.",
          "Token autentikasi disimpan secara lokal di perangkat pengguna dan dihapus saat logout.",
        ],
      },
      {
        title: "4. Hak Pengguna",
        paragraphs: [
          "Pengguna berhak meminta akses, koreksi, atau penghapusan data pribadi melalui administrator Dispora.",
          "Pengguna dapat menghubungi admin cabor atau Dispora untuk pertanyaan terkait data pribadi.",
        ],
      },
    ],
  },
  pdp: {
    slug: "pdp",
    title: "Perlindungan Data Pribadi (PDP)",
    subtitle: "Kepatuhan UU Perlindungan Data Pribadi",
    updatedAt: "2 Juli 2026",
    sections: [
      {
        title: "1. Dasar Hukum",
        paragraphs: [
          "Pemrosesan data pribadi dalam Aidara mengacu pada Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).",
          "Dispora Kabupaten Bogor bertindak sebagai pengendali data pribadi untuk data atlet, pelatih, dan tenaga pendukung.",
        ],
      },
      {
        title: "2. Jenis Data Pribadi",
        paragraphs: [
          "Data pribadi umum: nama, jenis kelamin, tanggal lahir, alamat, email, nomor telepon.",
          "Data pribadi spesifik: data kesehatan, hasil pemeriksaan fisik, foto absen, dan dokumen identitas/atlet.",
        ],
      },
      {
        title: "3. Dasar Pemrosesan",
        paragraphs: [
          "Pemrosesan data dilakukan berdasarkan persetujuan pengguna, pelaksanaan kontrak layanan, dan kewajiban hukum instansi pemerintah.",
          "Data kesehatan dan pemeriksaan hanya diakses oleh pihak yang berwenang sesuai peran pengguna.",
        ],
      },
      {
        title: "4. Retensi & Penghapusan",
        paragraphs: [
          "Data disimpan selama masa keanggotaan atlet/pelatih/tendik dan periode retensi arsip yang ditetapkan instansi.",
          "Permintaan penghapusan data dapat diajukan secara tertulis dan akan diproses sesuai ketentuan UU PDP.",
        ],
      },
      {
        title: "5. Kontak Pengaduan",
        paragraphs: [
          "Untuk pertanyaan atau pengaduan terkait data pribadi, hubungi administrator Aidara melalui Dinas Kepemudaan dan Olahraga Kabupaten Bogor.",
        ],
      },
    ],
  },
};
