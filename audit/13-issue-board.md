# 13 - Issue Board

Papan kerja informal buat lanjutan audit struktur codebase + bug yang ketemu di jalan. Bukan pengganti `audit/12-audit-struktur-codebase.md` (itu tetap sumber kebenaran detail tiap temuan) — file ini cuma nge-track **apa yang lagi dikerjakan** dan **apa yang masih antre**, plus item baru yang belum tercatat di audit awal.

Update file ini tiap kali mulai/selesai satu task, bukan cuma di akhir sesi.

---

## Sedang dikerjakan

_Kosong — belum ada task yang di-pick up setelah Batch 1 selesai (lihat `changelog/changelog-2026-08-14-audit-struktur-batch1-dzikri.md`)._

---

## Antrean

### 🔴 Bug fungsional (di luar scope audit clean code/structure)

- [ ] **Generate sertifikat PDF gagal — "SOI not found in JPEG"**
  Root cause: `src/lib/pdf-generator.ts:165` minta `sharp` compress background template jadi **progressive JPEG** (`.jpeg({ quality: 80, progressive: true })`), tapi `pdf-lib` (`embedJpg`) cuma dukung baseline JPEG — parsernya gagal baca progressive JPEG dan lempar error yang membingungkan (kelihatan kayak file corrupt, padahal bukan). Kemungkinan flaky, tergantung kompleksitas gambar template.
  Fix: hapus `progressive: true` dari opsi `.jpeg()`.
  Bukan disebabkan Batch 1 — dikonfirmasi `pdf-generator.ts` tidak tersentuh di commit manapun sesi refactor ini; commit `69aa0cf` cuma ganti boilerplate auth-check di `api/certificates/route.ts`, tidak menyentuh pemanggilan `generateCertificatePdf()`.

### 🟠 UX / discoverability (di luar scope audit, dicatat di sana sebagai "di luar scope")

- [ ] **`/admin/manage` (Kelola Insights) tidak ada tombol akses dari hub `/admin`**
  Satu-satunya jalan masuk sekarang: login admin → buka dashboard klien apa saja → sidebar → "Kelola Insights" (`src/components/layout/DashboardSidebar.tsx:370`). "Kelola Pelatihan" dan "Kelola Sertifikat" sudah punya tombol langsung di hub, "Kelola Insights" belum.
- [ ] **Redirect unauthorized tidak konsisten** — `/admin/*` (sebelum Batch 1) lempar diam-diam ke homepage, `/assessment-center/admin/*` lempar ke layar login proper. Perlu dicek ulang apakah masih relevan setelah middleware baru (kemungkinan sudah otomatis konsisten sekarang — middleware selalu redirect ke `/admin/login`), tapi belum diverifikasi manual.

### 🟡 Clean structure/code — belum dikerjakan (audit `audit/12-audit-struktur-codebase.md`)

- [ ] #5 — Pecah `AdminDashboard.tsx` (3126 baris, 14 komponen/fungsi top-level, 6+ entitas bisnis tak berhubungan). **Sengaja ditunda dari Batch 1** — effort besar, risiko regresi tinggi di fitur live.
- [ ] #10 (sisa) — Shared type `Assessment` (7 file, variasi lebih besar dari `Training`). Rencana: dikerjakan bareng pas #5 dipecah.
- [ ] #11 — Pola sama seperti #1 (sebelum diperbaiki): `insights` vs `news-article`, dua route tree terpisah buat model `Article` yang sama.
- [ ] #12 — Hardcoded route strings di 15-20+ tempat, belum ada `src/lib/routes.ts`.
- [ ] #13 — 11 modal hand-rolled (`fixed inset-0 bg-black/*`) belum migrasi ke `Dialog` shadcn.
- [ ] #14 — `getImageUrl` di-duplikasi di 9 file, `formatDate` di 4+ file — belum ada `src/lib/formatters.ts`.
- [ ] #15 — Token styling vs warna literal: 8 file pakai semantic token, 49 file masih literal.
- [ ] #16 — `(assessment-center)/layout.tsx` nge-branch chrome pakai `pathname.includes("/dashboard")` (runtime string match, rapuh).
- [ ] #17 — 3 pola berbeda buat "upload file + bikin record DB" (generic switch-case, inline, dedicated per-fitur).
- [ ] #18 — Error-response shape API sedikit drift (`{error}` vs nambah `details`, status 401 vs 403 tidak selalu konsisten).
- [ ] #19 — `next.config.ts` rewrites buat `/uploads/logos/*` dan `/uploads/certificates/*` adalah dead code.
- [ ] #20 — `Certificate.createdById` tidak punya `@@index`, beda dari pola FK lain di schema yang sama.

### ⚪ Kosmetik (audit `audit/12-audit-struktur-codebase.md`)

- [ ] #21 — Route segment `/admin/manage` namanya generic, tidak mencerminkan isi (CRUD artikel/insights).
- [ ] #22 — Dead code tanpa import: `src/components/ui/world-map.tsx` (174 baris) + `animated.tsx` (210 baris).
- [ ] #23 — Naming nyaris tabrakan: `ResumeFolderViews.tsx` vs fungsi internal `ResumeFolderView` di `KlienDashboard.tsx:710`.
- [ ] #24 — `3d-globe.tsx`/`world-map.tsx` nyasar di folder `ui/` — visual dekoratif sekali-pakai.
- [ ] #25 — `User.uploadedDocs` melanggar pola penamaan relasi lain di model yang sama.

---

## Selesai

- ✅ **Batch 1** (2026-08-14) — item #1, #2, #3, #4, #6, #7, #8, #9, #10 (parsial, `Training` saja). Detail: `changelog/changelog-2026-08-14-audit-struktur-batch1-dzikri.md`, status per-item di `audit/12-audit-struktur-codebase.md`.

---

## Cara pakai file ini

- Pindahkan task dari **Antrean** ke **Sedang dikerjakan** begitu mulai dikerjakan (satu task pada satu waktu, sesuai alur kerja sesi ini).
- Centang `[x]` dan pindahkan ke **Selesai** begitu commit-nya masuk — sertakan hash commit atau link changelog.
- Item baru yang ketemu di jalan (bug, temuan tambahan) masuk ke **Antrean** dengan severity yang sesuai, bukan langsung dikerjakan tanpa dicatat dulu.
