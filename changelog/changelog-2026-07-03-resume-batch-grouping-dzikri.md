# Resume Batch Grouping & Upload Redesign

**Tanggal**: 2026-07-03
**PIC**: Dzikri

---

## Ringkasan
Resume yang diunggah admin kini dikelompokkan dalam **batch** sebagai unit bisnis (1 gelombang hasil assessment). Dashboard klien dan admin menampilkan resume dengan navigasi bertingkat: **Kategori → Batch → File**.

---

## Apa yang Berubah

### 1. Model Batch Baru
- Entitas `ResumeBatch` ditambahkan di database (`prisma/schema.prisma`).
- Relasi `Resume → ResumeBatch` untuk mengaitkan setiap file resume ke satu batch upload.
- Resume lama yang belum memiliki batch otomatis masuk ke `Batch Lama` saat diakses.

### 2. Upload Resume (Admin)
- Admin wajib memilih batch sebelum mengunggah resume.
  - Bisa **pilih batch yang sudah ada** atau **buat batch baru langsung dari modal upload**.
- Upload kini mendukung **banyak file sekaligus** dengan drag-and-drop.
- Daftar file terpilih ditampilkan dengan nama file, ukuran (KB/MB), dan tombol hapus per file.
- UI modal di-redesign: kategori pakai ring highlight, batch input inline, dropzone file.

### 3. Dashboard Klien
- Resume ditampilkan dalam navigasi bertingkat:
  - `Hasil Keseluruhan` → pilih batch → `Umum` / `Per Eselon` → file
  - `Hasil Per Individu` → pilih batch → list kandidat
- **Search** kandidat di dalam batch (filter by nama).
- **Pagination** 12 file per halaman.

### 4. Dashboard Admin
- Tampilan resume admin kini memiliki struktur navigasi yang **sama dengan klien**:
  - Folder utama → sub-kategori → batch → file
- **Bulk delete** resume dengan checkbox select all & hapus terpilih.
- **Search + Pagination** untuk Hasil Per Individu.

### 5. Shared Components
- `FoldersView` dan `BatchListView` diekstrak ke shared component (`src/components/shared/ResumeFolderViews.tsx`) agar dipakai bersama oleh dashboard klien dan admin.

### 6. API
- `POST /api/resume-batches` — buat batch baru.
- `GET /api/assessments/:id` — response kini menyertakan `resumeBatches` dan `resume.resumeBatch`.
- `POST /api/upload` — mendukung multi-file upload dengan field `files[]` dan `resumeBatchId`.

---

## Dampak
- **Flow bisnis**: Admin mengatur upload per gelombang (batch), klien melihat hasil per batch.
- **Kompatibilitas**: Data resume yang sudah ada sebelum fitur ini tetap muncul di `Batch Lama` tanpa perlu migrasi manual.
- **Breaking changes**: Tidak ada. Field `resumeBatchId` pada tabel `resumes` bersifat opsional (nullable).
