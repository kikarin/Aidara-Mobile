
# Task — Aidara Mobile PWA: API Integration → Production Launch

> **Tujuan:** Menghubungkan UI mobile (`/mobile`) ke backend Laravel API (`/web`), lalu deploy PWA ke production.
>
> **Production API:** `https://aidara.bogorkab.go.id/api`
>
> **Status saat ini:**
>
> - ✅ Backend API sudah lengkap (`web/routes/api.php` + 7 dokumen API)
> - ✅ UI mobile sudah dibuat (Figma batch 1–4, ~97 komponen)
> - ❌ Semua screen masih **mock data** (belum ada HTTP client)
> - ❌ Belum ada PWA manifest / service worker
> - ❌ URL docs & CORS masih mengacu domain lama (`summitct.co.id`)

---

## Legenda


| Simbol          | Arti                                                    |
| --------------- | ------------------------------------------------------- |
| 👤 **Dev**      | Tugas manual Anda (infra, env, deploy, install package) |
| 🤖 **AI Agent** | Tugas eksekusi kode oleh AI agent di Cursor             |
| 🔗              | Dependensi — harus selesai dulu                         |
| ⏱               | Estimasi relatif                                        |


---



## Fase 0 — Persiapan & Keputusan Arsitektur



### 0.1 Tentukan URL deploy mobile PWA 👤

- [x] Putuskan subdomain/path production mobile, contoh:
  - `https://mobile.aidara.bogorkab.go.id` *(disarankan)*
  - atau `https://app.aidara.bogorkab.go.id`
  - atau `https://aidara.bogorkab.go.id/app`
- [x] Catat keputusan di `.env` mobile sebagai `VITE_APP_URL`



### 0.2 Setup environment local 👤

- [x] Pastikan backend Laravel jalan di `http://localhost:8000`
- [x] Buat file `mobile/.env` (copy dari `.env.example` jika ada, atau buat manual):

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=Aidara
```

- [x] Buat file `mobile/.env.production`:

```env
VITE_API_BASE_URL=https://aidara.bogorkab.go.id/api
VITE_APP_URL=https://mobile.aidara.bogorkab.go.id
VITE_APP_NAME=Aidara
```



### 0.3 Install dependencies mobile 👤

- [x] Di folder `mobile/`, jalankan:

```bash
pnpm install   # atau npm install
```

- [x] Install package tambahan yang akan dipakai AI agent:

```bash
pnpm add @tanstack/react-query axios
pnpm add -D vite-plugin-pwa workbox-window
```

> `@tanstack/react-query` untuk caching & loading state. `axios` untuk HTTP client. `vite-plugin-pwa` untuk PWA.



### 0.4 Update backend CORS & env (production) 👤

- [x] Edit `web/.env` — update URL mobile:

```env
FRONTEND_URL_PROD=https://mobile.aidara.bogorkab.go.id
```

- [x] Setelah AI agent update `web/config/cors.php` (Fase 0.5), deploy perubahan ke server production
- [x] Pastikan `APP_URL=https://aidara.bogorkab.go.id` di server production
- [x] Pastikan SSL/HTTPS aktif di kedua domain (web + mobile)



### 0.5 Update CORS backend 🤖 🔗 0.1

- [x] Tambahkan origin mobile baru ke `web/config/cors.php`:

```php
'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://mobile.aidara.bogorkab.go.id', // sesuaikan dengan keputusan 0.1
],
```

- [x] Hapus atau pertahankan domain lama `summitct.co.id` sesuai kebutuhan migrasi



### 0.6 Update Base URL di dokumentasi API 🤖

- [x] Ganti semua referensi `https://aidara.summitct.co.id/api` → `https://aidara.bogorkab.go.id/api` di:
  - `web/docs/API_AUTH.md`
  - `web/docs/API_PROFILE.md`
  - `web/docs/API_CABOR.md`
  - `web/docs/API_PEMERIKSAAN.md`
  - `web/docs/API_PEMERIKSAAN_KHUSUS.md`
  - `web/docs/API_PRESTASI.md`
  - `web/docs/API_PROGRAM_LATIHAN.md`



