# 11 - shadcn MCP untuk Development Frontend

Panduan ini untuk siapa pun yang collab di project ini dan mau pakai **shadcn MCP** buat nambah/ubah komponen UI. Project ini sudah pernah di-init dengan shadcn (lihat `components.json`), jadi bukan mulai dari nol — ada beberapa aturan main yang WAJIB diikuti supaya komponen baru tidak merusak desain LNA yang sudah ada.

Baca ini SEBELUM `npx shadcn add <komponen>` atau minta AI nambahin komponen shadcn.

---

## 1. Apa itu shadcn MCP

shadcn MCP adalah MCP server yang bisa dipanggil AI coding assistant (Claude Code, Cursor, dll) untuk:
- Cari komponen di registry shadcn (`search_items_in_registries`)
- Lihat isi/dependency komponen sebelum di-add (`view_items_in_registries`)
- Generate command CLI yang tepat (`get_add_command_for_items`)
- Ambil contoh penggunaan (`get_item_examples_from_registries`)

MCP-nya sudah dikonfigurasi di `.mcp.json` (root project, sudah di-commit). Kalau tool kamu (Claude Code / editor lain) support MCP, tinggal approve project MCP server itu waktu ditanya — tidak perlu setup manual.

---

## 2. Status project ini

- `components.json` **sudah ada** — jangan jalanin `npx shadcn init` lagi kecuali memang mau reset total (dan itu HARUS didiskusikan dulu, karena bisa nimpa banyak hal, lihat §4).
- Base library: **Radix** (`"style": "radix-nova"` di `components.json`). Semua komponen yang sudah ke-add (`dialog`, `input`, `textarea`, `label`, `table`, `badge`, `toggle-group`, `toggle`, `sonner`) pakai Radix primitives, import dari package `radix-ui`.
- Alias: `@/components/ui` untuk komponen, `@/lib/utils` untuk `cn()`.

---

## 3. ATURAN WAJIB (baca dulu sebelum nambah komponen)

### 3.1 JANGAN timpa `Button` dan `Card` custom

`src/components/ui/button.tsx` dan `src/components/ui/card.tsx` itu **bukan** hasil generate shadcn biasa — dua-duanya sudah di-retheme manual pakai gradient/warna LNA (variant `primary`, `secondary`, `outline`, `ghost`, `gold` untuk Button). **Jangan pernah** jalanin:

```bash
npx shadcn add button   # ❌ JANGAN
npx shadcn add card     # ❌ JANGAN
```

Kalau ada komponen shadcn lain yang butuh `Button` sebagai dependency (misalnya `dialog` butuh Button buat tombol close), CLI-nya akan nanya:

```
? The file button.tsx already exists. Would you like to overwrite? (y/N)
```

**Selalu jawab `n` / `N`.** Kalau kamu jalanin command lewat script/non-interaktif dan CLI-nya hang di prompt ini, jawab otomatis dengan:

```bash
yes n | npx shadcn add <komponen-yang-mau-ditambah>
```

Kalau ternyata komponen baru itu butuh sesuatu dari Button yang belum didukung Button custom kita (contoh nyata: `dialog.tsx` generate-annya pakai `<Button variant="ghost" size="icon-sm">` padahal Button kita cuma punya size `sm|md|lg|xl`), **jangan** nambahin size baru ke Button shared secara sembarangan. Lihat contoh fix di `src/components/ui/dialog.tsx` — tombol close-nya sengaja diganti jadi `<DialogPrimitive.Close>` native yang di-style manual (`text-slate-400 hover:bg-slate-100 hover:text-slate-600`), bukan pakai Button shared. Ini supaya Button component tetap konsisten dipakai di seluruh app tanpa nambah API permukaan cuma buat satu use-case.

### 3.2 Token warna sudah dipetakan ke LNA — jangan terima default shadcn mentah

`src/app/globals.css` punya token brand LNA sendiri (`--primary-blue`, `--accent-gold`, dst) yang sudah dipetakan ke token semantik shadcn:

