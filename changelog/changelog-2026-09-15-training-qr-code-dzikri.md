# Fitur QR Code Otomatis untuk Pelatihan

**Tanggal**: 2026-09-15
**PIC**: Dzikri
**Branch**: `feat/training-qr-code` (based on `main`)

---

## Ringkasan

Setiap pelatihan yang dibuat admin sekarang otomatis punya QR code sendiri — di-scan langsung redirect ke halaman publik pelatihan itu (`/info-pelatihan/[id]`). Karena bakal di-deploy ke production yang sudah punya banyak pelatihan lama, disediakan juga script backfill supaya pelatihan existing ikut dapat QR code tanpa perlu dibuat ulang satu-satu.

Pola QR-nya diadopsi dari sistem yang sudah ada di fitur sertifikat (`src/lib/pdf-generator.ts`) — sama-sama pakai package `qrcode`, sama-sama disimpan sebagai data URL langsung di kolom database (bukan file terpisah).

---

## Apa yang Berubah

### 1. Schema — kolom `qrCodeData` di `Training`
`prisma/schema.prisma`: tambah `qrCodeData String?` (mirror `Certificate.qrCodeData`). Migration `20260915145046_add_training_qr_code` — cuma `ALTER TABLE ADD COLUMN`, nullable, aman buat data lama.

### 2. Helper generate — `src/lib/training-qr.ts` (baru)
Satu fungsi `generateTrainingQrCode(trainingId)`, dipakai bareng di 3 tempat (create, backfill, regenerate) — bukan disalin-tempel.

### 3. Auto-generate saat create pelatihan
`api/trainings/route.ts` POST: setelah training tersimpan, generate QR pakai `training.id` yang baru terbit, lalu update row itu. **Gagal generate QR tidak menggagalkan pembuatan pelatihan** — QR cuma artifact turunan id yang tidak pernah berubah, bisa dibuat ulang kapan saja tanpa kehilangan data.

### 4. Script backfill — `prisma/backfill-training-qr.ts` (baru)
Generate QR buat pelatihan lama yang belum punya. Default cuma proses yang `qrCodeData`-nya `null` (aman di-rerun, idempotent). Flag `--force` buat regenerate semua row (dipakai kalau ketauan `NEXTAUTH_URL` salah pas generate pertama). Script baru: `npm run db:backfill-training-qr`.

### 5. Endpoint regenerate manual — `POST /api/trainings/[id]/regenerate-qr` (baru)
Buat admin bisa buat ulang QR satu pelatihan dari UI tanpa perlu SSH server. Ownership check sama persis pola PUT/DELETE yang sudah ada (`SUPER_ADMIN` atau pembuat pelatihan itu sendiri).

### 6. UI admin — card QR di halaman detail pelatihan
`admin/(protected)/pelatihan/[id]/page.tsx`: card baru (setelah detail card, sebelum tab pendaftar/riwayat) — tampilkan QR, tombol unduh (`<a href={qrCodeData} download>`, trik data-URL-sebagai-href, tidak butuh route download terpisah), dan tombol "Buat Ulang QR Code" (khusus `canModify`). Nama file unduhan mengikuti judul pelatihan yang di-slug-kan (`toFileNameSlug()`, helper baru di file yang sama) — contoh `qrcode-pelatihan-manajemen-risiko-perbankan.png`, bukan ID mentah; fallback ke `qrcode-pelatihan.png` kalau judul tidak punya karakter alfanumerik sama sekali.

### 7. Dokumentasi deployment
`docs/09-deployment.md`: langkah `npx tsx prisma/backfill-training-qr.ts` disisipkan ke alur deploy (setelah `migrate deploy`, sebelum `build`) + checklist + peringatan eksplisit soal `NEXTAUTH_URL`.

---

## Keputusan yang Diambil