### 0.7 Siapkan akun testing 👤

- [x] Siapkan minimal 3 akun (satu per role):
  - Atlet
  - Pelatih
  - Tenaga Pendukung
- [ ] Pastikan email OTP bisa diterima di environment staging/production
- [ ] Bagikan kredensial ke session dev (jangan commit ke repo)



### 0.8 User–Peserta Linking Hardening ✅ 🤖

> **Prasyarat mobile:** Selesaikan sebelum Fase 1 jika akun testing dipakai dari modul Users admin.

- [x] `App\Services\UserPesertaLinkService` — sync dua arah `users` ↔ `atlets/pelatihs/tenaga_pendukungs`
- [x] Modul Users — wajib pilih peserta jika primary role 35/36/37 + tampil di Show/Edit
- [x] API `GET /api/users/peserta-options` — picker peserta
- [x] Tab Akun (Atlet/Pelatih/Tenaga Pendukung) — pakai service yang sama
- [x] `ProfileController` & `AuthController` (mobile) — resolve peserta + block pending/rejected
- [x] Artisan: `php artisan aidara:sync-user-peserta-links [--dry-run]`

**👤 Dev — setelah deploy backend:**

- [x] Jalankan dry-run: `php artisan aidara:sync-user-peserta-links --dry-run`
- [x] Perbaiki orphan manual jika ada, lalu sync: `php artisan aidara:sync-user-peserta-links`
- [x] Verifikasi user registrasi approved tampil ID peserta di Users → Detail/Edit

---



## Fase 1 — Foundation: API Client & Auth

> **Prasyarat:** Fase 0 selesai
> **Referensi:** `web/docs/API_AUTH.md`



### 1.1 Struktur folder API layer 🤖

- [x] Buat struktur:

```
mobile/src/
├── api/
│   ├── client.ts          # axios instance + interceptors
│   ├── types.ts           # shared response types
│   ├── auth.ts
│   ├── options.ts
│   ├── profile.ts
│   ├── cabor.ts
│   ├── prestasi.ts
│   ├── program-latihan.ts
│   ├── pemeriksaan.ts
│   └── pemeriksaan-khusus.ts
├── hooks/
│   ├── use-auth.ts
│   └── use-api-error.ts
├── context/
│   └── auth-context.tsx
└── lib/
    ├── token-storage.ts   # localStorage wrapper
    └── query-client.ts    # react-query setup
```



### 1.2 HTTP client & interceptors 🤖 🔗 1.1

- [x] Axios instance dengan `baseURL` dari `import.meta.env.VITE_API_BASE_URL`
- [x] Request interceptor: attach `Authorization: Bearer {token}`
- [x] Response interceptor:
  - `401` → clear token, redirect ke login
  - Parse format `{ status, message, data, errors, meta }`
  - Normalisasi error 422 (validation) untuk form



### 1.3 TypeScript types dari API 🤖

- [x] Definisikan types untuk:
  - `ApiResponse<T>`, `ApiError`, `PaginatedMeta`
  - `User`, `UserRole` (atlet/pelatih/tenaga_pendukung)
  - Sesuaikan dengan response di docs API (7 file)



### 1.4 Auth service & context 🤖 🔗 1.2

- [x] Implementasi fungsi:
  - `login(email, password, deviceName?)`
  - `verifyOtp(email, otp)`
  - `resendOtp(email)`
  - `logout()`
  - `getProfile()`
  - `refreshToken()`
- [x] `AuthProvider` — simpan user + token di context
- [x] `token-storage.ts` — persist token di `localStorage` (key: `aidara_token`)
- [x] Auto-restore session saat app load (cek token → get profile)



### 1.5 Wire Auth screens 🤖 🔗 1.4

