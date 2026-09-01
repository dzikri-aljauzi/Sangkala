---
target: super admin + audit log + user management feature (Arie)
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-28T15-20-14Z
slug: src-app-admin-protected-users-page-tsx
---
Method: dual-agent (A: a2ee797dedfcadf74 · B: a94655e6da897c70a)

## Design Health Score

| # | Heuristic | Skor | Temuan Kunci |
|---|-----------|------|---------------|
| 1 | Visibility of System Status | 3 | Toast muncul di tiap aksi, solid — tapi password reset kecatat sebagai aksi `UPDATE` generic di audit trail, nggak bisa dibedain dari "edit nama" |
| 2 | Match Between System and Real World | 3 | Vocab konsisten sesuai domain, tapi `CommandPalette.tsx:181` janji search "pengguna" yang nggak pernah diimplementasi |
| 3 | User Control and Freedom | 3 | Cancel/Esc jalan di semua Dialog; modal Reset Password nggak ada field konfirmasi ulang — typo nggak ketauan sampai user beneran gagal login |
| 4 | Consistency and Standards | 2 | Semua list page lain di area admin ini (Users sendiri, `reminder-sertifikat`, `sertifikat`) pakai `Table`; tab utama Audit Log malah card grid buat data yang justru paling tabular & kronologis |
| 5 | Error Prevention | 2 | Delete/Deactivate benar-benar guard diri sendiri; **field role di Edit User nggak** — Super Admin bisa ganti role sendiri tanpa friksi sama sekali |
| 6 | Recognition Rather Than Recall | 3 | Filter aktif direcap sebagai pill; makna role/action selalu berlabel teks, nggak pernah color-only |
| 7 | Flexibility and Efficiency of Use | 1 | Nggak ada bulk action sama sekali; bandingin aktivitas 2 sub admin harus keluar total dari tab perbandingan |
| 8 | Aesthetic and Minimalist Design | 3 | Spacing bersih secara umum; filter bar + baris pill filter-aktif di Audit Log bikin layout shift tiap filter disentuh |
| 9 | Error Recovery | 2 | Pesan error server muncul di toast, tapi nggak ada highlight ke field yang bermasalah |
| 10 | Help and Documentation | 1 | Nggak ada penjelasan batas ADMIN vs SUPER_ADMIN selain satu badge read-only; dipelajari lewat coba-coba |
| **Total** | | **23/40** | **Acceptable — perlu perbaikan nyata sebelum diperluas ke lebih banyak admin** |

## Verdict Design Specificity

**Lolos checklist anti-slop, dan dua assessment sampai ke kesimpulan yang sama secara independen.** Detector nemuin 9 finding `border-accent-on-rounded` di 8 file — baik scan deterministik maupun pembacaan manual sama-sama verifikasi kesembilannya false positive: idiom loading-spinner standar (`rounded-full` + `border-b-2` satu sisi + `animate-spin`), salah terbaca sebagai aksen kartu dekoratif. Zero temuan slop asli: nggak ada card grid icon+heading+text yang reflexive, nggak ada hero-metric template tanpa data yang beneran butuh itu, nggak ada kicker, nggak ada gradient text baru (header gradient di halaman login itu pola lama yang udah ada di tempat lain codebase, bukan baru), nggak ada border-accent warna yang gantiin konten, nggak ada sparkline/progress-ring sebagai dekorasi, nggak ada emoji-sebagai-icon (konsisten `lucide-react` di semua tempat).

Fitur ini genuinely berangkat dari masalah nyata — banyak Sub Admin bikin pelatihan masing-masing, Super Admin butuh akuntabilitas. Bukti: thread atribusi pembuat konsisten muncul di 3 permukaan (footer kartu list, header detail, badge eksplisit "Mode Hanya Lihat (Dibuat oleh Sub Admin lain)" yang *menjelaskan* kenapa aksi nggak tersedia, bukan cuma nyembunyiin tombol diam-diam); modal diff nampilin nilai before/after beneran berlabel, bukan toast "berubah" generic; copy tetap spesifik-domain terus ("Sub Admin", "Riwayat Perubahan"), nggak ada sisa vocab template. Soft flag: kartu ringkasan Sub Admin di Audit Log (avatar + badge role + 2 stat tile + 1 tombol) kebaca kayak bentuk "kartu profil SaaS" yang di-assemble — datanya asli jadi bukan slop, tapi ini satu-satunya titik yang berasa componentized ketimbang purpose-built.

