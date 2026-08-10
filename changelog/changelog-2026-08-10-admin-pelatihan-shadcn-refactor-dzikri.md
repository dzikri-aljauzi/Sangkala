# Refactor UI Admin Pelatihan ke shadcn/ui

**Tanggal**: 2026-08-10
**PIC**: Dzikri

---

## Ringkasan
Lanjutan dari `changelog-2026-08-10-info-pelatihan-admin-dzikri.md` (Bagian B, yang sengaja menunda adopsi shadcn penuh). Sesi ini menyelesaikan `shadcn init` + menambahkan komponen shadcn, lalu merefactor dua halaman admin (`/admin/pelatihan` dan `/admin/pelatihan/[id]`) supaya modal, form, tabel, dan notifikasi error pakai komponen shadcn/Radix — bukan markup hand-rolled — sambil mempertahankan identitas visual LNA (gradient navy/blue/cyan/gold, komponen `Button`/`Card` custom yang sudah ada).

---

## Apa yang Berubah

### 1. Init shadcn + mapping token ke palet LNA
- `components.json` dibuat, base library dipin eksplisit ke **Radix** (`npx shadcn init --base radix ...`) — CLI versi ini (`shadcn@4.16.2`) berisiko salah pilih Base UI kalau pakai flag default `-d`.
- `src/app/globals.css`: token semantik shadcn (`--primary`, `--secondary`, `--muted`, `--border`, `--ring`, `--radius`, dst) dipetakan ke token brand LNA yang sudah ada (`--primary-blue`, `--background-secondary`, dll), bukan dibiarkan pakai default abu-abu oklch. `--radius` diset `0.5rem`; modal (`Dialog`) di-override manual jadi `rounded-2xl` per pemakaian karena tidak bisa direpresentasikan lewat satu token radius saja.
- Situs ini light-only (tidak ada dark mode toggle) — blok variabel `.dark { ... }` dihapus, tapi baris `@custom-variant dark (&:is(.dark *));` dipertahankan supaya utility `dark:` bawaan komponen shadcn tidak ikut aktif otomatis dari preferensi OS.

### 2. Komponen shadcn baru (`src/components/ui/`)
`dialog`, `input`, `textarea`, `label`, `table`, `badge`, `toggle-group` (+ dependency `toggle`), `sonner` (toast).
- `dialog.tsx` dikustom: tombol close bawaan generate-nya memakai `Button` shared dengan `size="icon-sm"` yang tidak ada di `Button` custom project — diganti jadi elemen `<DialogPrimitive.Close>` native yang di-style manual (`text-slate-400 hover:bg-slate-100 hover:text-slate-600`), supaya tidak perlu menambah API baru ke `Button` yang dipakai luas di seluruh app.
- `sonner.tsx` disederhanakan: dependency `next-themes` dilepas (di-uninstall), toast di-hardcode `theme="light"` karena tidak ada sistem dark mode di project ini.
- `Button` dan `Card` custom (`src/components/ui/button.tsx`, `card.tsx`) **sengaja tidak disentuh** — `shadcn init`/`add` sempat 2x menimpa file di luar scope (button.tsx, layout.tsx nambah font Geist, utils.ts) secara diam-diam; semua di-revert ke versi semula.

### 3. Refactor `/admin/pelatihan`
- Modal "Tambah Pelatihan" → `Dialog`/`DialogContent`/`DialogHeader`/`DialogFooter`.
- Field form (judul, tempat, tanggal, harga, deskripsi) → `Input`/`Textarea`/`Label`. Input file gambar tetap native (tidak dibungkus `Input` shadcn, biar styling file-picker tidak berubah).
- Filter pill "Semua/Minggu Ini/Bulan Ini/Tahun Ini" → `ToggleGroup`/`ToggleGroupItem`, dengan sentinel value `"semua"` untuk menghindari bug re-klik Radix (klik ulang item aktif normalnya deselect/`onValueChange("")`, yang akan bentrok dengan makna `""` = "Semua" di state `dateFilter` yang sudah ada).
- Semua `alert(...)` diganti `toast.error(...)` dari `sonner`.
- Tombol-tombol pakai komponen `Button` yang sudah ada di project (sebelumnya hand-rolled `<button>` dengan class Tailwind panjang berulang).