- [x] Ganti mock di `App.tsx` (handleLogin, handleOTPVerify, handleOTPResend)
- [x] `login-screen.tsx` — validasi form, tampilkan error API
- [x] `otp-screen.tsx` — countdown resend 60 detik, handle expired OTP
- [x] Protected route logic — redirect ke login jika belum auth
- [x] Logout button di `profile-screen.tsx`



### 1.6 React Query provider 🤖

- [x] Setup `QueryClientProvider` di `main.tsx`
- [x] Default options: retry 1x, staleTime 30s untuk list data



### 1.7 Testing auth flow 👤 🔗 1.5

- [x] Test login langsung (user verified)
- [x] Test login → OTP → verify
- [x] Test resend OTP cooldown
- [x] Test logout & session restore setelah refresh browser
- [x] Test kredensial salah & error message

---



## Fase 2 — Options & Shared Components

> **Referensi:** `web/docs/API_PROFILE.md` (bagian Options)



### 2.1 Options API service 🤖

- [x] `GET /api/options/all` — fetch semua dropdown sekaligus
- [x] Endpoint individual jika diperlukan (kecamatan, kelurahan, cabor, dll.)
- [x] Cache options di react-query (staleTime: 5 menit)



### 2.2 Integrasi picker components 🤖 🔗 2.1

- [x] `master-data-picker.tsx` — terima data dari API, bukan hardcoded
- [x] `cascade-picker.tsx` — kecamatan → kelurahan cascade
- [x] Loading & empty state saat options fetch



### 2.3 Shared UI states 🤖

- [x] Pastikan `loading-screen.tsx`, `loading-skeleton.tsx`, `error-state.tsx`, `empty-state.tsx` dipakai konsisten di semua modul
- [x] Offline detection (navigator.onLine) — tampilkan banner/error PWA

---



## Fase 3 — Modul Profile

> **Referensi:** `web/docs/API_PROFILE.md`
> **Screens:** `profile-screen-enhanced.tsx`, `biodata-view.tsx`, `sertifikat-tab.tsx`, `prestasi-tab.tsx`, `dokumen-tab.tsx`



### 3.1 Profile API service 🤖

- [x] Biodata: GET + PUT/POST (multipart untuk foto)
- [x] Sertifikat: GET, POST (upload file), DELETE
- [x] Prestasi profil: GET, POST, DELETE
- [x] Dokumen: GET, POST (upload file), DELETE



### 3.2 Wire Profile screens 🤖 🔗 3.1, 2.1

- [x] Load biodata sesuai role (atlet/pelatih/tenaga pendukung)
- [x] Form edit biodata dengan validasi 422 dari API
- [x] Tab sertifikat — list, upload, hapus
- [x] Tab prestasi — list, tambah, hapus
- [x] Tab dokumen — list, upload, hapus
- [x] Preview/download file (URL dari response API)



### 3.3 Testing Profile 👤 🔗 3.2

- [x] Test per role — field berbeda per role
- [x] Test upload file (sertifikat & dokumen)
- [x] Test edit biodata & validasi error

---



## Fase 4 — Modul Cabor

> **Referensi:** `web/docs/API_CABOR.md`
> **Screens:** `cabor-list-screen.tsx`, `cabor-detail-screen.tsx`, `cabor-participants-screen.tsx`, `cabor-ranking-screen.tsx`, `cabor-comparison-screen.tsx`



### 4.1 Cabor API service 🤖

- [x] `GET /api/v1/cabor` — dengan query: limit, search, sort, kategori_peserta_id
- [x] `GET /api/v1/cabor/{id}/peserta`
- [x] `GET /api/v1/cabor/{id}/ranking`
- [x] `GET /api/v1/cabor/{id}/perbandingan`



### 4.2 Wire Cabor screens 🤖 🔗 4.1

- [x] Hapus mock data di semua cabor screens
- [x] List: search debounce, filter kategori, pagination/infinite scroll
- [x] Detail: tampilkan statistik dari API
- [x] Peserta: tab atlet/pelatih/tenaga pendukung dari response API
- [x] Ranking & perbandingan: chart data dari API (recharts)
- [x] Fix hardcoded `setSelectedCaborName("Renang")` di `App.tsx` — ambil dari data API