**Titik beda dua assessment ini soal framing, bukan fakta**: Assessment A bilang codebase-nya "konsisten" soal bahasa visual dalam terma Nielsen #4 (Dialog/Table/primitive yang dipakai bareng); hitungan mentah Assessment B nunjukin ke-6 file level-halaman di fitur ini **100% pakai class warna Tailwind hardcode, 0% semantic token** (105-136 hit hardcode per file), sementara shell yang sama-sama disentuh PR ini (`AppShell.tsx`, `CommandPalette.tsx`) hampir semuanya udah pakai token (`bg-primary`, `text-ink-muted`, `bg-paper`). Dua-duanya bener: bahasa *pola* (Dialog, Table, Badge, Select) konsisten; layer *token*-nya enggak, dan fitur ini nggak majuin maupun mundurin migrasi token yang emang udah lama setengah jalan itu.

## Kesan Keseluruhan

Ini fitur akuntabilitas yang genuinely purpose-built, bukan RBAC template yang di-reskin — kerjaan atribusi pembuat & modal diff nunjukin ada yang beneran mikirin workflow-nya. Tapi 2 janji di changelog-nya sendiri (aksi audit `PASSWORD_RESET` dan `LOGIN` yang terpisah) nggak ada di kode yang jadi, dan halaman yang paling butuh scannability (Audit Log, data list kronologis) justru satu-satunya yang ninggalin konvensi table area admin ini. Risiko paling tajam: semua aksi destruktif lain di fitur ini dapet guard-diri-sendiri atau konfirmasi eksplisit — ganti role diri sendiri nggak dapet dua-duanya, di environment production yang sekarang cuma punya **satu** akun Super Admin.

## Yang Sudah Bagus

1. **Otorisasi berlapis yang nggak bisa dibypass** — redirect middleware server, cek session client, dan `requireSuperAdmin()` di API layer semuanya independen setuju; Sub Admin nggak bisa nembus data `/admin/users` walau lewat manipulasi URL langsung.
2. **Modal diff nganggep before/after sebagai masalah UI kelas satu** — blok `Sebelumnya`/`Menjadi` berlabel warna DAN teks, nggak pernah color-only.
3. **Badge read-only di training milik orang lain** menjelaskan *kenapa* aksi nggak tersedia, bukan cuma sembunyiin tombol diam-diam — copy yang spesifik dan sadar-workflow, bukan boilerplate "akses ditolak" generic.

## Priority Issues

**[P0] Super Admin bisa diam-diam nurunin role diri sendiri lewat Edit User, zero guard — dan production sekarang cuma punya 1 akun Super Admin.** Tombol/modal Edit di `users/page.tsx` nggak ada cek `isCurrentSelf` di field role, beda dari Delete & Deactivate yang keduanya benar men-disable buat diri sendiri. Dikonfirmasi dua assessment: nggak ada `confirm()`, nggak ada langkah konfirmasi terpisah, submit langsung efektif begitu klik "Simpan Perubahan". Karena `admin@lna.com` satu-satunya `SUPER_ADMIN` di production sekarang, satu salah klik di dropdown itu bisa ngunci seluruh tim dari Users/Audit Log/Payment Settings tanpa jalan balik selain akses database langsung. **Fix**: disable/sembunyiin field Role pas lagi edit diri sendiri, atau wajibkan ketik ulang email buat konfirmasi ganti role sendiri. → `/impeccable harden`

**[P1] Password reset audit-invisible, kontradiksi janji changelog-nya sendiri.** Type `AuditAction` nggak punya `PASSWORD_RESET` (atau `LOGIN`) — reset kecatat sebagai `UPDATE` generic, nggak bisa dibedain di audit trail dari edit nama orang biasa. Pertanyaan persis yang harusnya bisa dijawab audit log — "ada yang reset password si X nggak, kapan" — nggak bisa difilter hari ini. **Fix**: tambah `PASSWORD_RESET` ke union action, set eksplisit di branch reset, kasih badge/filter sendiri. → `/impeccable harden`

