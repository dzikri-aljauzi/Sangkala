# Guard Brute-Force Login (Rate Limit In-Memory)

**Tanggal**: 2026-09-16  
**PIC**: Arie  
**Branch**: `feat/login-bruteforce-guard`  

---

## Ringkasan

Endpoint login credentials (`POST /api/auth/callback/credentials`) sebelumnya bisa dicoba berulang tanpa batas — tidak ada hitungan gagal, lockout, maupun rate-limit per IP/email. Perubahan ini menambahkan guard in-memory: **5 gagal/10 menit per email, 20 gagal/10 menit per IP, lock 15 menit**. Tanpa dependensi baru, tanpa migrasi database, tanpa sentuh branch lain.

---

## Fitur dan Perubahan yang Telah Dikembangkan

### 1. Guard (`src/lib/login-guard.ts`, baru)
- Dua `Map` in-memory: `byEmail` dan `byIp` (`{ count, firstAt, lockedUntil }`).
- `checkLoginLimit(email, ip)`: return `{ blocked, retryMinutes }`; entry kedaluwarsa otomatis saat window 10 menit lewat.
- `recordLoginFail(email, ip)`: increment; kunci 15 menit saat capai 5 (email) / 20 (IP).
- `resetLoginGuard(email)`: hapus hitungan saat login sukses.
- `getClientIp(headers)`: `x-forwarded-for` (entri pertama) → `x-real-ip` → `"unknown"`.
- Sweep sederhana saat map > 2000 entry (bukan LRU penuh — cukup untuk VPS single-instance ini).
- Map hilang saat restart/redeploy (acceptable, didokumentasikan).

### 2. Hook auth (`src/lib/auth.ts`)
- `authorize(credentials, req)`: ambil IP dari `req.headers` (param kedua NextAuth), cek limit **sebelum** query DB.
- `recordLoginFail` saat user tidak ada maupun password salah (pesan tetap generik `"Email atau password salah"` agar tidak bocor enumerasi user).
- `resetLoginGuard` sebelum `return` sukses.
- Saat ter-block: error `"Terlalu banyak percobaan login. Coba lagi dalam X menit."`
- `route.ts` `[...nextauth]` tidak perlu diubah (NextAuth teruskan `req` otomatis).

### 3. UI Admin (`src/app/admin/login/page.tsx`)
- Error login kini tampilkan `result.error` asli (sebelumnya selalu pesan generik), sehingga pesan lock terlihat user.
- Login assessment-center tidak diubah (sudah tampilkan error server apa adanya).

---

## File yang Berubah

- `src/lib/login-guard.ts` (baru)
- `src/lib/auth.ts`
- `src/app/admin/login/page.tsx`

---

## Yang Sengaja Tidak Dilakukan

- Tanpa kolom `failedLoginAttempts`/`lockedUntil` + tanpa `prisma migrate` (hindari konflik schema dengan `feat/instansi-multi-tenant` yang merombak schema ±186 baris).
- Tanpa library rate-limit (`upstash`/`arcjet`/`rate-limiter-flexible`).
- Tanpa sentuh `middleware.ts`, `api-auth.ts`, branch lain.

---

## Verifikasi

1. Uji logika via `tsx` (script sementara, sudah dihapus): awal lolos → 5x gagal ke-block + `retryMinutes` > 0 → reset lolos lagi → parse `x-forwarded-for` `"2.2.2.2, 3.3.3.3"` jadi `"2.2.2.2"`. Hasil `GUARD-OK`.
2. `npx eslint` file yang diubah: 0 error (2 warning pre-existing di login page).
3. `npx tsc --noEmit`: file yang diubah bersih; error tersisa hanya pre-existing `qrCodeData` di file trainings.
4. Belum: login end-to-end via browser + full `next build` (langkah manual di bawah).

### Uji manual yang disarankan

1. Login salah 6x dengan email yang sama → percobaan ke-6 tampil pesan lock.
2. Login benar saat lock → tetap ditolak.
3. Tunggu 15 menit (atau restart dev server) → login benar sukses lagi.
