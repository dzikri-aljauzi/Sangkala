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

Setelah proses migrasi dan build selesai di server production, akun `admin@lna.com` harus dipastikan memiliki role `SUPER_ADMIN`. Pilih salah satu dari metode berikut.

> ⚠️ **Revisi (2026-08-28, Dzikri) — baca sebelum pilih opsi.** `prisma/seed.ts` meng-hardcode `password: await bcrypt.hash("admin123", 10)` di blok `update` buat **ketiga** akun admin (`admin@lna.com`, `ferry.hermansyah@lna.com`, `jasmine.putri@lna.com`) — bukan cuma role yang ke-update, password-nya ikut ke-reset ke default tiap kali seed dijalankan ulang, siapapun email-nya. Kalau password akun-akun ini **sudah pernah dirotate manual di production** (misal lewat `scripts/rotate-admin-password.ts`, atau Ferry/Jasmine sudah pegang & ganti password mereka sendiri), **Opsi 1 di bawah akan menimpa balik password itu ke `admin123`** — Ferry & Jasmine bisa kekunci dari akun mereka sendiri, dan password admin utama balik ke default yang literal ke-print di console log seed-nya. **Kalau situasinya begitu, langsung pakai Opsi 2 — jangan jalankan `npx prisma db seed` di production.**

### Opsi 1: Menjalankan Prisma Seed (⚠️ HANYA kalau password ketiga akun admin belum pernah dirotate manual)
File `prisma/seed.ts` dikonfigurasi menggunakan method `upsert` yang memperbarui role `admin@lna.com` menjadi `SUPER_ADMIN` — **tapi juga ikut me-reset password ketiga akun admin ke `admin123`**, lihat peringatan di atas sebelum jalanin ini:
```bash
npx prisma db seed
```

### Opsi 2: Eksekusi Query SQL Langsung (✅ Direkomendasikan — aman dipakai kapan pun, termasuk kalau password sudah dirotate)
Update kolom `role` doang, tidak menyentuh password atau kolom lain sama sekali. Jika server production menggunakan database SQLite (misal `prisma/prod.db` atau path file database production yang digunakan pada `.env` `DATABASE_URL`):
```bash
sqlite3 prisma/prod.db "UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@lna.com';"
```
Untuk memverifikasi perubahan role:
```bash
sqlite3 prisma/prod.db "SELECT id, email, name, role FROM users WHERE email = 'admin@lna.com';"
```

**Catatan**: Ferry & Jasmine tidak perlu di-update apapun untuk fitur ini — role mereka memang tetap `ADMIN` (Sub Admin) sesuai desain, bukan perlu di-upgrade ke `SUPER_ADMIN`.

**Follow-up disarankan** (di luar scope deploy ini, tapi dicatat biar tidak terulang): perbaiki `prisma/seed.ts` supaya blok `update` untuk user yang sudah ada tidak ikut menimpa `password` — cukup pastikan `role`/`isActive`-nya, biarkan password yang sudah dirotate tetap dipegang pemiliknya. Selama itu belum dibenahi, `npx prisma db seed` tidak aman dijalankan ulang di production kapan pun ada password yang sudah dirotate manual.

---

## Verifikasi Pasca Deployment

1. Login ke `/admin/login` menggunakan akun `admin@lna.com`:
   - Pastikan menu **Kelola Pengguna** (`/admin/users`) dan **Log Aktivitas** (`/admin/audit-log`) muncul di sidebar.
   - Buka `/admin/pelatihan`, pastikan tombol **Pengaturan Rekening** terlihat dan form dapat disimpan.
2. Login menggunakan akun Sub Admin (contoh: `ferry.hermansyah@lna.com`):
   - Pastikan menu Super Admin tidak muncul di sidebar.
   - Pastikan tombol Pengaturan Rekening tidak terlihat.
   - Buka `/admin/pelatihan/[id]` dan pastikan tab Riwayat Perubahan bekerja dengan baik.
3. **Kalau tadi pakai Opsi 2 (SQL langsung)**: konfirmasi ke Ferry & Jasmine bahwa password mereka masing-masing (yang sudah dirotate) masih bisa dipakai login seperti biasa — harusnya tidak berubah sama sekali, tapi worth dikonfirmasi sekali setelah deploy.