**[P1] Audit Log ninggalin konvensi table area admin ini, justru di halaman yang paling butuh itu.** Users, `reminder-sertifikat`, dan `sertifikat` semua pakai `Table` shadcn buat data list; tab utama Audit Log malah render card grid 3-kolom — buat data kronologis yang bentuknya kolom (waktu/pelaku/aksi/entitas), maksa scan zig-zag ketimbang satu kolom yang scannable. Secara struktur, mekanika pagination/filter Audit Log justru udah mirip banget sama halaman referensi (state page/pageSize/totalPages, pola tombol Prev/Next+Chevron yang sama) — cuma container list-nya doang yang beda. **Fix**: convert tab utama jadi `Table` (Waktu / Aksi / Entitas / Pelaku / Ringkasan / Detail); kartu cuma buat tab ringkasan per-Sub-Admin yang emang genuinely berbentuk kartu. → `/impeccable layout`

**[P2] Dua halaman terberat nge-front-load 5-6 input filter sekaligus** sebelum satu baris hasil pun kelihatan. Audit Log: Search + Action + Sub Admin + 2 date picker. Users: Search + dropdown Assessment + 6 pill role. Dua-duanya ngelewatin batas ≤4 working-memory sebelum data sempat dibaca, dan dua-duanya nggak debounce input search atau cancel request yang udah usang — dua hal yang udah dibuktikan jalan di halaman referensi (`reminder-sertifikat`). **Fix**: collapse filter sekunder ke satu popover "Filter"; tambahin pola debounce 300ms + `AbortController` yang sama kayak di halaman referensi. → `/impeccable distill`

**[P2] Zero accessible name di kontrol icon-only yang berulang, zero `aria-live`/`role="status"` di manapun loading state ditampilin.** Dikonfirmasi grep di 8 file: zero `aria-label` di 6 dari 8 file (cuma `AppShell.tsx`/`CommandPalette.tsx` yang punya), tombol icon Edit/Reset/Delete dan keempat toggle password-visibility semuanya cuma andelin `title`. Zero `role="status"`/`aria-live` di kesembilan loading spinner di file-file ini — user screen-reader nggak dapet pemberitahuan apapun kalau halaman lagi loading. **Fix**: tambahin `aria-label` ke tombol icon-only; bungkus loading state dalam region `role="status"` dengan teks `sr-only`. → `/impeccable harden`

**[P2] Command palette janji search yang nggak beneran ada.** Placeholder-nya bilang bisa "Cari assessment, halaman, **pengguna**…" tapi item yang di-index cuma nav section & assessment — data user nggak pernah di-fetch ke situ, padahal PR yang sama ini justru yang bikin seluruh modul Users. Admin yang nyari nama kolega dapet hasil kosong yang keliatan meyakinkan. **Fix**: sambungin `/api/admin/users` ke palette buat session SUPER_ADMIN, atau hapus kata "pengguna" dari placeholder sampai beneran ada. → `/impeccable clarify`

**[P3] Dua halaman login (admin + assessment-center) zero class breakpoint responsive sama sekali di seluruh file** — dikonfirmasi grep, 0 match buat `sm:`/`md:`/`lg:`/`xl:` di dua-duanya, beda dari 6 file lain di scope ini yang semuanya punya 11-13. Kartu `max-w-md` tetap, nggak ada penyesuaian per-breakpoint sama sekali. → `/impeccable adapt`

**[P3] Toggle password-visibility di-copy-paste 4 kali jadi 2 varian yang beda dikit** (halaman login: `p-1`, icon `w-5 h-5`; field password di halaman Users: `p-0.5`, icon `w-4 h-4`), nggak ada komponen shared. Nggak user-facing, tapi perubahan ukuran/behavior berikutnya harus diterapkan manual di 4 tempat. → `/impeccable polish`

## Persona Red Flags

