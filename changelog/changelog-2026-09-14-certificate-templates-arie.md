# Pemilihan Template Sertifikat (Template 1 & Template 2)

**Tanggal**: 2026-09-14  
**PIC**: Arie  
**Branch**: `feat/certificate-templates`  

---

## Ringkasan

Halaman generate sertifikat sebelumnya hanya bisa menghasilkan satu desain paten (hardcoded di `pdf-generator.ts`). Pembaruan ini menambahkan pilihan template saat membuat/mengedit sertifikat: **Template 1** (desain lama, tidak diubah sama sekali) dan **Template 2** (desain baru navy-gold, QR di pojok kiri bawah, dua kolom tanda tangan). Pilihan template tersimpan di database, dan template baru berikutnya bisa ditambah tanpa migrasi database lagi.

---

## Fitur dan Perubahan yang Telah Dikembangkan

### 1. Registry Template (`src/lib/certificates/registry.ts`, baru)
- `TEMPLATE_REGISTRY`: satu sumber kebenaran daftar template (`id`, `label`, file background, thumbnail preview, posisi QR, daftar field khusus).
- `template-1` tanpa field tambahan; `template-2` punya 1 field wajib `signerRightName` (default `''`, tanpa nama bawaan).
- Helper `getTemplate()`, `parseTemplateData()`, `validateTemplateData()` dipakai bersama oleh API dan form.
- Template baru (misal template-3) cukup tambah 1 entry + 1 file layout — form admin me-render inputnya otomatis dari `fields`.

### 2. Layout Template 2 (`src/lib/certificates/templates/template-2.ts`, baru)
- Background full-bleed `public/certificate-assets/templates/template-2/bg-template-2.jpg` (dipindah dari `template-2.jpg` di root).
- Nama penerima shrink-to-fit + garis bawah memakai garis bawaan background (tidak digambar manual).
- Judul program gold uppercase, deskripsi wrap dengan `maxWidth` agar tidak melebar ke tepi (600/640).
- Tanda tangan 2 kolom di bawah garis background: kiri hardcode Ferry Hermansyah (`Pengajar`), kanan inputable (`Direktur`). Koordinat garis diukur dari piksel JPG asli (skala 0.75), didokumentasikan sebagai komentar di `LAYOUT`.
- QR pojok kiri bawah (`x: 37, y: 28.5, size: 55`), tidak menabrak garis tanda tangan maupun border emas.

### 3. Dispatcher (`src/lib/pdf-generator.ts`)
- `generateCertificatePdf(data, opts?: { templateId, signerRightName })`: `template-2` dialihkan ke layout baru, selain itu jalur lama berjalan persis seperti sebelumnya (Template 1 zero-risk).
- Template-2 tanpa `signerRightName` ditolak dengan error jelas.

### 4. Database (`prisma/schema.prisma` + migrasi `20260914000000_add_certificate_template`)
- Kolom baru di `Certificate`: `template` (default `"template-1"`, sertifikat lama otomatis ikut default) dan `templateData` (JSON text untuk field khusus per-template, mis. `{"signerRightName": "..."}`).
- Sengaja tidak pakai kolom per-input maupun tabel baru: 1x migrasi ini cukup untuk semua template masa depan.

### 5. API (`src/app/api/certificates/route.ts`, `src/app/api/certificates/[id]/route.ts`)
- POST/PUT terima `template` + `templateData`, validasi field wajib per-template via registry, teruskan ke generator, simpan ke DB.
- PUT default ke template warisan sertifikat lama agar PDF lama tidak berubah diam-diam saat edit data lain.

### 6. UI Admin
- `TemplatePicker.tsx` (baru): kartu radio 2 template dengan thumbnail preview + input dinamis dari registry (input nama kanan hanya muncul untuk Template 2).
- `sertifikat/page.tsx`: state `templateId`/`templateFields`, preload saat edit, validasi sebelum submit, reset ke `template-1` tiap form baru.
- `CertificateTable.tsx`: badge Template 1/2 di kolom kode (sementara, menunggu keputusan tampilan final).
- Preview `[id]/preview/page.tsx`: badge template + baris penandatangan kanan bila ada.

### 7. Bulk Peserta (tidak berubah, terverifikasi)
- Upload Excel peserta (INSTANSI) bekerja identik di kedua template: nama peserta disimpan ke `certificate_participants` dan tampil di halaman verifikasi + Participant Manager. Kedua generator PDF memang tidak merender daftar peserta.

---

## File yang Berubah

- `prisma/schema.prisma`
- `prisma/migrations/20260914000000_add_certificate_template/migration.sql`
- `public/certificate-assets/templates/template-2/bg-template-2.jpg` (pindahan dari root `template-2.jpg`)
- `src/lib/certificates/registry.ts` (baru)
- `src/lib/certificates/templates/template-2.ts` (baru)
- `src/lib/pdf-generator.ts`
- `src/app/api/certificates/route.ts`
- `src/app/api/certificates/[id]/route.ts`
- `src/components/certificate/dashboard/TemplatePicker.tsx` (baru)
- `src/components/certificate/dashboard/CertificateTable.tsx`
- `src/app/admin/(protected)/sertifikat/page.tsx`
- `src/app/admin/(protected)/sertifikat/[id]/preview/page.tsx`

---

## Panduan Migrasi Database di Production

```bash
# 1. Backup database SQLite production terlebih dahulu
cp prisma/prod.db backups/prod-$(date +%Y%m%d).db

# 2. Tarik kode terbaru dari repository
git pull origin main

# 3. Pasang dependency
npm install

# 4. Jalankan migrasi Prisma ke database production
npx prisma migrate deploy

# 5. Regenerate Prisma Client
npx prisma generate

# 6. Jalankan build aplikasi
npm run build

# 7. Restart service aplikasi di production
pm2 restart lna-app
```

Catatan: migrasi ini hanya `ADD COLUMN` dengan default — sertifikat lama otomatis `template-1`, tidak perlu regenerate massal.

---

## Verifikasi

1. `npx tsc --noEmit` bersih untuk `src/` (error yang sempat muncul hanya artefak stale `.next`, sembuh dengan hapus folder `.next` lalu build ulang).
2. `eslint` file terkait: 0 error (warning yang ada pre-existing).
3. Uji generate via script: template-1 ±133KB, template-2 ±107KB, keduanya valid; template-2 tanpa nama kanan ditolak dengan pesan yang benar.
4. `npm run build` sukses, 45 halaman statis, route certificates lengkap.
5. Manual di browser: buat 1 sertifikat Template 1 (hasil identik dengan lama), 1 sertifikat Template 2 (QR kiri bawah tembus ke `/verify/[hash]`), edit 1 sertifikat untuk ganti template + ganti nama kanan.
