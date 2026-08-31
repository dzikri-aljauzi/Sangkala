---
target: reminder-sertifikat admin feature (/admin/reminder-sertifikat)
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-26T14-00-08Z
slug: c-app-admin-protected-reminder-sertifikat-page-tsx
---
Method: dual-agent (A: ac5fb6e3ab3200130 · B: ac579b2709337ecf8)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Toasts + button pending-text cover most actions; `toggleCheckpoint` gives zero pending feedback between click and refetch |
| 2 | Match Between System and Real World | 3 | Domain vocabulary is accurate everywhere except the CTA — "Tambah User" for adding a certification holder is a real terminology mismatch |
| 3 | User Control and Freedom | 3 | Add/Edit/Import all have proper cancel paths (import preview fix helps here); Delete has no undo, only a native `confirm()` |
| 4 | Consistency and Standards | 3 | `renderCheckpointCell` reused identically across all three date columns is a real win; Delete's native `confirm()` still breaks from the shadcn `Dialog` used everywhere else in the same file |
| 5 | Error Prevention | 3 | Import preview-before-commit + missing-header detection is strong; neither the manual form nor the import route validates date *order* (expiry before exam date) |
| 6 | Recognition Rather Than Recall | 3 | Checkpoint actions are full-text buttons, not icon-only; status/level filters are visible selects. Pencil/Trash2 icon buttons still rely on `title` alone |
| 7 | Flexibility and Efficiency of Use | 2 | Bulk import helps, but no row selection, no bulk checkpoint-complete, no sort, no filtered export |
| 8 | Aesthetic and Minimalist Design | 2 | Three stacked UI bands (KPI strip → filters → table) before the actual task; the new KPI strip mostly restates what the Status column/filter already show |
| 9 | Error Recovery | 3 | Per-row import errors with row number + reason are specific and preserve successful rows — genuinely good |
| 10 | Help and Documentation | 2 | No formal help, but inline hints are well-placed and concise for an Operate internal tool |
| **Total** | | **27/40** | **Acceptable (top of band)** — up from 20/40 last run |

## Design Specificity Verdict — jawaban langsung untuk "sudah anti AI slop?"

**Belum sepenuhnya — mixed, dan justru condong ke arah yang salah di ronde perbaikan barusan.** Data layer dan interaksi level-baris genuinely diauthor buat tracking sertifikasi BSMR. Tapi chrome yang baru *ditambahin* di ronde fix P1 barusan justru persis pola template reflexive yang checklist slop tandai.

**Yang lolos (genuinely domain-specific):**
- Pola checkpoint-completion (`renderCheckpointCell`, dipakai identik buat `recert`/`refreshment1`/`refreshment2`) adalah interaksi bespoke asli: tanggal + toggle teks inline ("Tandai Selesai"/"Selesai"), bukan icon-button atau checkbox generic. Ini *adalah* workflow-nya, bukan dekorasi.
- `certification-status.ts` encode aturan bisnis nyata (window reminder 30 hari, checkpoint-completion nyupress status, reminder-dedup saat tanggal berubah pas import) — tidak bisa dipakai ulang tanpa perubahan buat "gym membership expiring."
- Kolom dan field form (ID BSMR, Jenjang, Refreshment Thn 1/2, `COLUMN_MAP` strict di bulk-upload yang persis header spreadsheet BSMR asli) bukan label generic — diambil langsung dari spreadsheet sumber yang digantikan tool ini.
- Import preview-before-commit dengan alasan error per-baris menyelesaikan risiko nyata tool ini (file salah/basi diam-diam menimpa data compliance), bukan pola "are you sure" generic.

**Yang gagal checklist — hit langsung:**
- **[Kartu KPI = hero-metric template yang dipakai reflexive, bukan by design]** — 4 kartu ringkasan status (`page.tsx:386-401`) adalah copy struktural byte-for-byte dari kartu "Total Sertifikat/Instansi/Individu" di `CertificateTable.tsx:73-102` — sampai ke `w-12 h-12 {color}-50 {color}-600 rounded-xl` icon-box dan pasangan label/angka `text-sm font-medium text-slate-500` / `text-2xl font-bold text-slate-900`. Tidak ada file yang import komponen `<StatCard>` bersama — keduanya hand-write bentuk yang sama secara independen. Itu tanda-nya: ini bukan reuse design-system yang disengaja (yang akan berupa import `Button`/`Input`/`Table`), tapi dua instance dari template yang sama diambil secara reflexive. Brief-nya tidak pernah minta KPI strip; yang diminta cuma "status jadi lebih menonjol," dan hitungan status itu didandani jadi dashboard metric karena itu bentuk default, bukan karena datanya butuh itu.
- **Bobot visual identik regardless urgency** — keempat kartu punya bobot visual sama persis. "Aktif" (tidak ada yang perlu dikerjakan) duduk di kiri dengan ukuran/style sama kayak "Kadaluarsa" (kegagalan compliance, paling urgent). Summary strip buat tool triase harusnya kelihatan beda buat "aman" vs "perlu tindakan sekarang" — ini tidak, persis seperti yang diharapkan dari template yang diterapkan by rote, bukan keputusan desain yang berangkat dari apa yang admin benar-benar perlu lihat duluan.
- **Copy generic-scaffold bocor** — CTA utama masih "Tambah User" (`page.tsx:373-383`, judul modal di 519) buat bikin *pemegang sertifikasi*, bukan "User" dalam pengertian akun apapun yang dipakai di tempat lain fitur ini. Tidak ada elemen lain di halaman ini yang nyebut record-nya "Users" — type-nya `CertificationHolder`, tabelnya manggil by name/ID BSMR/instansi. "Tambah User" adalah sisa generic-CRUD, dan ini bukti paling gampang dikutip bahwa sebagian UI ini belum fully diauthor ulang buat domainnya sendiri.

