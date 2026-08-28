# Pembaruan Arsitektur Super Admin, Audit Log Grid View, Manajemen Pengguna, dan Proteksi Akses

**Tanggal**: 2026-08-28  
**PIC**: Arie  
**Branch**: `feat/super-admin-audit-log`  

---

## Ringkasan

Pembaruan ini mencakup perancangan arsitektur otorisasi multi-level (Super Admin vs Sub Admin), modul audit log aktivitas menyeluruh dengan tampilan Grid View dan Tab per Sub Admin, modul manajemen pengguna yang terintegrasi dengan proyek assessment, pembatasan hak akses pengaturan rekening pembayaran, serta penambahan fitur toggle password visibility (ikon mata) pada seluruh form login.

---

## Fitur dan Perubahan yang Telah Dikembangkan

### 1. Arsitektur Otorisasi Role (Super Admin & Sub Admin)
- **Role `SUPER_ADMIN`**: Memiliki hak akses penuh atas seluruh modul sistem:
  - Mengelola semua akun pengguna (`/admin/users`).
  - Melihat dan melacak seluruh riwayat perubahan sistem di Audit Log (`/admin/audit-log`).
  - Mengubah informasi rekening bank untuk pembayaran pelatihan (`/admin/pelatihan/pengaturan-pembayaran`).
  - Mengedit, menghapus, atau mengubah status seluruh data pelatihan, terlepas dari siapa pembuatnya.
- **Role `ADMIN` (Sub Admin)**:
  - Dibatasi hanya dapat mengelola data pelatihan yang dibuat oleh akunnya sendiri (`createdById === session.user.id`).
  - Tidak memiliki akses ke menu Manajemen Pengguna, Log Aktivitas Global, dan Pengaturan Rekening.
  - Review bukti transfer pendaftaran pelatihan tetap dapat dilakukan pada pelatihan miliknya.

### 2. Modul Audit Log Terpusat (`/admin/audit-log`)
- **Database & Relasi**: Model `AuditLog` mencatat `entityType`, `entityId`, `action` (`CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`, `PASSWORD_RESET`, `LOGIN`), `summary`, snapshot data JSON `changes` (nilai sebelum vs sesudah), `userId`, dan `createdAt`.
- **Tab 1 ("Semua Log")**:
  - **Grid View**: Kartu interaktif berdesain modern dengan badge aksi berwarna, identitas Sub Admin pelaksana, target entitas, dan ringkasan perubahan.
  - **Filter Komprehensif**: Pencarian teks, filter dropdown jenis aksi, filter dropdown akun Sub Admin, serta filter rentang tanggal.
  - **Pagination**: Kontrol navigasi halaman yang responsif dan dinamis.
  - **Modal Diff Snapshot**: Dialog visual yang membandingkan field lama (*before*) dan field baru (*after*) secara jelas.
- **Tab 2 ("Log per Sub Admin")**:
  - Kartu profil Sub Admin yang menampilkan total pelatihan dibuat, total log aktivitas, dan waktu aktivitas terakhir.
  - Tombol filter cepat untuk langsung melihat seluruh log milik Sub Admin terpilih di Tab 1.

### 3. Riwayat Perubahan & Isolasi pada Detail Pelatihan (`/admin/pelatihan/[id]`)
- Menampilkan informasi pembuat pelatihan (*Dibuat oleh: Nama Sub Admin*).
- **Tab Switcher**: Memisahkan antarmuka menjadi tab **"Data Pendaftar"** dan tab **"Riwayat Perubahan"** (audit log spesifik untuk pelatihan tersebut).
- Tombol aksi Edit, Hapus, dan Ubah Status hanya aktif jika login sebagai pembuat pelatihan atau Super Admin.

### 4. Manajemen Pengguna & Filter Asosiasi Assessment (`/admin/users`)
- **Filter Proyek Assessment**: Dropdown dinamis untuk memfilter pengguna berdasarkan proyek assessment (*Semua Assessment*, *Tanpa Assessment/Global Admin*, atau proyek assessment tertentu).
- **Kolom Asosiasi Assessment**: Menampilkan badge dan tautan langsung ke dashboard assessment terkait bagi user dengan role `ASESOR`, `KLIEN`, atau `STAFF_KLIEN`.
- **Modal Tambah & Edit Pengguna**: Form lengkap untuk memilih role sistem serta menetapkan proyek assessment terkait.
- **Modal Reset Password**: Fitur bagi Super Admin untuk mereset password akun pengguna secara instan dengan pencatatan otomatis ke Audit Log.

### 5. Proteksi dan Penyembunyian Menu Pengaturan Rekening
- Tombol **"Pengaturan Rekening"** di `/admin/pelatihan` disembunyikan sepenuhnya dari tampilan Sub Admin.
- Middleware server `src/middleware.ts` memproteksi rute `/admin/pelatihan/pengaturan-pembayaran` khusus `SUPER_ADMIN`. Jika diakses paksa melalui URL, pengguna otomatis dialihkan kembali ke `/admin/pelatihan`.

