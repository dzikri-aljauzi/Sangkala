# Pembaruan UI Info Pelatihan, Layout Detail, dan Pemindahan Portal Admin

**Tanggal**: 2026-08-23  
**PIC**: Arie  
**Branch**: `feat/ui-enhancements`  

---

## Ringkasan

Sesi ini berfokus pada standardisasi input dan perombakan layout halaman Info Pelatihan serta pemisahan login Admin internal dari portal Assessment Center ke bagian Footer (Portal Admin).

---

## Apa yang Berubah

### 1. Standardisasi Harga & Nominal Rupiah Pelatihan
- Menjadikan input nominal harga wajib diisi (`required`) dan menghilangkan opsi checkbox gratis (seluruh pelatihan kini memiliki nominal terdaftar).
- Menambahkan prefix label visual `Rp` dan pemformatan separator ribuan dinamis (`2.500.000`) saat admin mengetik harga.
- Menstandarkan tampilan harga pada card publik dan halaman detail dengan format rupiah (`formatRupiah`).

### 2. Tanggal Mulai dan Tanggal Selesai (Database & UI)
- **Database & Prisma**: Menambahkan field `endDate DateTime?` pada model `Training` di `prisma/schema.prisma`.
- **Types & Utils**: Menambahkan `endDate: string | null` pada interface `Training` dan helper `formatTrainingDateRange` untuk format rentang tanggal cerdas (contoh: `13 – 15 Agustus 2026`).
- **Form Admin**: Modal Tambah & Edit Pelatihan kini memiliki input wajib untuk **Tanggal Mulai** dan **Tanggal Selesai**.
- **Backend**: Endpoint API `POST /api/trainings` dan `PUT /api/trainings/[id]` memvalidasi kelengkapan field tanggal mulai dan selesai.

### 3. Perombakan Layout Halaman Detail Info Pelatihan Publik
- **Poster Banner Penuh**: Banner ditampilkan utuh (*full width / edge-to-edge*) dengan aspect ratio natural tanpa pemotongan (*uncropped*).
- **Ringkasan Informasi**: Menampilkan grid 3 kolom untuk **Jadwal Pelaksanaan**, **Tempat**, dan **Biaya** dengan prefix `Rp`.
- **Aksi Pendaftaran**: Indikator sisa kuota dan tombol **Daftar Sekarang** berukuran penuh diletakkan tepat di bawah ringkasan jadwal/tempat/biaya.
- **Tentang Program**: Kotak deskripsi lengkap diletakkan di bagian bawah halaman.

### 4. Fitur Expand / Lightbox Preview Gambar Pelatihan di Admin
- Menambahkan tombol **Expand** dengan ikon `Maximize2` pada banner kartu detail pelatihan admin (`/admin/pelatihan/[id]`).
- Menambahkan tombol **Expand** pada thumbnail upload gambar di modal Tambah Pelatihan dan Edit Pelatihan.
- Modal dialog preview ukuran penuh (*lightbox*) memungkinkan admin melihat detail flyer/poster secara utuh sebelum atau sesudah disimpan.

### 5. Pemindahan Login Admin ke Footer & Pembersihan Assessment Center
- **Assessment Center**: Menghapus tab role `ADMIN` dari `/assessment-center/[id]/login` dan tombol login admin pada empty state `/assessment-center` agar area assesmen khusus bagi pengguna eksternal (Asesor, Klien, Staff Klien).
- **Grid Tab Role**: Memperbaiki container tab dari `grid-cols-4` menjadi `grid-cols-3` untuk menghilangkan celah kosong (*blank space*) di sisi kanan.
- **Portal Admin di Footer**: Menambahkan tautan **Portal Admin** dengan gaya *Subtle Pill Badge* (ikon `Lock`, background putih, border halus) di Footer Bottom Bar sebelah *Terms of Service* yang langsung mengarah ke halaman input credentials `/admin/login`.

---

## File yang Berubah

- `prisma/schema.prisma`
- `src/types/training.ts`
- `src/lib/utils.ts`
- `src/app/api/trainings/route.ts`
- `src/app/api/trainings/[id]/route.ts`
- `src/app/admin/(protected)/pelatihan/page.tsx`
- `src/app/admin/(protected)/pelatihan/[id]/page.tsx`
- `src/app/(main)/info-pelatihan/page.tsx`
- `src/app/(main)/info-pelatihan/[id]/page.tsx`
- `src/app/(assessment-center)/assessment-center/page.tsx`
- `src/app/(assessment-center)/assessment-center/[id]/login/page.tsx`
- `src/components/layout/Footer.tsx`
- `changelog/changelog-2026-08-23-ui-enhancements-training-and-auth-arie.md`