**Checklist item yang bersih:** tidak ada kicker/eyebrow label, tidak ada gradient text, tidak ada border-left/right berwarna >1px (badge pakai solid fill, box error-import pakai border penuh `border-red-200`, bukan aksen kiri), tidak ada sparkline/progress ring, tidak ada emoji-sebagai-icon (konsisten `lucide-react` di semua tempat). Tapi keempat icon kartu baru (`CheckCircle2`/`Clock`/`AlertTriangle`/`XCircle`) juga icon status generic paling default — bukan iconografi spesifik sertifikasi (misal badge/shield-check).

**Kesimpulan:** tabel dan workflow yang dibungkusnya tidak bisa di-relabel jadi gym membership tanpa nulis ulang status logic dan semua kolom — bagian itu nyata. Tapi *summary header*-nya bisa di-relabel "Total Members / Expiring Soon / Expired" tanpa perubahan struktural sama sekali, karena bentuknya sama persis dengan yang sudah ada satu file sebelah. Ronde fix ini benar-benar memperbaiki aksesibilitas dan error-handling (dua-duanya genuinely bagus), tapi juga *menambahkan* slop-tell paling jelas di seluruh fitur ini. Skor ini: partial pass paling banter — lebih dekat ke "belum anti-slop" daripada "sudah anti-slop."

## Cognitive Load Checklist

2 dari 8 gagal — **Moderate (perlu dibenahi segera).**
- **Visual hierarchy — GAGAL.** 4 kartu status kasih bobot visual sama ke "tidak ada yang perlu dikerjakan" dan "kegagalan compliance"; tabel juga tidak ada default sort by urgency.
- **Minimal choices — GAGAL (ringan).** 11 kolom tabel simultan per baris tanpa strategi responsive column-hiding, buat task yang sebenarnya cuma "3 tanggal + 1 status."
- 6 item lain lolos: single focus, chunking, grouping, one-thing-at-a-time, working memory (preview import bagus di sini), progressive disclosure.

## Yang Sudah Bagus

1. **Pola toggle-checkpoint adalah pencapaian desain nyata fitur ini.** Satu renderer yang dipakai ulang (`renderCheckpointCell`) menjalankan ketiga kolom deadline dengan interaksi konsisten, low-friction, berlabel teks — ini yang dimaksud "diauthor buat workflow," dan generic scaffold tidak akan menghasilkan ini dengan sendirinya.
2. **Fix bulk-import tepat sasaran.** Preview-before-commit plus per-row error surfacing menyelesaikan risiko nyata tool ini — spreadsheet salah/basi diam-diam menimpa data compliance live — dengan friksi minimum yang perlu, bukan wizard multi-step generic.
3. **Fix aksesibilitas benar-benar diimplementasi, bukan kosmetik.** Drop-zone (`role="button"`, `tabIndex`, `onKeyDown` Enter/Space, focus ring terlihat) dan `aria-label` back-link keduanya fix asli yang jalan, bukan sekadar atribut ditambah buat lolos linter.

## Priority Issues

**[P1] Kartu KPI adalah hero-metric template copy-paste, bukan summary yang didesain buat data ini**
- **Kenapa penting**: Ini slop-tell paling jelas yang ditambahin di ronde fix ini — copy struktural verbatim dari kartu stat `CertificateTable.tsx`, kasih bobot visual sama ke status "aman" dan "urgent," dan sebagian besar cuma mengulang apa yang kolom Status/filter udah tunjukkan.
- **Fix**: Cut kartu ini, atau rebuild sekitar urgency — pimpin dengan Kadaluarsa/Mendekati Kadaluarsa, kasih bobot visual lebih kuat (bukan cuma warna beda di ukuran sama), dan bikin kartu-nya clickable buat filter tabel biar benar-benar kerja, bukan cuma display.
- **Suggested command**: `/impeccable clarify`

**[P1] "Tambah User" mislabel objek inti fitur ini**
- **Kenapa penting**: Ini copy generic-CRUD yang nempel di tool domain-specific; semua label lain di halaman ini (ID BSMR, Jenjang, Refreshment) presisi, dan ini enggak — langsung merusak klaim "diauthor buat BSMR" dan gampang banget difix.
- **Fix**: Rename tombol dan judul modal jadi "Tambah Peserta" atau "Tambah Data Sertifikasi".
- **Suggested command**: `/impeccable clarify`