### 6. Ikon Mata (Toggle Password Visibility)
- Menambahkan tombol interaktif `Eye` / `EyeOff` pada field input password:
  - Halaman Login Admin (`/admin/login`).
  - Halaman Login Assessment Center (`/assessment-center/[id]/login`).
  - Modal Tambah Pengguna dan Reset Password (`/admin/users`).

### 7. Perbaikan Desain & Tipografi
- Menstandarkan font keluarga form controls (`input`, `select`, `button`, `textarea`, `option`) mewarisi font `Inter`.
- Mengganti elemen native HTML `<select>` menjadi komponen Shadcn UI (Radix UI) `Select` untuk konsistensi visual di seluruh modul.

---

## File yang Berubah

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/migrations/20260827143355_add_audit_log_model/migration.sql`
- `src/lib/audit.ts`
- `src/lib/api-auth.ts`
- `src/config/workspace.ts`
- `src/middleware.ts`
- `src/app/globals.css`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/CommandPalette.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/admin/(protected)/layout.tsx`
- `src/app/admin/(protected)/audit-log/page.tsx`
- `src/app/admin/(protected)/users/page.tsx`
- `src/app/admin/(protected)/pelatihan/page.tsx`
- `src/app/admin/(protected)/pelatihan/[id]/page.tsx`
- `src/app/admin/pelatihan/pengaturan-pembayaran/page.tsx`
- `src/app/(assessment-center)/assessment-center/[id]/login/page.tsx`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/audit-logs/route.ts`
- `src/app/api/audit-logs/users-summary/route.ts`
- `src/app/api/trainings/route.ts`
- `src/app/api/trainings/[id]/route.ts`
- `src/app/api/trainings/[id]/audit-logs/route.ts`
- `src/app/api/payment-settings/route.ts`

---

## Panduan Migrasi Database di Production

Pembaruan ini menambahkan tabel baru `audit_logs` dan relasi audit pada model `User`. Ikuti urutan langkah deployment berikut di server production:

### Langkah-Langkah Deployment

```bash
# 1. Backup database SQLite production terlebih dahulu
# example: npx prisma backup --output backups/prod-2026-08-29.db
cp prisma/prod.db backups/prod-$(date +%Y%m%d).db

# 2. Tarik kode terbaru dari repository
git pull origin main

# 3. Pasang dependency
npm install

# 4. Jalankan migrasi Prisma ke database production
npx prisma migrate deploy

# 5. Regenerate Prisma Client (WAJIB dijalankan agar definisi model baru terbaca)
npx prisma generate

# 6. Jalankan build aplikasi
npm run build

# 7. Restart service aplikasi di production
pm2 restart lna-app
```

---

## Panduan Mengubah / Menjadikan `admin@lna.com` sebagai Super Admin di Production

Setelah proses migrasi dan build selesai di server production, akun `admin@lna.com` harus dipastikan memiliki role `SUPER_ADMIN`. Pilih salah satu dari metode berikut:

### Opsi 1: Menjalankan Prisma Seed (Direkomendasikan)
File `prisma/seed.ts` telah dikonfigurasi menggunakan method `upsert` yang secara otomatis memperbarui role `admin@lna.com` menjadi `SUPER_ADMIN` tanpa menghapus data lain:
```bash
npx prisma db seed
```

### Opsi 2: Eksekusi Query SQL Langsung (Cepat)
Jika server production menggunakan database SQLite (misal `prisma/prod.db` atau path file database production yang digunakan pada `.env` `DATABASE_URL`):
```bash
sqlite3 prisma/prod.db "UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@lna.com';"
```
Untuk memverifikasi perubahan role:
```bash
sqlite3 prisma/prod.db "SELECT id, email, name, role FROM users WHERE email = 'admin@lna.com';"
```

---

## Verifikasi Pasca Deployment

1. Login ke `/admin/login` menggunakan akun `admin@lna.com`:
   - Pastikan menu **Kelola Pengguna** (`/admin/users`) dan **Log Aktivitas** (`/admin/audit-log`) muncul di sidebar.
   - Buka `/admin/pelatihan`, pastikan tombol **Pengaturan Rekening** terlihat dan form dapat disimpan.
2. Login menggunakan akun Sub Admin (contoh: `ferry.hermansyah@lna.com`):
   - Pastikan menu Super Admin tidak muncul di sidebar.
   - Pastikan tombol Pengaturan Rekening tidak terlihat.
   - Buka `/admin/pelatihan/[id]` dan pastikan tab Riwayat Perubahan bekerja dengan baik.
