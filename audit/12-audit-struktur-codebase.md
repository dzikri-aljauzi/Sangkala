# 12 - Audit Struktur Codebase (2026-08-13)

Audit dua putaran, scope ketat cuma dua hal — bukan bug fungsional, bukan UX, bukan keputusan bisnis:

- **Clean structure** — *di mana* kode hidup: apakah fitur yang secara konsep bersaudara ada di parent/route yang sama, apakah ada satu tempat konsisten buat satu jenis logic.
- **Clean code** — *bagaimana* kode ditulis di lokasi yang sudah benar: bebas duplikasi, tidak ada file raksasa, pola konsisten buat masalah yang sama.

Putaran 1: `src/app/` (routing) + `src/components/`/`src/lib/`. Putaran 2: `src/app/api/*`, config root, `src/context/`, `src/types/`, `prisma/schema.prisma`.

Trigger awal: "Kelola Pelatihan" (`/admin/pelatihan`) dan "Kelola Sertifikat" (`/assessment-center/admin/dashboard/certificates`) tampil setara di hub admin tapi hidup di cabang routing yang beda total → item #1.

**Status (2026-08-14)**: Batch 1 selesai — item #1, #2, #3, #4, #6, #7, #8, #9, #10 (parsial, `Training` saja) dikerjakan, masing-masing sebagai commit terpisah di branch `refactor/codebase-structure-audit`. Detail lengkap: [`changelog-2026-08-14-audit-struktur-batch1-dzikri.md`](../changelog/changelog-2026-08-14-audit-struktur-batch1-dzikri.md). Item #5 (`AdminDashboard.tsx`) sengaja ditunda jadi task terpisah; item 🟡/⚪ (termasuk #11) belum disentuh.

---

## 🔴 Berisiko — duplikasi/drift nyata atau file monolitik

### Routing & Auth (structure)

1. ✅ **SELESAI** — **"Kelola Pelatihan" dan "Kelola Sertifikat" hidup di cabang routing yang beda total**, padahal tampil setara sebagai dua menu sejajar di hub admin. `/admin/pelatihan` di `src/app/admin/`, `/assessment-center/admin/dashboard/certificates` nested jauh di `src/app/(assessment-center)/assessment-center/admin/dashboard/`. Akar penyebab item #3, #4, dan #11. **Item pemicu audit ini.** *Dikonsolidasi ke satu pohon `/admin/*` (commit `e203dbb`).*

2. ✅ **SELESAI** — **Tidak ada `middleware.ts` di seluruh project.** Semua proteksi halaman admin dilakukan client-side (`useSession()` + `useEffect`) di tiap halaman — tidak ada layer terpusat yang bisa "memiliki" logic ini sekali. *`src/middleware.ts` ditambahkan (commit `6ea5e9d`).*

3. ✅ **SELESAI** — **Header + auth-guard admin ke-duplikasi (~35-45 baris) di ≥5 file halaman**, pola ini **sudah menyebar ke branch `feat/pembayaran-pelatihan` yang belum di-merge** (`admin/pelatihan/pengaturan-pembayaran/page.tsx` mengulang persis). File: `admin/pelatihan/page.tsx`, `admin/pelatihan/[id]/page.tsx`, `admin/manage/page.tsx` (headernya beda lagi), `assessment-center/admin/dashboard/page.tsx`, `assessment-center/admin/dashboard/certificates/page.tsx`. Tidak ada `layout.tsx` di `src/app/admin/` buat nampung ini. *Diganti shared `src/app/admin/(protected)/layout.tsx` + middleware (commit `6ea5e9d`); guard duplikat di tiap halaman dihapus.*

4. ✅ **SELESAI** — **`src/lib/auth.ts` hardcode `pages.signIn` ke `/assessment-center/admin-login`** — padahal ini config NextAuth global dipakai semua area, termasuk `/admin/pelatihan` dan `/admin/manage` yang konsepnya tidak ada hubungan dengan "assessment center". *Diupdate ke `/admin/login` sebagai bagian dari item #1 (commit `e203dbb`).*

### Components (code)

5. **`src/components/dashboards/AdminDashboard.tsx` — 3126 baris, 14 komponen/fungsi top-level, 6+ entitas bisnis tidak berhubungan** (users, assessments, documents/resumes, resume batch, progress, echelon), masing-masing punya CRUD + modal state sendiri (3 `showCreateModal` terpisah di baris 583, 2369, 2880).