**[P2] Delete pakai native `confirm()` sementara semua konfirmasi lain di file yang sama pakai shadcn `Dialog`**
- **Kenapa penting**: Pola interaksi tidak konsisten buat aksi yang levelnya sebanding, tidak bisa di-styling, dan tidak ada undo buat record yang terikat compliance regulasi.
- **Fix**: Ganti dengan `AlertDialog` yang match styling modal yang sudah ada; pertimbangkan window undo singkat sebelum DELETE beneran jalan.
- **Suggested command**: `/impeccable harden`

**[P2] `levelOptions` diturunkan dari hasil yang sudah difilter, bukan dataset penuh**
- **Kenapa penting**: Failure case konkret — pilih Jenjang "C", lalu pilih juga Status "Kadaluarsa"; kalau tidak ada holder Jenjang-C yang lagi Kadaluarsa, render berikutnya bakal diam-diam ngilangin "C" dari dropdown padahal itu masih jadi filter value aktif, orphaning state tanpa penjelasan ke user.
- **Fix**: Hitung level options dari sumber yang stabil/tidak difilter (fetch terpisah yang ringan, atau list distinct-level dari server), bukan dari array `holders` yang lagi difilter.
- **Suggested command**: `/impeccable harden`

**[P3] 11 kolom tabel simultan tanpa strategi responsive**
- **Kenapa penting**: Beban scanning padat buat data yang sebenarnya cuma 3 tanggal + 1 status per baris.
- **Fix**: Pertimbangkan collapse Instansi/Sertifikasi/Email ke row detail yang bisa di-expand, atau pastikan/tambahkan container horizontal-scroll eksplisit.
- **Suggested command**: `/impeccable layout`

## Persona Red Flags

**Alex (Power User)** — task: proses batch sertifikasi setelah sesi refreshment training. Bulk import menang buat masukin data, tapi setelah masuk, Alex stuck satu-per-satu — tidak ada multi-select, tidak ada bulk "tandai refreshment 1 selesai" buat satu kohort. Tidak ada sort kolom dan tidak ada export bikin Alex susah cepat produce daftar "siapa yang expiring bulan ini" tanpa eyeball tabel baris-per-baris. Delete native `confirm()` interupsi yang tidak bisa di-dismiss dengan muscle memory yang sama kayak dialog lain di app.

**Sam (Accessibility)** — task: keyboard/screen-reader-only, tandai checkpoint selesai. Fix drop-zone dan `aria-label` back-link keduanya confirmed benar dan jalan. Status dikomunikasikan lewat warna badge *dan* label teks bareng — lolos test "bukan warna doang." Yang masih terbuka: tombol icon Pencil/Trash2 masih cuma bawa atribut `title`, bukan `aria-label` — dukungan screen-reader buat `title` sebagai accessible name tidak konsisten antar-AT. Tombol "Selesai" itu sebenarnya toggle (klik lagi buat un-mark) tapi tidak ada `aria-pressed` — screen reader announce-nya sebagai tombol biasa, bukan toggle state.

## Minor Observations

- Search input tidak ada affordance clear/× begitu ada teks terisi.
- `formatDate` panggil `new Date(dateStr)` langsung ke string dari API — worth dicek lagi soal drift satu hari tergantung format date-only vs datetime yang dikembalikan, karena ini tanggal-tanggal compliance.
- Belum ada pagination di tabel holder — aman di skala sekarang, tapi tidak ada ceiling kelihatan kalau roster bertambah.
- `importErrors` ke-clear saat toggle mode/reopen modal, tapi tidak otomatis ke-clear pas upload file baru setelah yang gagal — worth dicek manual biar error row lama tidak nyangkut visual.
- Proses check: script `detect.mjs` sendiri tidak baca `.impeccable/config.json` — jadi finding spinner yang sudah di-suppress tetap muncul di raw output detector (bukan bug di suppression-nya, cuma catatan proses buat siapapun yang wiring layer suppression-nya).

## Questions to Consider

- Empat kartu status itu hasil satu ronde fix dan balik jadi copy kedua dari bentuk stat-card halaman lain — ada yang bakal kangen kalau kartu itu dihapus total?
- Kalau tugas tabel ini "kasih tahu ops siapa yang perlu tindakan bulan ini," kenapa "Aktif" (tidak ada yang perlu dikerjakan) dapat bobot visual sama kayak "Kadaluarsa" (kegagalan compliance)? Halamannya bakal kelihatan kayak apa kalau dibuka udah ke-sort dan ke-warnain by urgency, bukan by urutan kolom?
- Tombolnya bilang "Tambah User" tapi tidak ada konsep "User" di manapun lagi di fitur ini — dari mana kata itu datang, dan apa "Tambah Peserta Sertifikasi" bakal ngubah seberapa admin percaya sama tool ini di pandangan pertama?
