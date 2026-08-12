# Fitur Info Pelatihan — Bagian Admin (Ticket 0 + Bagian B)

**Tanggal**: 2026-08-10
**PIC**: Dzikri

---

## Ringkasan
Bagian pertama dari fitur "Info Pelatihan" (brief dari Ujik, 9 Agustus 2026): model data + seluruh manajemen pelatihan dari sisi admin. Dikerjakan lebih dulu secara sequential — Bagian A (halaman publik `/info-pelatihan`, oleh Arie) baru mulai setelah branch ini di-merge ke `main`. Detail pembagian kerja ada di `docs/Planning_Pengerjaan_Fitur_Info_Pelatihan.md`.

---

## Apa yang Berubah

### 1. Model Data (Ticket 0)
- Model `Training` baru di `prisma/schema.prisma`: `title`, `location`, `startDate`, `price` (teks bebas, opsional), `description`, `imagePath` (opsional), `isActive` (soft-delete, default `true`), relasi ke `createdBy` (`User`).
- Model `TrainingRegistrant` baru: `name`, `email`, `phone`, `institution` (opsional), relasi ke `Training` (cascade delete).
- Migration `20260810034743_add_trainings`.

### 2. API
- `GET /api/trainings` — publik, list pelatihan (default hanya `isActive`); admin bisa lihat semua lewat `?includeInactive=true`; dukung `?search=` dan `?filter=minggu-ini|bulan-ini|tahun-ini` (berdasarkan `startDate`, rentang kalender Senin–Minggu / tanggal 1–akhir bulan / Jan–Des, bukan rolling window).
- `POST /api/trainings` — admin only, buat pelatihan baru.
- `GET /api/trainings/[id]` — publik untuk pelatihan aktif; 404 untuk non-admin jika pelatihan nonaktif.
- `PUT /api/trainings/[id]` — admin only, update data + toggle `isActive`.
- `GET /api/trainings/[id]/registrants` — admin only, daftar pendaftar per pelatihan.
- `POST /api/upload/training` — admin only, upload gambar pelatihan ke `public/uploads/trainings/`.

### 3. Admin UI
- Tombol "Kelola Pelatihan" baru di admin hub (`assessment-center/admin/dashboard`), sejajar dengan tombol "Kelola Sertifikat" yang sudah ada. Header halaman admin (`/admin/pelatihan` & `/admin/pelatihan/[id]`) disamakan gayanya dengan halaman "Kelola Sertifikat" (branding + info admin + tombol Logout), bukan header minimal yang dipakai di draft awal.
- Halaman `/admin/pelatihan` — daftar pelatihan dalam bentuk card, search, filter pill "Semua / Minggu Ini / Bulan Ini / Tahun Ini" (client-side, pakai util yang sama dengan API), tombol "+ Tambah Pelatihan" (modal form dengan upload gambar).
- Halaman `/admin/pelatihan/[id]` — detail pelatihan, tabel data pendaftar, tombol Edit (reuse form yang sama), dan tombol Aktifkan/Nonaktifkan.

### 4. Infrastruktur pendukung
- `src/app/api/public/images/[...path]/route.ts` — tambah whitelist `uploads/trainings/` supaya gambar pelatihan bisa diserve di production (pola yang sama seperti fix logo 404 sebelumnya).
- `src/lib/training-filters.ts` — util bersama untuk menghitung rentang tanggal minggu/bulan/tahun ini, dipakai oleh API (server) dan halaman admin (client) supaya definisinya konsisten. Ini juga yang nanti dipakai Arie di Bagian A, jadi definisi filter tidak perlu ditulis ulang.
- `prisma/seed-trainings.ts` + script `npm run db:seed-trainings` — seeder 3 dummy pelatihan (tersebar di minggu ini / bulan ini / tahun ini beda bulan) untuk memudahkan manual testing, idempotent (aman dijalankan berkali-kali).
- `.gitignore` — tambah `/public/uploads/trainings/*` (gambar upload tidak ikut ter-commit, konsisten dengan pola `uploads/certificates`).