---

## Update (2026-08-28, Dzikri): Perbaikan Sisa Issue dari Laporan Audit

Laporan lengkap temuan `/impeccable critique` + `/impeccable audit` ada di `docs/laporan-super-admin-audit-log.md` (20 issue bernomor). Sebagian besar (termasuk #1 yang paling urgent, #2–#10, #12, #13, #18) sudah dibenerin Arie di commit-commit sebelumnya. Ronde ini nyelesain **7 issue sisa: #11, #14, #15, #16, #17, #19, #20** — masing-masing satu commit terpisah biar gampang di-review/di-revert satu-satu kalau perlu.

1. **#11 — Bulk action** (`8ab9804`): halaman Users sekarang punya checkbox pilih-banyak (select-all + per-baris, akun sendiri dikecualikan dari seleksi) dan bar aksi massal "Aktifkan Terpilih" / "Nonaktifkan Terpilih" dengan dialog konfirmasi. Seleksi otomatis kebersihin tiap ganti halaman/filter.
2. **#14 — Responsive halaman login** (`d228ef6`): dua halaman login (admin + assessment-center) sebelumnya zero breakpoint. Padding, ukuran header/icon, dan spacing form sekarang nyusut di breakpoint `sm:` biar nggak maksa scroll di viewport mobile pendek.
3. **#15 — Komponen toggle password bersama** (`14cd610`): `src/components/ui/password-toggle-button.tsx` baru, narik keluar logic tombol show/hide yang sebelumnya di-copy-paste 4x (2 ukuran beda-beda dikit tanpa alasan) jadi satu komponen dengan prop `size`. Sekalian nambahin `aria-label` yang sebelumnya nggak ada (cuma `title`).
4. **#16 — Audit-log write jadi fire-and-forget** (`e5d3054`): create/update/delete di `/api/admin/users` sebelumnya `await recordAuditLog(...)` sebelum response — padahal fungsi itu udah nangkep error-nya sendiri, jadi nunggu itu selesai cuma nambah latency tanpa manfaat. Sekarang `void recordAuditLog(...)`, aman karena app ini jalan sebagai proses Node/PM2 yang panjang umur, bukan serverless.
5. **#17 — Tombol generate password otomatis** (`7c2a8a0`): field "Password Sementara" (Tambah Pengguna) dan "Password Baru" (Reset Password) sekarang ada tombol "Buat Otomatis" yang ngisi password 12-karakter acak (`crypto.getRandomValues`, exclude karakter yang gampang ketuker kayak 0/O dan 1/l/I) dan langsung nampilinnya biar bisa di-copy.
6. **#19 — Dialog hapus jelasin efek ke training** (`7c804c1`): kalau Sub Admin yang mau dihapus punya training yang dia buat, dialog konfirmasi sekarang nyebut eksplisit jumlah training-nya dan bilang training itu bakal jadi permanent Super-Admin-only buat diedit setelah dihapus.
7. **#20 — Filter bar nggak "loncat" lagi** (`664c941`): baris pill filter-aktif (dan panel filter-lanjutan di atasnya, yang ternyata prop `exit`-nya emang nggak pernah jalan karena kelewat `AnimatePresence`) sekarang dianimasiin height-nya pas muncul/hilang, bukan conditional render polos.

**Temuan di luar scope, dicatat tapi belum digarap**: hook desain Impeccable nemuin 4 finding `gray-on-color` (kontras teks abu-abu di atas background berwarna) di modal perbandingan admin side-by-side (`audit-log/page.tsx`, sekitar baris 975/1024/1045/1094) — itu bagian dari fitur yang Arie tambahin belakangan (`46989dd`), bukan salah satu dari 20 issue di laporan, jadi sengaja nggak disentuh di ronde ini.

**Verifikasi**: `npx tsc --noEmit` dan `eslint` bersih di tiap commit (warning yang muncul semuanya pre-existing, nggak berhubungan sama perubahan di commit itu). `npm run build` (full production build) sukses setelah ketujuh fix digabung — semua route ke-generate normal.
