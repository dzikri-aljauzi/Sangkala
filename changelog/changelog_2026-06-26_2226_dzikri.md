# Changelog

## [Unreleased] — 2026-06-26

PIC: Dzikri

### Fix: Admin Login Flow

Sebelumnya admin tidak memiliki halaman landing yang tepat setelah login, dan beberapa bug
di auth flow menyebabkan login gagal atau redirect ke halaman yang salah.

**`src/lib/auth.ts`**
- Fix: `pages.signIn` diubah dari `/assessment-center/login` (path tidak ada) ke
  `/assessment-center/admin-login` — mencegah NextAuth redirect ke 404 ketika session expired

**`src/app/(assessment-center)/assessment-center/admin-login/page.tsx`**
- Fix: Tambah `loginRole: "ADMIN"` ke payload `signIn()` — tanpa ini validasi role di `auth.ts`
  dilewati sehingga non-admin bisa masuk
- Fix: Redirect setelah login diubah dari `/assessment-center` ke
  `/assessment-center/admin/dashboard`
- Fix: Hapus pemanggilan `signIn("signout")` yang salah (seharusnya `signOut`)
- Fix: Hapus teks default credentials yang tampil di halaman login

**`src/app/(assessment-center)/assessment-center/[id]/login/page.tsx`**
- Fix: Hapus tab "Admin" dari halaman login assessment-specific — admin sekarang login
  eksklusif melalui `/assessment-center/admin-login`
- Ubah type `LoginRole`: `"ADMIN" | "ASESOR" | "KLIEN" | "STAFF_KLIEN"` →
  `"ASESOR" | "KLIEN" | "STAFF_KLIEN"`
- Ubah grid dari `grid-cols-4` ke `grid-cols-3`
- Hapus import `Shield` yang tidak terpakai

**`src/app/(assessment-center)/assessment-center/admin/dashboard/page.tsx`** _(file baru)_
- Buat halaman global admin hub di route statis `/assessment-center/admin/dashboard`
- Menampilkan semua assessment sekaligus dengan stats (jumlah user, dokumen, resume, foto)
- Auth guard: redirect ke admin-login jika bukan ADMIN
- Tiap assessment card mengarah ke `/assessment-center/{id}/dashboard`

**`prisma/seed.ts`**
- Fix: Admin upsert `update: {}` diubah ke `update: { password, role, isActive }` — memastikan
  password selalu tersinkron saat re-seed, mencegah login 401 untuk admin2 dan admin3

---

### Fix: Hero Section UI Overflow (Windows 125% Display Scaling)

Pada laptop dengan Windows Display Scaling 125% (1366×768 fisik → ~1092×614px efektif),
konten hero terlihat terpotong di atas karena `flex items-center` menempatkan konten di
tengah viewport sehingga bagian atas tersembunyi di balik navbar.

**`src/components/sections/Hero.tsx`**
- Fix: `lg:pt-0 lg:pb-0` diubah ke `lg:pt-28 lg:pb-8` — padding top mendorong anchor konten
  ke bawah navbar sehingga seluruh hero section terlihat di semua ukuran layar
