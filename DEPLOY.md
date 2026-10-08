# Deploy ke Vercel

## 1. Database (Postgres)
Buat database di Neon (neon.tech) atau Supabase, salin connection string ke `DATABASE_URL`.

## 2. Import ke Vercel
Vercel > Add New > Project > pilih repo ini. Framework terdeteksi Next.js.
Build memakai script `vercel-build`: `prisma generate`, `prisma migrate deploy`, lalu `next build`,
jadi tabel dibuat otomatis saat deploy pertama.

Environment variables (lihat `.env.example`):
- `DATABASE_URL`
- `NEXTAUTH_URL` (domain Vercel, mis. `https://sangkala.vercel.app`)
- `NEXTAUTH_SECRET` (`openssl rand -base64 32`)

## 3. Seed akun admin (sekali, dari laptop)
```bash
DATABASE_URL="<connection string>" npm run db:seed
```
Seed membuat akun demo dengan password lemah (`admin123`). Ganti sebelum situs dipublikasikan:
```bash
DATABASE_URL="<connection string>" npx tsx scripts/rotate-admin-password.ts --email admin@lna.com --generate
```

## Batasan di Vercel
Filesystem Vercel hanya-baca, jadi fitur yang menulis file ke disk belum berfungsi:
penerbitan PDF sertifikat, upload logo, bukti bayar, absensi, dan gambar artikel.
Halaman publik, login, dan data di database berjalan normal. Untuk mengaktifkan fitur upload,
pindahkan penyimpanan ke Vercel Blob atau S3/R2.
Endpoint reminder (`/api/cron/*`) tidak dijadwalkan di Vercel.