### 4.3 Wire Home dashboard (partial) 🤖 🔗 4.1

- [x] `home-screen.tsx` — preview cabor (`GET /cabor?limit=5`) ganti mock athletes section
- [x] Link "Lihat semua" → cabor list



### 4.4 Testing Cabor 👤 🔗 4.2

- [x] Test search & filter
- [x] Test navigasi list → detail → peserta/ranking/perbandingan

---



## Fase 5 — Modul Prestasi Global

> **Referensi:** `web/docs/API_PRESTASI.md`
> **Screen:** `prestasi-global-screen.tsx`



### 5.1 Prestasi API service 🤖

- [x] `GET /api/v1/prestasi` — query: limit, kategori_peserta_id, jenis_prestasi



### 5.2 Wire Prestasi screen 🤖 🔗 5.1

- [x] Hapus mock data
- [x] Grouping per kategori peserta dari response API
- [x] Filter jenis prestasi (individu/beregu)
- [x] Medali & bonus dari API (`medal-badge.tsx`)



### 5.3 Wire Home dashboard (partial) 🤖 🔗 5.1

- [x] `home-screen.tsx` — preview prestasi (`limit=5`) ganti mock achievements



### 5.4 Testing Prestasi 👤 🔗 5.2

- [x] Test filter kategori & jenis prestasi
- [x] Test tampilan medali & total bonus

---



## Fase 6 — Modul Program Latihan & Rekap Absen

> **Referensi:** `web/docs/API_PROGRAM_LATIHAN.md`
> **Screens:** `program-list-screen.tsx`, `program-form-screen.tsx`, `program-detail-screen.tsx`, `rekap-home-screen.tsx`, `rekap-form-screen.tsx`, `rekap-detail-screen.tsx`, `gps-camera-modal.tsx`



### 6.1 Program Latihan API service 🤖

- [x] CRUD: GET list, POST create, PUT update, DELETE
- [x] Filter: `GET /filter/cabor`, `GET /filter/kategori/{caborId}`
- [x] Query params: page, per_page, search, cabor_id, date range, sort



### 6.2 Rekap Absen API service 🤖

- [x] `GET /{programId}/rekap-absen` — list rekap
- [x] `GET /{programId}/rekap-absen/today` — cek rekap hari ini
- [x] `POST /{programId}/rekap-absen` — create (multipart: foto + GPS)
- [x] `POST /{programId}/rekap-absen/{rekapId}` — update
- [x] `DELETE /{programId}/rekap-absen/{rekapId}/media/{mediaId}`



### 6.3 Wire Program screens 🤖 🔗 6.1, 2.1

- [x] List: pagination, search, filter cabor/kategori/tanggal
- [x] Form create/edit: dropdown cabor → kategori cascade dari API
- [x] Detail: data program + navigasi ke rekap
- [x] Hapus `MOCK_PROGRAMS`



### 6.4 Wire Rekap screens 🤖 🔗 6.2

- [x] List rekap per program
- [x] Form rekap: integrasi `gps-camera-modal.tsx` dengan Geolocation API browser
- [x] Upload foto via `multipart/form-data`
- [x] Validasi GPS coordinates ke API
- [x] Detail rekap: tampilkan media & lokasi



### 6.5 Testing Program & Rekap 👤 🔗 6.4

- [x] Test CRUD program latihan
- [x] Test buat rekap dengan foto + GPS (di device mobile asli)
- [x] Test edit & hapus media rekap
- [x] Test permission kamera & lokasi di browser

---



## Fase 7 — Modul Pemeriksaan

> **Referensi:** `web/docs/API_PEMERIKSAAN.md`
> **Screens:** `pemeriksaan-main-screen.tsx`, `pemeriksaan-list-screen.tsx`, `pemeriksaan-form-screen.tsx`, `pemeriksaan-detail-screen.tsx`, `input-nilai-screen.tsx`, `statistik-parameter-screen.tsx`



