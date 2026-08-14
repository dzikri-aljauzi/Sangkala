# Audit & Perbaikan Struktur Codebase — Batch 1

**Tanggal**: 2026-08-14
**PIC**: Dzikri
**Branch**: `refactor/codebase-structure-audit` (based on `main`)

---

## Ringkasan
Audit menyeluruh struktur codebase dengan scope ketat "clean code" (bagaimana kode ditulis) dan "clean structure" (di mana kode hidup) — dipicu oleh temuan "Kelola Pelatihan" dan "Kelola Sertifikat" yang tampil setara di hub admin tapi hidup di cabang routing berbeda total. Hasil audit dicatat di `docs/12-audit-struktur-codebase.md` (25 item dalam scope). 6 item prioritas tinggi dikerjakan di sesi ini, masing-masing sebagai commit terpisah; sisanya (termasuk pecah `AdminDashboard.tsx` 3126 baris) sengaja ditunda jadi task terpisah.

---

## Apa yang Berubah

### 1. Konsolidasi routing admin (audit #1, #4)
"Kelola Sertifikat" dan halaman admin login/hub — yang tadinya hidup di `(assessment-center)/assessment-center/admin*` — dipindah (`git mv`, history kepelihara) jadi satu pohon dengan "Kelola Pelatihan":
- `/assessment-center/admin-login` → `/admin/login`
- `/assessment-center/admin/dashboard` → `/admin` (hub)
- `/assessment-center/admin/dashboard/certificates` → `/admin/sertifikat`
- `.../certificates/[id]/preview` → `/admin/sertifikat/[id]/preview`

Semua link/redirect/`callbackUrl` terkait diupdate. `/assessment-center/[id]/*` (portal klien/asesor) tidak disentuh — itu memang beda konteks (produk Assessment Center), bukan bagian dari "admin".

### 2. Middleware + shared admin layout (audit #2, #3)
- `src/middleware.ts` baru — satu pengecekan auth server-side (`getToken` dari `next-auth/jwt`) untuk semua `/admin/*` kecuali `/admin/login`, gantiin pengecekan `useSession()+useEffect+router.push` yang di-copy-paste manual di tiap halaman.
- `/admin/pelatihan`, `/admin/manage`, dan hub dipindah ke route group `src/app/admin/(protected)/` (tidak mengubah URL publik) supaya bisa dapat satu `layout.tsx` bersama buat header (logo, nama/email admin, tombol logout).
- Efek samping bagus: `admin/sertifikat/[id]/preview` (server component tanpa auth-guard sendiri) sekarang otomatis terproteksi middleware — sebelumnya bisa diakses langsung tanpa login sama sekali.

### 3. Dedup `ProgressView` (audit #6)
Komponen 270 baris yang di-copy-paste identik (beda 2 komentar doang) di `KlienDashboard.tsx` dan `StaffKlienDashboard.tsx` — diekstrak ke `src/components/shared/ProgressView.tsx`.

### 4. `requireAdmin()` + konsolidasi upload (audit #7, #8)
- `src/lib/api-auth.ts`: `requireAdmin()` — satu sumber kebenaran buat pengecekan admin di API, sebelumnya di-copy-paste verbatim di 26 file (39 lokasi). Diterapkan ke 20 file yang punya pola "gerbang admin buat seluruh endpoint"; 6 file dengan pola beda (cek role di tengah handler buat satu action spesifik — attendance/progress/upload per-tipe, atau "admin ATAU uploader" di documents) sengaja **tidak disentuh**, bukan pola yang sama.
- `src/lib/upload-image.ts`: `handleImageAssetUpload()` diekstrak dari `upload/training` dan `upload/article` yang tadinya file duplikat 100%. URL endpoint tidak berubah, jadi tidak ada caller yang perlu diupdate.

### 5. Shared file-serving utilities (audit #9, direvisi)
`api/files` dan `api/public/images` **sengaja tetap dua endpoint terpisah** — beda model keamanan (authenticated-download-bebas vs public-allowlisted-inline), gabungin keduanya justru nambah resiko (nyampur logic auth-gated dan public-open). Yang genuinely duplikat (cek path-traversal, lookup content-type — yang sebelumnya sudah **drift**, dua map yang tidak identik) diekstrak ke `src/lib/file-serving.ts`.

### 6. Shared type `Training` (audit #10, scope dikurangi)
`src/types/training.ts` — interface `Training` yang tadinya didefinisikan ulang beda-beda (sudah drift) di 4 file (`info-pelatihan/page.tsx`, `info-pelatihan/[id]/page.tsx`, `admin/pelatihan/page.tsx`, `admin/pelatihan/[id]/page.tsx`). Interface `Assessment` (7 file, variasi lebih besar) sengaja **tidak dikerjakan** — 2 dari 7 file bakal ikut ditulis ulang nanti pas `AdminDashboard.tsx` dipecah, lebih aman disatuin di situ.

---

## Keputusan yang Diambil
- **Structure dulu, baru code cleanup** — biar tidak bolak-balik pindahin file yang isinya juga lagi dirapikan.
- **Commit per item, bukan satu commit besar** — supaya riwayat git tetap bisa di-bisect/revert per perbaikan kalau ada yang perlu di-rollback.
- **Jangan paksa gabung yang beda tujuan** — `api/files` vs `api/public/images` dan `upload/route.ts` generic vs `upload/training`+`upload/article` sengaja dibiarkan terpisah karena solve masalah yang beda, bukan duplikat murni.
- **`AdminDashboard.tsx` (3126 baris) ditunda** — effort besar, resiko regresi tinggi di fitur yang sudah live, layak jadi task terpisah dengan testing sendiri.

---

## Verifikasi
- `npm run lint` + `npm run build` dijalankan setelah **setiap item**, bukan cuma di akhir — semua bersih (error yang muncul di sepanjang proses dikonfirmasi pre-existing lewat `git diff`, tidak berkaitan dengan perubahan sesi ini).
- Build mengonfirmasi seluruh route baru terdaftar (`/admin`, `/admin/login`, `/admin/sertifikat`, dst) dan middleware aktif (`ƒ Proxy (Middleware)`).
- Belum ada manual browser QA end-to-end (login admin → navigasi semua menu → logout → akses tanpa login) — perlu dilakukan sebelum merge.

---

## Dampak
- **Breaking changes**: URL admin sertifikat & login berubah (`/assessment-center/admin-login` → `/admin/login`, dst) — bookmark lama admin perlu diupdate manual. `/admin/pelatihan` dan `/admin/manage` **tidak berubah** URL-nya.
- **Dependency baru**: tidak ada.
- **Item audit yang masih terbuka**: 19 item lain di `docs/12-audit-struktur-codebase.md` (termasuk split `AdminDashboard.tsx`, migrasi styling ke semantic token, dan beberapa item kosmetik) — belum dikerjakan, menunggu prioritas berikutnya.