**Alex (Power User)** — lagi audit aktivitas 3 Sub Admin dan beresin 2 akun basi: nggak ada bulk-deactivate, satu klik per akun. Bandingin aktivitas 2 sub admin berarti keluar total dari tab perbandingan — klik "Lihat Riwayat Aktivitas" di satu kartu langsung pindah ke tab log + apply filter, ngerusak tampilan side-by-side yang lagi diliat Alex. Reset password berarti ngetik manual password sementara tiap kali, nggak ada affordance "generate password aman" buat kerjaan rutin mingguan.

**Sam (Accessibility)** — tombol pill filter role di Users nggak ada styling `focus-visible`, padahal `AppShell.tsx` di PR yang SAMA ini udah eksplisit nambahin `focus-visible:outline-2` buat nav link-nya. Label sekunder ukuran 10-11px pakai `text-slate-400` — kemungkinan besar di bawah kontras WCAG AA di ukuran segitu. Yang patut diapresiasi: modal diff-nya udah bener, tiap field merah/hijau juga berlabel teks, nggak color-only.

**Riley (Stress tester, lensa business-criticality)** — langsung nemu gap self-role-demotion (P0 di atas). Hapus Sub Admin yang udah bikin training: dialog konfirmasinya bener-bener warning "tindakan tidak dapat dibatalkan", tapi nggak pernah nyebut kalau training-training itu jadi permanent Super-Admin-only buat diedit (karena cek `createdById === session.user.id` nggak akan pernah match ADMIN manapun lagi) — nggak ada yang bilang itu di dialog delete-nya. Set rentang tanggal Audit Log dengan start-setelah-end (input date polos, nggak ada cross-validation) — dapet pesan "nggak ada hasil" generic yang sama kayak filter kosong lainnya, nggak ada petunjuk kalau rentangnya sendiri kebalik.

## Minor Observations

- Import yang nggak kepakai (`Sparkles`, alias `UserIcon`) di `audit-log/page.tsx` — dead code kecil, worth di-lint.
- Modal diff dan badge read-only-training itu dua bagian paling niat di PR ini — worth dijadiin pola buat bagian lain.
- `ACTION_OPTIONS` nggak punya entry `LOGIN`, konsisten sama fakta login emang belum ditrack sama sekali — dicatat biar nggak kelupaan masukin ke filter kalau nanti ditambahin.
- Label opsi dropdown Assessment nge-concat `"{clientName} — {name}"` — masih oke di skala sekarang, bakal berisik begitu daftar assessment-nya udah lewat satu layar.
- Di 8 file fitur ini sendiri, semua flow destruktif/konfirmasi konsisten pakai komponen `Dialog`, nggak pernah `confirm()` — ini improvement nyata dibanding halaman admin lama di tempat lain codebase (`reminder-sertifikat`, `manage`, `sertifikat`) yang masih campur `confirm()`/`alert()`. Fitur ini justru lebih modern dari halaman-halaman di sekitarnya di sumbu spesifik ini, walau ada gap-gap di atas.

## Questions to Consider

- Changelog janji `PASSWORD_RESET` dan `LOGIN` sebagai aksi audit yang bisa dilacak terpisah, tapi kode yang jadi nggak cover dua-duanya. Kalau Super Admin perlu jawab "ada yang login sebagai X jam 2 pagi nggak", bisa dijawab hari ini — atau audit log ini sekarang cuma cover mutasi data, bukan event akses?
- Semua list page lain di area admin ini pakai Table; Audit Log doang yang card grid. Itu keputusan sadar "kartu lebih enak dibaca ketimbang baris buat entry log", atau "Grid View" cuma kedengeran bagus di spec — dan apa admin yang lagi nyari satu entry di antara lima puluh bakal beneran lebih suka baris?
- Delete user, deactivate user, dan delete training semua dapet dialog eksplisit "tidak bisa dibatalkan". Ganti role diri sendiri nggak dapet apa-apa. Apa yang bikin ganti-role kerasa kurang bahaya dibanding delete, padahal efeknya bisa sama permanennya — malah lebih permanen, karena cuma ada satu akun Super Admin yang bisa ilang?