### 7.1 Pemeriksaan API service 🤖

- [x] CRUD: GET list, GET detail, POST, PUT, DELETE
- [x] `GET /{id}/peserta` — peserta dengan parameter
- [x] `POST /{id}/peserta-parameter/bulk-update` — input nilai bulk
- [x] `GET /statistik/parameter/{parameterId}` — statistik



### 7.2 Wire Pemeriksaan screens 🤖 🔗 7.1, 2.1

- [x] Hapus `MOCK` di `pemeriksaan-list-screen.tsx`
- [x] List: filter status (belum/sebagian/selesai), cabor, tanggal
- [x] Form create/edit pemeriksaan
- [x] Detail: progress & info pemeriksaan
- [x] Input nilai: bulk update per peserta/parameter
- [x] Statistik parameter: chart dari API



### 7.3 Testing Pemeriksaan 👤 🔗 7.2

- [x] Test buat pemeriksaan baru
- [x] Test input nilai bulk
- [x] Test statistik parameter
- [x] Test role-based access (pelatih vs atlet)

---



## Fase 8 — Modul Pemeriksaan Khusus

> **Referensi:** `web/docs/API_PEMERIKSAAN_KHUSUS.md`
> **Screens:** `pk-list-screen.tsx`, `assessment-detail-screen.tsx` (+ screen terkait di folder pemeriksaan)



### 8.1 Pemeriksaan Khusus API service 🤖

- [x] CRUD list/detail/update/delete
- [x] Template: GET/POST `/template`, `/template/{caborId}`
- [x] Setup: GET/POST `/setup`, `/setup/{pesertaId}`
- [x] Hasil tes: GET/POST `/hasil-tes`, `/peserta-hasil-tes`
- [x] Visualisasi: GET `/peserta-visualisasi`, `/visualisasi/{pesertaId}`
- [x] Clone: POST `/clone-template`



### 8.2 Wire PK screens 🤖 🔗 8.1

- [x] Hapus mock di `pk-list-screen.tsx` & `assessment-detail-screen.tsx`
- [x] Flow: buat PK → setup template → input hasil tes → visualisasi radar/chart
- [x] Chart visualisasi dari data API (recharts)



### 8.3 Testing Pemeriksaan Khusus 👤 🔗 8.2

- [x] Test flow lengkap create → setup → hasil → visualisasi
- [x] Test clone template antar cabor

---



## Fase 9 — PWA Setup

> **Referensi:** `web/docs/figma-mobile-pwa/01-design-system-auth-shell.md` (error state offline PWA)



### 9.1 PWA manifest & icons 👤

- [x] Siapkan icon PWA (192×192, 512×512) — logo Aidara
- [x] Letakkan di `mobile/public/icons/`
- [ ] (Opsional) Siapkan splash screen assets



### 9.2 Vite PWA plugin 🤖 🔗 0.3, 9.1

- [x] Konfigurasi `vite-plugin-pwa` di `vite.config.ts`:
  - `registerType: 'autoUpdate'`
  - Manifest: name, short_name, theme_color `#2563EB`, background_color, display `standalone`
  - Icons dari `public/icons/`
  - Workbox: cache static assets, network-first untuk API calls
- [x] Update `index.html`:
  - `<meta name="theme-color">`
  - `<meta name="apple-mobile-web-app-capable">`
  - `<link rel="apple-touch-icon">`
  - `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`



### 9.3 Install prompt & update notification 🤖 🔗 9.2

- [x] Handle `beforeinstallprompt` untuk "Add to Home Screen"
- [x] Toast saat ada update service worker baru



### 9.4 Testing PWA 👤 🔗 9.2

- [ ] Test install di Android Chrome
- [ ] Test install di iOS Safari (Add to Home Screen)
- [ ] Test offline — static shell tetap tampil, API tampilkan error state
- [ ] Test splash screen & status bar color

