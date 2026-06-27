# Changelog

## [Unreleased] — 2026-06-27

PIC: Arie

### Feature: Modul Pembuatan Sertifikat Dinamis (Individu & Instansi Kolektif)

Mengimplementasikan sistem penerbitan sertifikat dinamis dengan format PDF, integrasi QR Code verifikasi otomatis, fitur unggah data peserta dari Excel secara massal (Bulk Upload), fitur manajemen peserta kolektif, halaman verifikasi publik yang aman, serta pemisahan tipe sertifikat Individu dan Instansi.

**`prisma/schema.prisma`**
- Menambahkan model `Certificate` dan `CertificateParticipant` untuk mendukung penyimpanan data sertifikat, kode QR (base64 DataURL), nama program, path PDF, kode sertifikat, tipe (`INDIVIDU` / `INSTANSI`), dan hash verifikasi unik.

**`src/lib/pdf-generator.ts`** *(file baru)*
- Mengimplementasikan helper pembuatan PDF dinamis menggunakan `pdf-lib`, `sharp`, `qrcode`, dan `fontkit`.
- Menggambar QR Code verifikasi langsung ke dalam berkas PDF sertifikat dengan koordinat presisi.
- Mengatur tata letak teks dalam Bahasa Indonesia (Nama Penerima, Nama Program, Deskripsi, Nomor Sertifikat, Tanggal Terbit) dengan pembungkusan teks otomatis (text wrapping) dan font khusus.

**`src/app/api/certificates/route.ts`** *(file baru)*
- Handler POST: Menerbitkan sertifikat baru, menghasilkan hash verifikasi unik, memicu pembuatan file PDF secara fisik di disk server, dan menyimpan record ke database.
- Handler GET: Mengambil daftar semua sertifikat terdaftar beserta relasi jumlah peserta.

**`src/app/api/certificates/[id]/route.ts`** *(file baru)*
- Handler GET: Mengambil detail satu sertifikat lengkap dengan daftar pesertanya.
- Handler PUT: Memperbarui data sertifikat, menghapus file PDF lama di disk, menggambar ulang berkas PDF baru beserta QR Code, dan memperbarui data QR Code terbaru di database.
- Handler DELETE: Menghapus record sertifikat dari database dan menghapus file PDF fisiknya dari penyimpanan disk.

**`src/app/api/certificates/[id]/participants/route.ts`** *(file baru)*
- Handler POST: Menambahkan peserta baru. Dioptimalkan dengan query bulk transaction (`prisma.$transaction`) untuk memasukkan ratusan nama dari file Excel dalam satu request database.
- Handler PUT & DELETE: Memperbarui nama peserta atau menghapusnya dari kepesertaan instansi.

**`src/app/(assessment-center)/assessment-center/admin/dashboard/certificates/page.tsx`**
- Mengembangkan dashboard utama manajemen sertifikat dengan antarmuka premium (tabel responsif, tab filter kategori, bilah pencarian, ringkasan statistik sertifikat).
- Direfaktorisasi secara modular untuk memangkas ukuran kode berkas monolit dari 960+ baris menjadi kurang dari 400 baris menggunakan subkomponen terpisah.
- Mengatur perataan rata kiri (`left-aligned`) pada formulir isian sertifikat tipe Individu agar tampilan visual lebih rapi dan seimbang.

**`src/components/certificate/dashboard/`** *(direktori baru)*
- **`BulkUploadCard.tsx`**: Komponen seret-dan-lepas berkas Excel (.xlsx, .xls) atau CSV untuk mengekstrak kolom nama secara otomatis.
- **`ParticipantListCard.tsx`**: Komponen visualisasi daftar nama peserta sementara sebelum diterbitkan, lengkap dengan input manual dan tombol hapus.
- **`CertificateTable.tsx`**: Komponen tabel data sertifikat, fungsi filter, dan tombol aksi (Edit, Preview, Kelola, Unduh, Hapus).
- **`CertificateForm.tsx`**: Komponen formulir isian utama data sertifikat, dilengkapi validasi otomatis penghapusan enter/baris baru pada textarea deskripsi.

**`src/components/certificate/ParticipantManager.tsx`** *(file baru)*
- Modal interaktif kelola peserta instansi pasca-penerbitan. Mendukung penambahan manual, pengeditan langsung nama peserta, penghapusan, serta impor massal Excel susulan dengan satu kali pemanggilan API batch POST yang efisien.

**`src/app/(assessment-center)/assessment-center/admin/dashboard/certificates/[id]/preview/page.tsx`** *(file baru)*
- Halaman pratinjau sertifikat premium dengan tata letak dua kolom:
  - Sisi Kiri: Informasi detail sertifikat (nomor, penerima, program, tanggal terbit) dan kode QR verifikasi.
  - Sisi Kanan: PDF viewer interaktif dengan lebar penuh yang memuat berkas asli sertifikat.

**`src/app/(verify)/verify/[id]/page.tsx`** *(file baru)*
- Halaman verifikasi publik yang menampilkan keabsahan sertifikat secara real-time dari database. Menyediakan fitur pencarian peserta kolektif berkecepatan tinggi bagi publik untuk memverifikasi nama mereka di bawah sertifikat instansi terkait.

**`src/components/certificate/ParticipantsSearch.tsx`** *(file baru)*
- Komponen input pencarian interaktif untuk melacak status verifikasi kepesertaan kolektif pada halaman verifikasi publik.