### 5. Tooling: shadcn MCP (persiapan, belum dipakai untuk refactor)
- `.mcp.json` — daftarkan MCP server resmi dari package `shadcn` (`npx shadcn@latest mcp init --client claude`), untuk dipakai di sesi terpisah saat refactor UI `/admin/pelatihan` & `/admin/pelatihan/[id]` ke komponen shadcn.
- `package.json` — `shadcn` ditambahkan sebagai devDependency (efek samping dari `mcp init`).
- **Belum** menjalankan `shadcn init` penuh (belum ada `components.json`, belum ada komponen shadcn yang dipasang) — itu scope sesi refactor terpisah, sengaja dipisah dari commit ini supaya checkpoint ini "aman" (build & fungsional penuh) sebelum eksperimen refactor dimulai.

---

## Keputusan yang Diambil (tanpa konfirmasi eksplisit, perlu direview)
- **Hapus pelatihan**: tidak ada endpoint `DELETE` — pakai soft-delete via `isActive` (konsisten dengan pola user deactivation yang sudah ada), supaya data pendaftar historis tidak hilang.
- **Format harga**: disimpan sebagai teks bebas (`String?`), bukan angka — mendukung nilai seperti "Gratis" atau "Hubungi Kami", bukan cuma nominal rupiah.
- **Gambar pelatihan**: opsional. Kalau kosong, card/detail menampilkan placeholder ikon, bukan gambar default.
- **Kuota pendaftar**: belum diimplementasikan (tidak ada validasi limit).

---

## Verifikasi
- `npx tsc --noEmit` — bersih, 0 error.
- `npm run build` — sukses, semua route baru muncul (`/admin/pelatihan`, `/admin/pelatihan/[id]`, `/api/trainings`, `/api/trainings/[id]`, `/api/trainings/[id]/registrants`, `/api/upload/training`).
- Smoke test end-to-end via curl dengan sesi admin asli (login lewat NextAuth credentials flow, seed user `admin@lna.com`):
  - GET publik tanpa login → 200, list kosong.
  - POST/PUT/GET registrants tanpa login → 401.
  - POST create → 201, data tersimpan benar.
  - PUT update + set `isActive: false` → GET publik jadi 404, GET admin tetap 200 (perilaku sesuai desain).
  - GET registrants → 200, array kosong (belum ada pendaftar, wajar karena form pendaftaran publik belum ada — itu scope Bagian A).
- Test filter tanggal pakai 3 dummy pelatihan dari seeder (jarak 3 hari / 18 hari / 95 hari dari hari ini): `?filter=minggu-ini` cuma balikin yang 3 hari, `?filter=bulan-ini` balikin yang 3 & 18 hari, `?filter=tahun-ini` balikin semua. Nilai filter tidak valid diabaikan (fallback ke tanpa filter tanggal), tidak error.

---

## Dampak untuk Bagian A (Arie)
- `api/trainings/route.ts` sudah berisi `POST` **dan** `GET` (list + `search` + `filter` minggu/bulan/tahun) — Bagian A tinggal konsumsi endpoint yang sudah jadi & teruji, tidak perlu menulis ulang.
- `api/trainings/[id]/route.ts` sudah berisi `PUT` dan `GET`; Bagian A tinggal menambahkan halaman yang consume `GET` yang sudah ada (tidak perlu dibuat ulang).
- `src/lib/training-filters.ts` bisa langsung diimpor untuk halaman publik `/info-pelatihan` supaya UI filter (pill/dropdown minggu-bulan-tahun) konsisten definisinya dengan API dan dengan admin side — tidak perlu didefinisikan ulang.
- Model `Training` & `TrainingRegistrant` sudah siap dipakai — tidak perlu migration tambahan kecuali ada field baru yang dibutuhkan Bagian A (misal field form pendaftaran yang belum dikonfirmasi ke Ujik).