### 4. Refactor `/admin/pelatihan/[id]`
- Modal Edit → pola `Dialog` yang sama seperti create modal.
- Badge status "Nonaktif" → `Badge`.
- Tabel data pendaftar → `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` (1:1 kolom & isi, tidak ada perubahan data).
- Tombol Aktifkan/Nonaktifkan & Edit → `Button`.
- Semua `alert(...)` (upload gagal, simpan gagal, toggle status gagal) diganti `toast.error(...)`.

### 5. Toaster
- `<Toaster />` (dari `@/components/ui/sonner`) dipasang sekali di `src/app/layout.tsx`, jadi notifikasi toast bisa dipakai dari halaman mana pun tanpa provider tambahan per halaman.

### 6. Dokumentasi tim
- `docs/11-shadcn-mcp.md` — panduan pakai shadcn MCP untuk collab: aturan wajib (jangan timpa Button/Card, jangan ubah `--accent` jadi solid), peta token, workflow nambah komponen, dan gotcha CLI v4.16.2 yang ditemukan di sesi ini.
- `docs/README.md` — ditambahkan entri ke-11 di daftar isi.

---

## Keputusan yang Diambil
- **Base library Radix, bukan Base UI** — dipin eksplisit karena default CLI (`-d`) berisiko salah pilih.
- **`--accent` tidak dipetakan ke biru solid** meskipun secara visual lebih match untuk pill filter — token ini dipakai bersama oleh semua state hover/selected komponen shadcn lain di masa depan (dropdown, dll), jadi state "selected" solid biru untuk `ToggleGroupItem` di-override lewat `className` per-komponen (`data-[state=on]:bg-blue-600`), bukan lewat token global.
- **Tidak menambah size baru ke `Button` shared** hanya untuk kebutuhan tombol close Dialog — dianggap lebih baik dialog punya tombol close native ketimbang memperluas API `Button` yang dipakai di banyak tempat lain.
- **Scope dibatasi ke 2 halaman ini saja** — pola modal `fixed inset-0 bg-black/50` yang sama juga ada di `AdminDashboard.tsx` (7×), `ParticipantManager.tsx`, dan `admin/manage/page.tsx`, tapi sengaja tidak ikut direfactor sesi ini (dicatat sebagai kandidat follow-up di `docs/11-shadcn-mcp.md`).

---

## Verifikasi
- `npx eslint` khusus file yang diubah — 0 error (ada 1 warning pre-existing tidak terkait perubahan ini).
- `npm run build` — sukses; `/admin/pelatihan` berhasil di-prerender statis, `/admin/pelatihan/[id]` sebagai route dinamis, tidak ada type error.
- Smoke test dev server: `GET /admin/pelatihan` dan `GET /admin/pelatihan/[id]` sama-sama 200, tidak ada error di log server.
- **Belum ada QA visual otomatis** (klik toggle, buka/tutup Dialog, warna fokus ring) — tidak ada tool browser automation di environment pengerjaan ini. Perlu dicek manual di browser sebelum merge.

---

## Dampak
- **Breaking changes**: tidak ada — perubahan murni UI di 2 halaman admin, tidak menyentuh API/schema/fitur publik `/info-pelatihan` (Bagian A).
- **Dependency baru**: `radix-ui`, `sonner`, `tw-animate-css` (ditambahkan); `next-themes` sempat ditambahkan otomatis lalu dilepas lagi (tidak dipakai).
- **Untuk kolaborator lain yang mau pakai shadcn MCP**: wajib baca `docs/11-shadcn-mcp.md` dulu sebelum `npx shadcn add` apa pun di project ini.