| Token shadcn | Dipetakan ke |
|---|---|
| `--primary` | `var(--primary-blue)` (#2563eb) |
| `--secondary`, `--muted` | `var(--background-secondary)` (#f8fafc) |
| `--muted-foreground` | `var(--foreground-muted)` (#64748b) |
| `--border`, `--input` | `#e2e8f0` (slate-200, sama kayak yang dipakai di seluruh app) |
| `--ring` | `var(--primary-blue-light)` (#3b82f6, biar sama kayak focus ring input yang lama) |
| `--radius` | `0.5rem` |

Kalau nambah komponen baru dan warnanya kelihatan abu-abu generic / biru berbeda dari biru LNA yang biasa dipakai — itu tandanya komponennya belum kena token yang sudah dipetakan, atau ada override warna hardcode di file komponennya yang perlu disesuaikan.

**Jangan** ubah `--accent` jadi biru solid meskipun buat satu komponen kelihatan lebih match. `--accent` dipakai bareng oleh SEMUA state hover/selected komponen shadcn (dropdown, toggle "on", dll) — kalau dipaksa biru solid, komponen lain yang belum ada sekarang bakal ketemu masalah yang sama nanti. Kalau butuh state "selected" berwarna solid biru buat satu komponen spesifik (contoh: pill filter tanggal di halaman admin pelatihan), override lewat `className` per-komponen pakai `data-[state=on]:bg-blue-600 data-[state=on]:text-white`, bukan lewat token global.

### 3.3 Situs ini light-only

Tidak ada dark mode / theme toggle di project ini. `globals.css` punya baris `@custom-variant dark (&:is(.dark *));` yang **harus tetap ada** (itu yang bikin utility `dark:` di komponen shadcn generate jadi tidak aktif otomatis ikut OS), tapi blok `.dark { ... }` variable override-nya sengaja dihapus. Kalau `npx shadcn add` nambahin blok `.dark` baru di masa depan, hapus lagi blok variable-nya (baris `@custom-variant dark` jangan ikut dihapus).

---

## 4. Workflow nambah komponen baru

1. **Cek dulu apakah sudah ada.** Lihat isi `src/components/ui/` — kalau sudah ada `input.tsx`, `dialog.tsx`, dst, tinggal pakai, tidak perlu add lagi.
2. **Cari & lihat komponennya dulu sebelum add**, biar tahu dependency-nya apa (lewat MCP tool `search_items_in_registries` / `view_items_in_registries`, atau `npx shadcn view @shadcn/<nama>`).
3. **Add satu-satu atau sekaligus** yang memang mau dipakai:
   ```bash
   npx shadcn@latest add <komponen1> <komponen2> ...
   ```
   Kalau muncul prompt overwrite `button.tsx` → jawab **n** (lihat §3.1).
4. **WAJIB cek `git status` / `git diff` setelah add.** CLI shadcn di project ini (v4.16.2) pernah diam-diam ubah file yang tidak diminta (`button.tsx`, `layout.tsx` nambah font Geist, `utils.ts`). Kalau ada file yang berubah padahal tidak related sama komponen yang di-add, `git checkout -- <file>` buat revert, baru lanjut.
5. **Cek warnanya** — buka komponennya, pastikan class yang dipakai adalah token semantik (`bg-primary`, `text-muted-foreground`, `border-input`, dst), bukan warna hardcode baru yang belum ada di §3.2. Kalau style-nya jelek/beda karena token belum pas, itu lebih baik diperbaiki di `globals.css` (nambah/ubah pemetaan token) daripada nge-hack className di tiap tempat pakai.
6. **Test di halaman yang pakai** — `npm run build` buat mastiin tidak ada type error, terus cek manual di browser.

---

## 5. Gotcha CLI yang sudah ketemu (shadcn CLI v4.16.2)

CLI shadcn versi ini beda dari versi lama (yang dulu nanya "style" + "base color" kayak slate/zinc/gray). Sekarang:

- **`-d` / `--defaults`** resolve ke `--preset=base-nova`, dan preset ini **bisa milih Base UI, bukan Radix**, meskipun kelihatannya cuma soal "warna". **Jangan pernah init pakai `-d` doang.** Kalau butuh init ulang (jarang terjadi, harus didiskusikan dulu sama tim), pakai:
  ```bash
  npx shadcn@latest init --base radix --template next --yes --force
  ```
- **`--yes` tidak skip semua prompt.** Waktu init, CLI tetap nanya pilihan preset secara interaktif kalau `--preset` tidak dikasih eksplisit. Kalau kepepet run non-interaktif (misalnya lewat AI agent/script), pakai `--preset nova` biar tidak hang — tapi tetap cek `components.json` setelahnya buat mastiin `"style"` mengandung `"radix-"`, bukan base UI.
- **Prompt overwrite file existing** (§3.1) juga tidak ke-skip sama `--yes`. Harus dijawab manual atau di-pipe `yes n |`.

Kalau nemu gotcha baru, tambahin di sini biar tim lain tidak ketemu masalah yang sama.

---

## 6. Referensi

- Dokumentasi resmi: https://ui.shadcn.com
- Contoh implementasi nyata di project ini: `src/app/admin/pelatihan/page.tsx` dan `src/app/admin/pelatihan/[id]/page.tsx` — dua halaman ini full pakai `Dialog`, `Input`, `Textarea`, `Label`, `Table`, `Badge`, `ToggleGroup`, dan `sonner` (toast), sambil tetap pakai `Button` custom yang lama. Bisa dijadikan contoh pola integrasi shadcn + design system LNA.
- Konvensi frontend umum project ini: [08-frontend.md](./08-frontend.md)
