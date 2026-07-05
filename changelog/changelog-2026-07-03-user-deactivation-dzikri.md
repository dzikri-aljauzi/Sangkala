# User Deactivation Flow

**Tanggal**: 2026-07-03
**PIC**: Dzikri

---

## Ringkasan

Menonaktifkan user sebagai alternatif aman dari penghapusan permanen, untuk mencegah kehilangan data assessment yang terhubung via relasi cascade.

---

## Latar Belakang

Penghapusan akun di admin panel menggunakan `prisma.user.delete()` yang menghapus user beserta seluruh data terkait (dokumen, resume, presensi, sesi) karena skema database menggunakan `onDelete: Cascade`. Solusi yang dipilih tim: optimalkan fitur nonaktif user sebagai pengganti delete permanen.

---

## Apa yang Berubah

### 1. Daftar User — Toggle Aktif
- Kolom **Status** kini menampilkan badge `Aktif` (hijau) / `Nonaktif` (merah), bukan tombol toggle.
- Tombol aksi **Nonaktifkan** / **Aktifkan** ditambahkan sebagai aksi utama di setiap baris user.

### 2. Modal Edit User — Status Akses
- Ditambahkan section **Status Akses** di modal edit user.
- Admin bisa mengubah status aktif/nonaktif dari modal edit.
- State `isActive` dikirim bersama update user ke `PUT /api/users/[id]`.

### 3. Hapus Permanen — Warning Diperkeras
- Konfirmasi delete kini menjelaskan risiko: data assessment yang diunggah user dapat ikut terhapus karena relasi cascade.
- Tombol delete dibuat kurang dominan secara visual (`text-slate-300`) dibanding aksi Nonaktifkan.

### 4. Login Diblokir untuk User Nonaktif
- Sudah ada sebelumnya di `src/lib/auth.ts:44`: user dengan `isActive = false` akan gagal login.

---

## File yang Berubah

| File | Perubahan |
|---|---|
| `src/components/dashboards/AdminDashboard.tsx` | Badge status, tombol Nonaktifkan/Aktifkan, section Status Akses di modal edit, warning delete |
| `.opencode/context.md` | Dokumentasi konteks proyek |
| `.gitignore` | Update aturan ignore |

---

## Dampak

- **Flow bisnis**: Admin menonaktifkan peserta yang tidak lagi aktif, data assessment tetap utuh.
- **Keamanan**: User nonaktif tidak bisa login.
- **Breaking changes**: Tidak ada. Hard delete masih tersedia dengan konfirmasi lebih ketat.