6. ✅ **SELESAI** — **`ProgressView` ke-duplikasi persis (~270 baris, beda 2 komentar doang)** antara `KlienDashboard.tsx:249` dan `StaffKlienDashboard.tsx:277`. *Diekstrak ke `src/components/shared/ProgressView.tsx` (commit `b201ea1`).*

### API & Data Layer (code) — putaran 2

7. ✅ **SELESAI** (20/26 file) — **Pengecekan auth admin (`getServerSession` + cek `role === "ADMIN"`) di-copy-paste verbatim di 27 dari 28 file route API (39 occurrence total)**, tidak ada shared helper (mis. `requireAdmin()`). Ini versi API dari masalah yang sama seperti item #3, tapi cakupannya jauh lebih luas. *`requireAdmin()` ditambahkan di `src/lib/api-auth.ts`, diterapkan ke 20 file berpola "gerbang admin buat seluruh endpoint" (commit `69aa0cf`). 6 file sisanya sengaja tidak disentuh — polanya beda (cek role di tengah handler, bukan gerbang endpoint).*

8. ✅ **SELESAI** — **`src/app/api/upload/training/route.ts` dan `src/app/api/upload/article/route.ts` adalah file duplikat 100%** (61 baris, beda cuma di string literal folder tujuan) — duplikasi paling literal di seluruh codebase, lebih parah dari kasus `getImageUrl` di frontend. *Logic bersama diekstrak ke `src/lib/upload-image.ts` (commit `69aa0cf`); kedua route tetap terpisah, URL tidak berubah.*

9. ✅ **SELESAI** — **`src/app/api/files/[...path]` dan `src/app/api/public/images/[...path]` masing-masing reimplement sendiri logic path-traversal-check + content-type map yang sama** — dan **sudah drift** (map content-type-nya sudah tidak identik satu sama lain). Ini bukan cuma duplikasi, tapi drift di logic keamanan (path traversal) — risikonya nyata kalau satu diperbaiki dan yang lain lupa. *Utility bersama diekstrak ke `src/lib/file-serving.ts` (commit `c073798`); kedua route sengaja tetap terpisah — beda security model (authenticated-download-bebas vs public-allowlisted-inline), tidak digabung.*

10. 🔶 **PARSIAL** — **Tidak ada shared domain types** — `src/types/` cuma isi module augmentation NextAuth. Interface `Training` didefinisikan ulang beda-beda di 4 file, interface `Assessment` didefinisikan ulang beda-beda di 4+ file dashboard — bukan cuma duplikasi, tapi **definisi yang sudah tidak identik satu sama lain** (field yang ada di satu tempat belum tentu ada di tempat lain). *`Training`/`TrainingWithCount` diekstrak ke `src/types/training.ts` (commit `d2bf323`). `Assessment` sengaja ditunda — 2 dari 7 file bakal ikut ditulis ulang pas item #5 (`AdminDashboard.tsx`) dipecah, lebih aman disatuin di situ.*

---

## 🟡 Bikin bingung, belum ganggu fungsi

11. **Pola yang sama persis dengan item #1, terjadi lagi di `insights` vs `news-article`** — dua route tree terpisah, sama-sama fetch model `Article` yang sama, beda filter kategori, diadmin-kan dari satu halaman yang sama (`/admin/manage`).

12. **Hardcoded route strings di 15-20+ tempat**, tidak ada `src/lib/routes.ts`.

13. **11 modal `fixed inset-0 bg-black/*` hand-rolled belum migrasi ke `Dialog` shadcn** — `AdminDashboard.tsx` (7×), `KlienDashboard.tsx`, `AsesorDashboard.tsx`, `ParticipantManager.tsx`, `admin/manage/page.tsx`.

14. **`getImageUrl` di-duplikasi di 9 file, `formatDate` di 4+ file** — tidak ada `src/lib/formatters.ts`, padahal `src/lib/training-filters.ts` sudah jadi contoh baik.

15. **Token styling vs warna literal**: 8 file pakai semantic token, 49 file masih literal — termasuk 2 primitive baru hasil refactor shadcn (`button.tsx`, `card.tsx`) yang belum ikut token.