---



## Fase 10 — Routing & App Shell Polish



### 10.1 Migrasi navigasi ke React Router 🤖

- [x] `App.tsx` saat ini pakai state `currentScreen` — migrasi ke `react-router` (sudah ada di dependencies)
- [x] Definisikan routes per modul dengan protected route wrapper
- [x] Deep link support (refresh di `/program/123` tidak blank)
- [x] Browser back button berfungsi benar



### 10.2 App shell improvements 🤖

- [x] `bottom-nav.tsx` — sync dengan router, highlight active tab
- [x] Pull-to-refresh pada list screens (opsional)
- [x] Hapus/mock cleanup — pastikan tidak ada sisa `setTimeout` mock di `App.tsx`



### 10.3 Home dashboard final 🤖 🔗 Fase 4, 5, 6

- [x] Aggregasi data real: cabor preview, prestasi preview, program upcoming
- [x] Ganti semua mock di `home-screen.tsx`
- [x] Performance chart — tampilkan placeholder atau data statistik jika API tersedia

---



## Fase 11 — Production Build & Deploy



### 11.1 Build configuration 🤖

- [x] Pastikan `vite build` produce output di `mobile/dist/`
- [x] Env production terbaca (`VITE_API_BASE_URL` pointing ke bogorkab)
- [x] Source map: disabled di production
- [x] Asset hashing & gzip-ready



### 11.2 Server setup mobile PWA 👤 🔗 0.1, 11.1

- [ ] Buat virtual host / subdomain di nginx/apache untuk mobile PWA
- [ ] Point document root ke `mobile/dist/`
- [ ] SPA fallback — semua route → `index.html`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

- [ ] Enable gzip/brotli compression
- [ ] Cache static assets (js/css/images) — 1 year
- [ ] `index.html` — no-cache (agar update PWA cepat terdeteksi)
- [ ] Setup SSL certificate untuk subdomain mobile



### 11.3 Deploy backend changes 👤 🔗 0.4, 0.5

- [ ] Deploy updated `cors.php` ke production
- [ ] Clear config cache: `php artisan config:cache`
- [ ] Verify API health: `GET https://aidara.bogorkab.go.id/api/auth/profile` (expect 401)



### 11.4 Deploy mobile 👤 🔗 11.1, 11.2

- [ ] Build production:

```bash
cd mobile && pnpm build
```

- [ ] Upload `dist/` ke server (rsync/scp/CI pipeline)
- [ ] Verify: buka URL mobile di browser, login, navigasi semua tab



### 11.5 CI/CD (opsional) 👤

- [x] Setup GitHub Actions / pipeline deploy otomatis
- [ ] Trigger: push tag `mobile-v*` → build → deploy

---



## Fase 12 — QA, Security & Launch



### 12.1 QA checklist 👤

- [ ] **Auth:** login, OTP, logout, session restore, token expired
- [ ] **Profile:** CRUD semua tab, per role
- [ ] **Cabor:** list, search, detail, peserta, ranking, perbandingan
- [ ] **Prestasi:** list, filter, grouping
- [ ] **Program Latihan:** CRUD, filter, pagination
- [ ] **Rekap Absen:** create dengan foto+GPS, edit, delete media
- [ ] **Pemeriksaan:** CRUD, input nilai, statistik
- [ ] **Pemeriksaan Khusus:** full flow template → visualisasi
- [ ] **PWA:** install, offline, update
- [ ] **Cross-browser:** Chrome Android, Safari iOS, Chrome desktop
- [ ] **Performance:** Lighthouse PWA score ≥ 90



### 12.2 Security review 🤖

- [x] Token tidak exposed di URL/log
- [x] Logout clear semua storage
- [x] HTTPS only di production
- [x] File upload validation (type & size) di client-side
- [x] No sensitive data di localStorage selain token



### 12.3 Error monitoring (opsional) 👤

- [ ] Setup Sentry atau similar untuk mobile PWA
- [ ] Monitor 4xx/5xx rate di backend