- **Alur create → generate → update (2 write)**, bukan pre-generate cuid manual. Training butuh `id` (yang baru ada setelah insert) buat bangun URL QR-nya — beda dari sertifikat yang `verifyHash`-nya random dan sudah ada sebelum insert. Dua write ke SQLite buat 1 baris itu overhead-nya tidak berarti (bukan hot path), dan ini menghindari kelas bug baru (bikin `id` kadang caller-supplied kadang DB-default).
- **Gagal generate QR tidak menggagalkan create** — graceful degradation, `qrCodeData: null` adalah state valid dan sudah ter-handle di UI (badge "Tidak Ada QR Code").
- **Backfill pakai script eksplisit (dijalankan manual pas deploy), bukan lazy-generate-on-read**. `GET /api/trainings/[id]` itu dipanggil publik/anonim (termasuk bot/crawler) — bikin GET nulis ke DB buka jalur write dari traffic tak terautentikasi, apalagi SQLite yang memang tidak didesain buat concurrent write banyak. Script eksplisit predictable (selesai = deploy selesai) dan auditable (ada log).
- **Fitur regenerate manual dibangun di v1** (bukan ditunda) — murah, dan langsung nutup resiko nyata: kalau `NEXTAUTH_URL` salah/kosong pas backfill jalan, semua QR pelatihan lama nunjuk ke domain yang salah. Dengan tombol regenerate, admin bisa fix env var lalu klik ulang per-training tanpa perlu SSH jalanin script `--force`.
- **Tidak ada entry `recordAuditLog` terpisah** buat generate/regenerate QR — ini bukan data bisnis baru yang perlu tercatat di "Riwayat Perubahan", cuma re-derive artifact yang sama dari id yang sama. `computeChangesDiff` di PUT juga tidak ikut track `qrCodeData`, sama kayak `imagePath`.

---

## Verifikasi

Bukan cuma type-check — dites langsung ke database:
- `npx tsc --noEmit`, `eslint`, `npm run build` — bersih (3 warning, semua pre-existing atau sesuai presedan: `<img>` buat data URL QR itu warning yang sama persis muncul di halaman preview sertifikat yang sudah ada).
- **Create-flow**: bikin training test via Prisma langsung (persis alur route), generate QR → data URL valid (`data:image/png;base64,...`, ~3.5KB).
- **Backfill**: dijalankan terhadap training "lama" tanpa QR → berhasil generate. Dijalankan lagi kedua kalinya → 0 diproses (idempotent terkonfirmasi). Dijalankan dengan `--force` → semua row ke-generate ulang termasuk yang sudah punya.
- Data test dibersihkan setelah verifikasi, tidak ada sisa row `TEST-*` di database.
- **Belum dilakukan**: klik-klik manual di browser (tombol unduh, tombol regenerate, scan QR beneran) — direncanakan dilakukan manual sebelum commit final.

---

## Panduan Deployment

### Development (lokal)
```bash
git pull
npm install
npx prisma migrate deploy   # atau migrate dev kalau environment interaktif
```
Kalau mau generate QR buat data lama di lokal: `npm run db:backfill-training-qr` (atau `-- --force` buat regenerate semua).

**Catatan khusus temuan sesi ini**: kalau `dev.db` lokal kamu sempat dipakai gantian buat develop branch lain yang schema-nya beda jauh (misal `feat/instansi-multi-tenant`), migration history-nya bisa "nyangkut" — Prisma bakal komplain migration yang tercatat applied tapi foldernya tidak ada di branch yang sedang aktif. Kalau ketemu ini, reset `dev.db` (hapus filenya, `migrate deploy` ulang) sesuai migration folder branch yang lagi dikerjain.

### Production
Selain langkah standar (`migrate deploy` → `build` → restart PM2), fitur ini butuh **satu langkah tambahan**:

1. **Wajib pastikan `NEXTAUTH_URL` di `.env` production sudah domain yang benar** sebelum lanjut — QR code di-generate berdasarkan ini, kalau salah semua QR pelatihan lama bakal nunjuk ke domain yang salah dan baru ketauan setelah di-scan orang.
2. Jalankan backfill setelah `migrate deploy`, sebelum `build`:
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/backfill-training-qr.ts
   npm run build
   pm2 restart lna-app
   ```
3. Script ini aman di-rerun kapan saja (no-op kalau semua sudah punya QR) — tidak perlu dihapus dari alur deploy setelah first-run.

Kalau ketauan `NEXTAUTH_URL` salah setelah backfill kadung jalan: `npx tsx prisma/backfill-training-qr.ts --force` buat regenerate semua (bukan cuma yang kosong).

Detail lengkap ada di `docs/09-deployment.md`.

---

## Dampak

- **Breaking changes**: tidak ada — kolom baru nullable, tidak ada perubahan behavior yang sudah ada.
- **Dependency baru**: tidak ada (`qrcode` sudah jadi dependency, dipakai fitur sertifikat).
- **Env var**: tidak ada yang baru, tapi `NEXTAUTH_URL` sekarang punya konsekuensi baru (dipakai bangun URL QR) — pastikan benar sebelum deploy.
- **Pelatihan lama di production**: butuh 1x jalanin script backfill setelah deploy supaya ikut dapat QR code — tidak otomatis dari migration saja.
