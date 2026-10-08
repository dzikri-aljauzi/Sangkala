# Deploy ke Vercel

Aplikasi ini memakai Postgres (bukan SQLite). Build di Vercel menjalankan script `vercel-build`:
`prisma generate`, `prisma migrate deploy`, lalu `next build`, jadi tabel dibuat otomatis saat deploy.

## 1. Database Postgres
Buat database di [Neon](https://neon.tech) (gratis). Salin connection string **Direct connection**
(host tanpa `-pooler`) dan pastikan berakhiran `?sslmode=require`. String direct dipakai karena
`prisma migrate deploy` bisa bermasalah lewat pooler. Untuk trafik portofolio ini sudah cukup.

## 2. Import ke Vercel
Vercel > Add New > Project > pilih repo > branch `main`. Framework terdeteksi Next.js; jangan ubah
Build Command (Vercel otomatis memakai `vercel-build`).

Environment variables (lihat `.env.example`):

| Nama | Isi |
|---|---|
| `DATABASE_URL` | connection string Postgres dari langkah 1 |
| `NEXTAUTH_URL` | URL situs, mis. `https://sangkala.vercel.app` (dipakai untuk link QR/verifikasi) |
| `NEXTAUTH_SECRET` | hasil `openssl rand -base64 32` (PowerShell: `[Convert]::ToBase64String((1..32 \| % {Get-Random -Max 256}))`) |

Opsional (email/reminder): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`,
`ADMIN_NOTIFICATION_EMAIL`, `CRON_SECRET`.

Klik Deploy. Setelah selesai, pastikan `NEXTAUTH_URL` sama persis dengan URL produksi; kalau beda,
ubah lalu Redeploy.

## 3. Buat akun admin (sekali, dari laptop)
Jangan jalankan `npm run db:seed` untuk produksi: seed itu membuat banyak akun demo dengan password
lemah yang tertulis di kode. Pakai seed minimal yang hanya membuat satu super admin dengan password
dari kamu sendiri (minimal 12 karakter).

PowerShell:
```powershell
$env:DATABASE_URL = "<connection string Postgres>"
$env:ADMIN_PASSWORD = "<password kuat>"
npm run db:seed-admin
```
macOS/Linux:
```bash
DATABASE_URL="<connection string>" ADMIN_PASSWORD="<password kuat>" npm run db:seed-admin
```
Email default `admin@sangkala.example` (ubah dengan `ADMIN_EMAIL`). Login di `/admin/login` dengan
email huruf kecil persis seperti itu.

## 4. Jalankan lokal setelah pindah ke Postgres
1. `npm install` (menjalankan `prisma generate`; tanpa ini Prisma Client masih versi SQLite lama).
2. Isi `.env` lokal: `DATABASE_URL` Postgres (boleh database Neon terpisah untuk dev), `NEXTAUTH_URL=http://localhost:3000`, `NEXTAUTH_SECRET`.
3. `npm run db:deploy` lalu `npm run db:seed-admin`.
Data SQLite lama tidak ikut pindah.

## Pemecahan masalah
- **Login selalu "Email atau password salah"** padahal benar: kode login menyamarkan error database
  menjadi pesan itu. Buka Vercel > Deployments > Functions/Logs dan cari `[auth] authorize findUnique failed`.
- **Build gagal di `prisma migrate deploy`**: cek `DATABASE_URL` (direct, `sslmode=require`) dan bahwa
  database bisa diakses dari internet.
- **QR/link verifikasi menunjuk localhost**: `NEXTAUTH_URL` belum diisi di Vercel.

## Batasan di Vercel
Filesystem Vercel hanya-baca, jadi fitur yang menulis file ke disk belum berfungsi: penerbitan PDF
sertifikat, upload logo, bukti bayar, absensi, dan gambar artikel. Halaman publik, login, dan data di
database berjalan normal. Untuk mengaktifkan upload, pindahkan penyimpanan ke Vercel Blob atau S3/R2.
Endpoint reminder (`/api/cron/*`) tidak dijadwalkan di Vercel. Pembatas percobaan login disimpan di
memori, jadi kurang efektif di serverless: gunakan password admin yang kuat.