16. **`(assessment-center)/layout.tsx` nge-branch chrome (Navbar/Footer) pakai `pathname.includes("/dashboard")`** (runtime string match) — rapuh, route baru yang kebetulan mengandung substring itu bisa diam-diam kehilangan Navbar/Footer.

17. **3 pola berbeda buat "upload file + bikin record DB"**: generic `upload/route.ts` (switch-case per tipe), inline di `attendance/route.ts`, dan dedicated per-fitur (`upload/training`, `upload/article`) — tiga pendekatan buat masalah yang konsepnya sama.

18. **Error-response shape API sedikit drift**: mayoritas konsisten `{error: string}`, tapi ada yang nambahin field `details` sendiri, dan penggunaan status 401 vs 403 tidak selalu konsisten buat kasus yang mirip (unauthenticated vs unauthorized).

19. **`next.config.ts` rewrites buat `/uploads/logos/*` dan `/uploads/certificates/*` adalah dead code** (Next.js sudah serve file `public/` langsung sebelum rewrite array-form ini sempat kepakai) — dan bahkan kalau aktif pun, ini beda pendekatan dari cara upload lain (articles, trainings) yang justru di-routing lewat `/api/public/images` dari sisi frontend.

20. **`Certificate.createdById` tidak punya `@@index`**, padahal semua foreign key sejenis lain di schema ini punya — inkonsistensi penerapan pola, bukan cuma soal performa.

---

## ⚪ Kosmetik

21. Route segment `/admin/manage` namanya generic, tidak mencerminkan isi (CRUD artikel/insights).
22. Dead code tanpa import: `src/components/ui/world-map.tsx` (174 baris) + `animated.tsx` (210 baris).
23. Naming nyaris tabrakan: `src/components/shared/ResumeFolderViews.tsx` vs fungsi internal `ResumeFolderView` di `KlienDashboard.tsx:710`.
24. `3d-globe.tsx`/`world-map.tsx` nyasar di folder `ui/` — visual dekoratif sekali-pakai, bukan primitive reusable.
25. `User.uploadedDocs` (relasi ke `Documentation`) melanggar pola penamaan `uploaded<NamaPluralModel>` yang dipakai relasi lain di model yang sama (`uploadedDocuments`, `uploadedResumes`, `uploadedAttendances`).

---

## Di luar scope (dicatat, bukan bagian audit clean code/structure ini)

Ditemukan pas audit, tapi bukan soal *di mana* atau *bagaimana* kode ditulis — jangan digabung ke ticket structure/code cleanup, catat terpisah:

- **Bug**: tujuan redirect unauthorized tidak konsisten — `/admin/*` lempar diam-diam ke `/` (homepage), `/assessment-center/admin/*` lempar ke layar login proper. Ini behavioral bug, dipicu oleh item #3 di atas tapi bug-nya sendiri perlu ticket bug terpisah.
- **UX/discoverability**: `/admin/manage` tidak terhubung dari hub admin, cuma reachable lewat link tersembunyi di sidebar dashboard klien.
- **Keputusan bisnis** (bukan cacat): 2 halaman sertifikat hardcode di luar pola `verify/[id]` (`bpd-bali-diy-risiko-bisnis-2026`, `bpd-diy-syariah-2026`) — kemungkinan sengaja buat turnaround cepat klien spesifik.
- Campuran penamaan Indonesia/Inggris di route segment — sudah dikonfirmasi konsisten sebagai konvensi (Indonesia = istilah bisnis, Inggris = scaffolding teknis), bukan masalah nyata.

---

## Catatan untuk eksekusi besok

- **#1 adalah akar dari #3, #4, dan #11** — benerin duluan otomatis nyicil tiga temuan lain.
- **#7, #8, #9, #10** (lapisan API/data) severity-nya setara atau lebih tinggi dari temuan putaran 1 — terutama #9 (drift logic keamanan) dan #10 (definisi tipe yang sudah tidak identik, bukan cuma duplikat). Ini kandidat kuat masuk prioritas tinggi juga, bukan cuma "putaran 2 tambahan".
- **#5** (`AdminDashboard.tsx`) paling besar effort-nya, sebaiknya task tersendiri.
- Item 🟡/⚪ disapu bareng pas lagi di area yang sama.
- Belum ada keputusan final soal target struktur (`/admin/*` vs `(assessment-center)`) — didiskusikan dulu sebelum mulai pindah file.