### 12.4 Launch 👤 🔗 12.1

- [ ] Soft launch — uji dengan user internal (3 role)
- [ ] Fix critical bugs
- [ ] Announce / share URL PWA ke user
- [ ] Monitor server 24 jam pertama

---



## Ringkasan Pembagian Tugas


| Fase | 👤 Dev (Anda)                             | 🤖 AI Agent                              |
| ---- | ----------------------------------------- | ---------------------------------------- |
| 0    | Env, install package, DNS, SSL, akun test | CORS, update docs URL                    |
| 1    | Test auth flow                            | API client, auth context, wire login/OTP |
| 2    | —                                         | Options service, picker integration      |
| 3    | Test profile + upload                     | Profile API + wire screens               |
| 4    | Test cabor                                | Cabor API + wire screens + home partial  |
| 5    | Test prestasi                             | Prestasi API + wire screens              |
| 6    | Test GPS/kamera di device                 | Program & Rekap API + wire screens       |
| 7    | Test pemeriksaan                          | Pemeriksaan API + wire screens           |
| 8    | Test PK flow                              | PK API + wire screens                    |
| 9    | Icon assets, test install PWA             | vite-plugin-pwa config                   |
| 10   | —                                         | React Router, cleanup mock               |
| 11   | Nginx, deploy, SSL, build & upload        | Build config polish                      |
| 12   | QA, launch, monitoring                    | Security review                          |


---



## Urutan Eksekusi Disarankan

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7 → Fase 8 → Fase 9 → Fase 10 → Fase 11 → Fase 12
                ↘ Fase 4 & 5 bisa paralel setelah Fase 2 ↗
                ↘ Fase 7 & 8 bisa paralel setelah Fase 2 ↗
```

**Critical path:** 0 → 1 → 2 → 6 (Rekap GPS) → 9 (PWA) → 11 (Deploy) → 12 (Launch)

---



## Referensi Dokumentasi


| File                                 | Modul                                 |
| ------------------------------------ | ------------------------------------- |
| `web/docs/API_AUTH.md`               | Login, OTP, token                     |
| `web/docs/API_PROFILE.md`            | Biodata, sertifikat, dokumen, options |
| `web/docs/API_CABOR.md`              | Cabor list, peserta, ranking          |
| `web/docs/API_PRESTASI.md`           | Prestasi global                       |
| `web/docs/API_PROGRAM_LATIHAN.md`    | Program latihan & rekap absen         |
| `web/docs/API_PEMERIKSAAN.md`        | Pemeriksaan reguler                   |
| `web/docs/API_PEMERIKSAAN_KHUSUS.md` | Pemeriksaan khusus                    |
| `web/docs/figma-mobile-pwa/`         | Spesifikasi UI/UX                     |
| `web/routes/api.php`                 | Source of truth routes                |


---



## Catatan Penting

1. **Domain lama vs baru:** Docs API saat ini masih menyebut `aidara.summitct.co.id`. Production sekarang `aidara.bogorkab.go.id`. Fase 0.6 wajib diselesaikan agar tidak confusion.
2. **Mock data:** Saat ini ~15+ screen menggunakan hardcoded mock. AI agent harus replace semua saat wiring API — jangan biarkan mock tertinggal.
3. **Upload file:** Profile (sertifikat/dokumen) dan Rekap Absen (foto) butuh `multipart/form-data`. Jangan pakai JSON untuk endpoint upload.
4. **Role-based UI:** API sudah auto-detect role. Mobile UI harus hide/show field sesuai role user (atlet/pelatih/tenaga pendukung).
5. **GPS & Kamera:** Fitur rekap absen butuh test di **device fisik** (bukan desktop emulator) — ini tugas Dev di Fase 6 & 12.
6. **CORS:** Setiap perubahan URL mobile harus diikuti update `web/config/cors.php` + deploy backend.

---

*Dibuat: Juli 2026 | Versi: 1.0*