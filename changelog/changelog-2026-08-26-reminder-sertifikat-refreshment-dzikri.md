# Fitur Reminder Kadaluarsa Sertifikat & Refreshment

**Tanggal**: 2026-08-26
**PIC**: Dzikri
**Branch**: `feat/ui-enhancements` (lanjutan branch berjalan)

---

## Ringkasan

Fitur baru di dashboard admin: kelola data pemegang sertifikasi (sertifikasi manajemen risiko per-jenjang, contoh data BSMR) dan kirim reminder email otomatis untuk dua kewajiban berkala pemegangnya — refreshment tahunan dan sertifikasi ulang menjelang kadaluarsa. PRD lengkap ada di `docs/PRD/reminder-sertifikat-refreshment.md` (termasuk 8 open question yang sudah dijawab lewat diskusi sebelum development dimulai).

Ini prototype awal — email reminder murni teks pengingat, **belum ada** integrasi booking seminar refreshment atau penawaran pelatihan resertifikasi (sistem pendukungnya belum ada), sesuai Non-Goals yang disepakati di PRD.

---

## Cara Kerja Fitur Ini (Kondisi Terkini)

> Section ini gambaran **hasil akhir setelah semua ronde perbaikan di bawah** — buat yang mau ngerti fitur ini tanpa nyusurin history kronologisnya satu-satu. Detail keputusan & alasan tiap perubahan tetap ada di section-section sesudah ini.

**Model data** — `CertificationHolder`, flat, 1 row per pemegang sertifikasi: identitas (`bsmrId` unik, nama, instansi, jenjang, sertifikasi, email) + 3 tanggal checkpoint (`expiryDate`, `refreshment1Date`, `refreshment2Date`), masing-masing checkpoint punya `*CompletedAt` (ditandai manual admin) dan `*ReminderSentAt` (guard anti-kirim-ulang).

**Halaman admin** `/admin/reminder-sertifikat`:
- 4 kartu ringkasan status di atas, diurut & dibobot **by urgency** — Kadaluarsa & Mendekati Kadaluarsa nyala (fill merah/oranye, lebih besar), Aktif paling kalem.
- Search (nama/ID BSMR/instansi) + filter Status + filter Jenjang, dengan **pagination** server-side (20 baris/halaman).
- Tabel ringkas 6 kolom: ID BSMR, Nama, Status (badge), Instansi, Masa Berakhir (sekaligus tombol tandai-selesai checkpoint sertifikasi-ulang — paling kritis, makanya satu-satunya yang tetap di tabel), tombol **Detail**.
- Klik Detail → modal: identitas lengkap (Jenjang, Sertifikasi, Email) + ketiga checkpoint (Refreshment Thn 1 → Thn 2 → Sertifikasi Ulang, urut kronologis, masing-masing ada tombol Tandai Selesai/Batalkan) + tombol Edit & Hapus.
- Tombol **"Tambah Peserta"** — mode input manual (tanggal checkpoint auto-hitung 3/1/2 tahun dari Tanggal Ujian kalau dikosongin), atau import Excel (preview dulu sebelum commit, error per-baris ditampilin kalau ada yang gagal, template resmi di `public/template-excel/template-reminder-sertifikat.xlsx`).

**Alur bisnis end-to-end**:
1. Admin input data (manual/import) → status (`AKTIF`/`MENDEKATI_REFRESHMENT`/`MENDEKATI_KADALUARSA`/`KADALUARSA`) dihitung on-the-fly dari tanggal + flag completed (`src/lib/certification-status.ts`), bukan disimpan sebagai kolom.
2. Cron job `/api/cron/certification-reminders` (dipicu OS crontab jam 7 pagi tiap hari di production, protected via `CRON_SECRET`) scan semua data, kirim email H-30 ke checkpoint yang eligible, stamp `*ReminderSentAt` biar nggak kekirim dobel — sekali per checkpoint seumur hidupnya.
3. Admin tandai checkpoint selesai kapan aja dari panel Detail → reminder buat checkpoint itu berhenti.
4. Kalau tanggal checkpoint beneran diubah (edit manual atau re-import — misal orangnya mulai siklus sertifikasi baru), `*ReminderSentAt` **dan** `*CompletedAt` checkpoint terkait sama-sama direset, biar siklus baru mulai bersih.

**Yang perlu diwaspadai tim** (known issues, tercatat lengkap di bagian bawah): form Edit belum validasi `required` di field tanggal + hint auto-hitungnya salah buat mode Edit (auto-hitung cuma jalan di mode Add); belum ada test integration HTTP asli (semua verifikasi lewat code-review + type-check + build, bukan klik browser beneran, karena asisten nggak punya akses browser/login admin sepanjang sesi ini) — **disarankan klik-klik manual dulu sebelum/setelah deploy**. Toolkit testing cron manual/terjadwal ada di `scripts/run-cert-reminder-cron.ps1` dan `scripts/schedule-cert-reminder-test.ps1` (lihat panduan di bagian bawah).

---

## Apa yang Berubah

### 1. Model data baru: `CertificationHolder`
Flat model (bukan child table) di `prisma/schema.prisma` — satu row per pemegang sertifikasi, dengan 3 checkpoint (refreshment tahun 1, tahun 2, dan resertifikasi/kadaluarsa) masing-masing punya `*CompletedAt` (ditandai manual admin) dan `*ReminderSentAt` (guard anti-kirim-ulang). Sengaja tidak ada kolom `refreshment3Date` terpisah — checkpoint ke-3 pakai `expiryDate` langsung karena di data sumber dua tanggal itu selalu identik, simpan terpisah cuma nambah resiko drift.

### 2. API routes baru (`src/app/api/certification-holders/*`)
List (search+filter), create manual, edit, delete, tandai-checkpoint-selesai — semua pakai `requireAdmin()` seperti route admin lain. Plus `POST .../import` buat bulk upload (upsert per `bsmrId`, satu baris salah tidak nge-gagalin baris lain).

### 3. Endpoint cron baru (`/api/cron/certification-reminders`)
Bukan `requireAdmin()` — dicek via header `x-cron-secret` (env var `CRON_SECRET`). Scan semua data, kirim reminder yang eligible, formula eligibility satu baris yang otomatis mematuhi 3 aturan produk sekaligus (lihat §Keputusan). **Project ini sebelumnya tidak punya infrastruktur cron/scheduled job sama sekali** — ini kebutuhan teknis baru, dipenuhi lewat OS crontab (bukan library in-process), lihat §Panduan Deployment.

### 4. Email reminder baru (`src/lib/email.ts`)
`sendRefreshmentReminder()` dan `sendRecertificationReminder()` — beda dari 3 fungsi email lain yang sudah ada di file ini (yang return `void` dan tidak retry), dua fungsi baru ini **return `boolean`**, supaya cron cuma stamp `*ReminderSentAt` kalau kirimnya beneran berhasil (SMTP gagal sesaat tidak boleh membakar satu-satunya kesempatan kirim, karena reminder ini cuma dikirim sekali seumur checkpoint).

### 5. Halaman admin baru: `/admin/reminder-sertifikat`
Menu baru "Reminder Sertifikasi" di sidebar admin. Tabel dengan search (nama/ID BSMR/instansi) + filter (status/jenjang), tombol "Tambah User" dengan 2 mode (input manual / import Excel), badge status per row, dan tombol "Tandai Selesai" per checkpoint langsung dari tabel.

### 6. Bulk import Excel — parsing client-side
Ikutin pola yang sudah ada di codebase (`BulkUploadCard.tsx`/`ParticipantManager.tsx`: parse di browser, POST JSON yang sudah bersih ke server), tapi pemetaan kolom **strict/exact** (bukan fuzzy) karena datanya 10 kolom terstruktur, bukan 1 kolom nama bebas. Komponen baru: `CertificationBulkUploadCard.tsx`. Template download: `public/template-excel/template-reminder-sertifikat.xlsx`.

### 7. Data sampel dilengkapi
`Sampel Data J7.xlsx` (root project) ditambahin kolom `Email` dan `Sertifikasi yang Diambil` yang sebelumnya tidak ada di sumber data asli — nilainya placeholder buat kebutuhan development/testing (lihat catatan di PRD).

---

## Keputusan yang Diambil

Dikunci lewat tanya-jawab sebelum development (bukan diasumsikan sepihak):
- **Reminder dikirim sekali saja**, H-30 hari sebelum checkpoint. Tidak berulang.
- **Berhenti kirim** kalau tanggal checkpoint sudah lewat tanpa tindakan — bukan reminder keterlambatan.
- **Admin bisa tandai manual** "checkpoint selesai" per user, per checkpoint — begitu ditandai, reminder untuk checkpoint itu berhenti (toggle-able, misclick bisa dibatalkan).
- **Email full otomatis**, tidak ada antrian approval admin.
- **Scheduling pakai OS crontab + endpoint terproteksi**, bukan library in-process (`node-cron` dsb) — konsisten sama pola backup DB yang sudah ada, tidak nambah dependency, aman dari resiko PM2 cluster mode, dan bisa di-`curl` manual kapan saja buat testing (penting karena project ini tidak punya automated test sama sekali).
- **Duplikat `bsmrId` saat re-import → upsert**, bukan reject. Kalau tanggal checkpoint berubah, `*ReminderSentAt` checkpoint itu direset (dapat window H-30 baru) — tapi `*CompletedAt` **tidak pernah** direset oleh import, itu fakta yang tidak boleh hilang karena re-upload data.
- Status badge (`AKTIF`/`MENDEKATI_REFRESHMENT`/`MENDEKATI_KADALUARSA`/`KADALUARSA`) sengaja dibatasi window 0-30 hari (bukan termasuk yang sudah lewat) — checkpoint yang lewat lama tanpa ditandai selesai tetap "AKTIF" secara badge (sertifikatnya sendiri belum expired), tapi tetap kelihatan lewat tanggal mentah + tombol "Tandai Selesai" di tabel.

---

## Verifikasi

Bukan cuma type-check — dites langsung end-to-end:
- `npx tsc --noEmit`, `eslint`, `npm run build` — semua bersih, semua route baru terdaftar di build output.
- **Import Excel diuji pakai `Sampel Data J7.xlsx` asli** lewat logic parsing yang identik dengan komponen (`XLSX.read(..., {cellDates:true})` → map kolom → upsert) — 10 baris masuk sempurna ke `dev.db`, tanggal terbaca benar (bukan angka serial mentah).
- **Email reminder diuji beneran terkirim** — bikin row test sementara (refreshment H-10), panggil `sendRefreshmentReminder()` langsung pakai kredensial SMTP asli di `.env`, konfirmasi return `true`, konfirmasi `reminderSentAt` ke-stamp dan mencegah pengiriman kedua (guard eligibility jalan), row test dihapus setelah verifikasi.
- Ditemukan & diperbaiki 1 bug selama verifikasi: status badge sempat salah label "Mendekati Refreshment" untuk checkpoint yang sudah lewat 1-3 bulan (harusnya bukan "mendekati" lagi) — diperbaiki di `src/lib/certification-status.ts` sebelum handoff.
- **Belum dilakukan**: klik-klik manual di browser (tombol tandai selesai, edit, hapus, modal import) — perlu dicek manual karena tidak ada akses browser dari sisi asisten.

---

## Panduan Deployment

### Development (lokal)

Kalau pull branch ini di mesin lain atau setelah lama tidak sync:

```bash
git pull
npm install
npx prisma migrate dev   # apply migration CertificationHolder, regenerate Prisma Client
```

Buat testing endpoint cron secara manual, tambahin ke `.env` lokal (belum ada secara default):
```env
CRON_SECRET="apapun-buat-testing-lokal"
```

Lalu jalankan dev server dan trigger manual:
```bash
npm run dev
curl -X POST -H "x-cron-secret: apapun-buat-testing-lokal" http://localhost:3000/api/cron/certification-reminders
```
Response berupa ringkasan `{ scanned, refreshmentSent, recertSent, errors }`. Kalau mau lihat email beneran terkirim, pastikan `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` di `.env` sudah terisi kredensial asli (bukan placeholder) — kalau belum, fungsi kirim email cuma no-op diam-diam (tidak error, tapi juga tidak kirim apa-apa).

### Production

Selain langkah standar (`migrate deploy` → `prisma generate` → `build` → restart PM2, lihat `docs/09-deployment.md`), fitur ini butuh **satu langkah tambahan wajib** — tanpa ini, reminder tidak akan pernah terkirim otomatis:

1. Set `CRON_SECRET` di `.env` production (string acak, sama seperti `NEXTAUTH_SECRET`).
2. Tambahkan entry crontab baru (sejajar crontab backup DB yang sudah ada):
   ```bash
   # crontab -e
   0 7 * * * curl -s -X POST -H "x-cron-secret: $CRON_SECRET" https://leadershipnasionalasia.com/api/cron/certification-reminders >> /var/log/certification-reminders.log 2>&1
   ```
3. Pastikan `SMTP_*` sudah terkonfigurasi kredensial asli (harusnya sudah, dipakai fitur email lain juga).

Detail lengkap + alasan kenapa pakai OS crontab (bukan in-process scheduler) sudah didokumentasikan di `docs/09-deployment.md` bagian "Reminder Kadaluarsa Sertifikat & Refreshment (Cron)".

---

## Update (hari sama): Audit & Critique Desain + Perbaikan P1

Setelah build awal di atas selesai, halaman `/admin/reminder-sertifikat` di-review pakai `/impeccable audit critique` (technical audit 5 dimensi + design critique dual-assessment: LLM design review + detector/evidence pass, jalan isolated biar tidak saling bias). Skor awal: **Audit 11/20 (Acceptable)**, **Critique 20/40 (Acceptable, batas bawah)** — 0 P0, 4 P1, 6 P2, 4 P3. Laporan lengkap tersimpan di `.impeccable/critique/2026-08-26T13-39-35Z__c-app-admin-protected-reminder-sertifikat-page-tsx.md`.

Temuan paling signifikan: **checkpoint "recert" (resertifikasi) sudah lengkap di type system, API (`complete/route.ts`), dan email layer, tapi nggak pernah punya tombol di UI** — pemegang sertifikat yang statusnya `KADALUARSA` nggak punya jalan buat ditandai selesai lewat tabel sama sekali.

Ke-4 P1 langsung diperbaiki (sesuai keputusan: semua P1 sekaligus, scope P1 saja dulu):

1. **Kontrol checkpoint recert** — kolom "Masa Berakhir" sekarang jadi checkpoint cell juga (pola sama kayak Refreshment Thn 1/2), pakai `renderCheckpointCell` yang tipe parameternya dilebarin dari `"refreshment1" | "refreshment2"` ke `CertificationCheckpoint` penuh.
2. **Status jadi lebih menonjol** — kolom Status dipindah dari urutan ke-9 ke ke-3 (persis setelah Nama), plus nambah 4 kartu ringkasan (jumlah per status) di atas tabel — stylingnya niru pola KPI card yang udah ada di `sertifikat/CertificateTable.tsx` (bukan bikin pola baru), biar konsisten sama sistem visual yang sudah ada.
3. **Bulk import lebih aman** — sebelumnya file yang di-drop langsung upsert ke data live tanpa konfirmasi, dan error per-baris cuma masuk `console.warn` (nggak pernah sampai ke admin). Sekarang `CertificationBulkUploadCard` nahan hasil parse dulu sebagai preview (jumlah baris + 5 nama pertama + catatan perilaku upsert) dengan tombol Konfirmasi/Batal eksplisit, dan modal Add nampilin daftar error per-baris kalau ada yang gagal (modal cuma auto-close kalau importnya bersih 100%).
4. **Aksesibilitas keyboard** — link "kembali" (cuma icon panah, sebelumnya tanpa nama aksesibel) sekarang punya `aria-label`. Drop-zone Excel (sebelumnya `<div onClick>` polos, nggak bisa dijangkau keyboard sama sekali) sekarang punya `role="button"`, `tabIndex`, `onKeyDown` (Enter/Space), dan focus ring.

P2/P3 (bug filter jenjang yang opsinya bisa collapse, hint text mode Edit yang salah, touch target kecil, breakpoint responsive yang belum ada di form/filter, dsb) **sengaja belum dikerjakan** — di luar scope P1 yang disepakati, tapi sudah tercatat lengkap di laporan critique kalau mau lanjut nanti.

**Verifikasi ronde ini**: `npx tsc --noEmit` dan `eslint` bersih di kedua file yang diubah. **Belum bisa dites visual di browser** (nggak ada tool browser otomatis dan nggak ada kredensial login admin di sesi ini) — perlu klik-klik manual sebelum ship, terutama alur preview-import dan urutan kolom baru.

Satu temuan detector (`border-accent-on-rounded` di loading spinner, `page.tsx:342`) diverifikasi false positive (idiom spinner Tailwind standar: `rounded-full` + `border-b-2` satu sisi + `animate-spin`, bukan aksen dekoratif) dan di-suppress lewat `.impeccable/config.json` (`ignoreValues`), bukan diabaikan diam-diam.

---

## Update (2026-08-27): Anti-Slop Fixes, Restrukturisasi Tabel → Panel Detail, Pagination

Ronde critique kedua (`/impeccable critique`, fokus pertanyaan "apakah UI sudah anti AI slop?") nemuin 2 P1 baru — skor naik dari 20/40 ke **27/40**:
- **Kartu ringkasan status adalah copy struktural verbatim** dari kartu stat di `sertifikat/CertificateTable.tsx` (icon-box + label/angka, ukuran sama semua) — dipasang reflexive, bukan didesain buat data ini, dan kasih bobot visual sama ke status "aman" (Aktif) sama "urgent" (Kadaluarsa).
- **Tombol "Tambah User"** masih generic-CRUD copy padahal objeknya `CertificationHolder`, bukan "User" — nggak ada konsep "User" di manapun lagi di fitur ini.

**Fix**: kartu ringkasan di-rebuild by urgency (bukan alfabetis/urutan enum) — Kadaluarsa & Mendekati Kadaluarsa jadi solid-fill merah/oranye + angka lebih besar, Mendekati Refreshment kartu putih normal, Aktif paling muted (abu-abu, angka paling kecil) karena memang nggak perlu perhatian. "Tambah User" di-rename jadi **"Tambah Peserta"** di 3 tempat (tombol, judul modal, copy empty-state).

**Restrukturisasi tabel** (permintaan user: tabel kepanjangan, mau kurangin kolom + tombol Detail): dari 11 kolom jadi **6 kolom** (ID BSMR, Nama, Status, Instansi, Masa Berakhir, Aksi). Jenjang, Sertifikasi, Email, Refreshment Thn 1 & 2, plus tombol Edit/Hapus dipindah ke **modal Detail baru** yang dibuka lewat tombol "Detail" per baris (ganti icon pencil/trash lama). Checkpoint sertifikasi-ulang (recert) tetap di kolom Masa Berakhir (satu-satunya aksi yang tersisa langsung di tabel, karena itu checkpoint paling kritis).

**Pagination** ditambahin ke `GET /api/certification-holders` (param `page`/`pageSize`, default 20/halaman) — respons API berubah dari array polos jadi `{ items, total, page, pageSize, totalPages, statusCounts, levelOptions }`. Sekalian kefix 2 bug laten yang jadi lebih parah kalau nggak dibenerin bareng pagination: `levelOptions` (opsi filter Jenjang) dan `statusCounts` (angka di kartu ringkasan) sekarang dihitung di server dari scope yang benar (search-only buat levelOptions, search+level buat statusCounts, sebelum filter status/pagination diterapkan) — sebelumnya diturunkan di client dari `holders` yang sudah difilter/dipaginate, jadi bisa nyembunyiin opsi Jenjang atau salah hitung count begitu ada filter aktif.

**Redesign checkpoint di Detail**: checkpoint recert (sebelumnya nyempil sendiri di tabel) dipindah ikut ke Detail juga biar konsisten sama Refreshment 1/2. Urutan 3 checkpoint di Detail dibalik jadi kronologis (Refreshment Thn 1 → Thn 2 → Sertifikasi Ulang, sebelumnya recert duluan). Tiap baris checkpoint sekarang punya icon status (centang hijau/lingkaran kosong) dan tombol aksi pakai komponen `Button` beneran (`outline`/`ghost`), bukan link teks polos lagi.

**Verifikasi ronde ini**: `npx tsc --noEmit` dan `eslint` bersih. Belum ada uji visual browser (kendala sama seperti ronde sebelumnya).

---

## Update (2026-08-27): Toolkit Testing Cron Job (Reusable)

Selama testing manual fitur ini, dibikin sekalian toolkit kecil buat nge-test endpoint `/api/cron/certification-reminders` secara berulang tanpa perlu nunggu jadwal crontab beneran atau curl manual tiap kali. Dua script baru di `scripts/`:

### `scripts/run-cert-reminder-cron.ps1`
Trigger langsung endpoint cron-nya (POST + header `x-cron-secret`), buat testing instan tanpa nunggu apa-apa.

```powershell
powershell -File scripts\run-cert-reminder-cron.ps1
```

- Baca `CRON_SECRET` langsung dari `.env` project root (bukan hardcode di script) — satu sumber kebenaran, kalau secret-nya diganti di `.env`, script otomatis ikut.
- Hasil tiap run **ditambahkan** (append, bukan overwrite) ke `scripts/cert-reminder-cron.log` (gitignored) — riwayat beberapa kali test kelihatan semua, bukan cuma yang terakhir.
- Response JSON dari endpoint (`{scanned, refreshmentSent, recertSent, errors}`) langsung ditampilkan ke terminal juga.

### `scripts/schedule-cert-reminder-test.ps1`
Buat testing skenario **"natural"** — endpoint ke-trigger sendiri oleh jadwal (kayak crontab production beneran), bukan manual klik/curl. Daftarin one-shot Windows Task Scheduler entry N menit dari sekarang (default 3 menit, bisa diubah).

```powershell
powershell -File scripts\schedule-cert-reminder-test.ps1                  # default 3 menit
powershell -File scripts\schedule-cert-reminder-test.ps1 -MinutesFromNow 10
```

- **Self-cleaning**: task Task Scheduler-nya otomatis kehapus sendiri begitu selesai fire (lewat baris cleanup di `run-cert-reminder-cron.ps1`, karena itu yang beneran dieksekusi Task Scheduler) — nggak pernah nyisain entry mati yang harus dibersihin manual, aman dipanggil berkali-kali.
- Kalau ada task lama yang somehow masih nyangkut (misal proses kehenti paksa di tengah), script ini bersihin dulu sebelum bikin yang baru — idempotent.
- **Catatan locale**: `schtasks` di mesin dev ini expect format tanggal `dd/MM/yyyy`, bukan format `.NET` culture bawaan (`M/d/yyyy`) — kalau dipindah ke mesin lain dan schtasks nolak dengan "Invalid/Incorrect Start Date", cek `(Get-Culture).DateTimeFormat` dan sesuaikan format string di script.

### Cara pakai buat testing ulang

1. Pastikan `npm run dev` nyala di `localhost:3000` dan `CRON_SECRET` ada isinya di `.env`.
2. Siapin data test (misal via bulk-import Excel) dengan tanggal yang sengaja diatur dekat dengan hari ini (H-30 checkpoint) atau sudah lewat, buat mancing status `MENDEKATI_REFRESHMENT`/`MENDEKATI_KADALUARSA`/`KADALUARSA`.
3. Testing instan: `powershell -File scripts\run-cert-reminder-cron.ps1`, cek `scripts/cert-reminder-cron.log` dan inbox email tujuan.
4. Testing "natural" (kayak production): `powershell -File scripts\schedule-cert-reminder-test.ps1`, tunggu beberapa menit, cek log yang sama.
5. Ingat: reminder cuma dikirim **sekali per checkpoint** (guard `*ReminderSentAt`) — kalau mau re-test row yang sama, edit ulang tanggal checkpoint-nya (lewat form Edit atau re-import) supaya window H-30 kebuka baru, atau pakai data/ID BSMR baru.

Divalidasi beneran jalan di sesi ini: trigger manual dan trigger via Task Scheduler dua-duanya sukses kirim reminder (3 refreshment + 3 recert, 0 error), dan run kedua di baris yang sama dengan sengaja menghasilkan `0/0` — mengonfirmasi guard anti-kirim-ulang jalan sesuai desain.

---

## Update (2026-08-27): Final Audit — Backend, Frontend, & Business Logic

Review menyeluruh (bukan cuma UI) pakai skill `code-review` level tinggi, dengan verifikasi independen berlapis buat temuan-temuan utamanya. 8 bug nyata dibenerin:

1. **PUT edit (`[id]/route.ts`) nggak pernah reset `*ReminderSentAt`** walau tanggal checkpoint beneran berubah — kontradiksi sama klaim di panduan testing di atas ("lewat form Edit **atau** re-import"). Cuma jalur import yang bener sebelumnya. Sekarang PUT fetch data lama dulu, diff tanggal, reset yang relevan — pola sama kayak import.
2. **Batalkan tanda selesai (`[id]/complete/route.ts`) nggak reset `*ReminderSentAt`** — checkpoint yang di-un-mark tetep nggak bisa dapet reminder lagi kalau sebelumnya udah pernah kekirim. Sekarang ikut direset.
3. **Import: ID BSMR duplikat dalam satu file (belum ada di DB) bikin SELURUH transaksi batal** — dua `create()` bsmrId sama nabrak unique constraint, roll back semua baris termasuk yang valid, cuma dapet error 500 generic. Sekarang baris duplikat kedua-dst ditolak per-baris.
4. **Import: kolom wajib isinya spasi doang lolos validasi** (truthy-check, bukan trim-check). Sekarang di-trim dulu.
5. **Modal Detail nampilin state checkpoint basi** setelah toggle di dalam modal yang lagi kebuka (snapshot `detailHolder` nggak ke-sync). Sekarang ikut sync + status badge dihitung ulang langsung.
6. **Regex ekstensi file case-sensitive** — `Data.XLSX` ditolak. Tambah flag `i`.
7. **HTML injection di email reminder** — nama/sertifikasi holder (data admin-controlled, bisa dari Excel) diselipin mentah ke HTML tanpa escape. Ditambah `escapeHtml()`.
8. **Cron secret pakai `!==` biasa** (timing side-channel kecil) — ganti `crypto.timingSafeEqual`.

Plus hardening: `fetchHolders()` di halaman admin sekarang pakai `AbortController` — response yang nyusul telat dari ketikan search cepat/klik filter beruntun nggak nimpa state yang lebih baru lagi.

### Keputusan bisnis yang direvisi: `*CompletedAt` sekarang IKUT direset kalau tanggal berubah

Audit ini juga nemuin satu **tension aturan bisnis**, bukan bug kode biasa: keputusan awal "`*CompletedAt` TIDAK PERNAH direset oleh import" (lihat bagian Keputusan di atas) punya efek samping — kalau holder yang sama di-import ulang buat siklus sertifikasi BARU (misal abis recertifikasi, tanggalnya di-update), flag `*CompletedAt` dari siklus LAMA tetep nyangkut, dan itu bikin `getCertificationStatus()` + `isReminderEligible()` diam-diam nganggep checkpoint siklus baru itu "udah selesai" juga — status tetep Aktif, reminder nggak pernah kekirim buat deadline yang sebenarnya baru, walau `*ReminderSentAt`-nya udah kereset bener. Nggak ada sinyal apapun di UI soal ini.

**Diputuskan (direkomendasikan, dikonfirmasi user): revisi keputusan awal.** `*ReminderSentAt` **dan** `*CompletedAt` checkpoint terkait sekarang sama-sama direset kalau tanggalnya beneran berubah — baik lewat edit manual maupun re-import. Ini mengganti keputusan "CompletedAt nggak pernah direset" yang tercatat di bagian Keputusan di atas; keputusan lama itu dibiarkan tertulis apa adanya sebagai jejak sejarah, bukan diedit ulang, karena memang itu yang diputuskan & dikerjakan waktu itu — dokumen ini yang meng-supersede-nya.

**Verifikasi ronde ini**: `npx tsc --noEmit`, `eslint`, dan `npm run build` (full production build, bukan cuma type-check) semua bersih — 40 halaman + semua route API (termasuk 4 route fitur ini) ke-generate normal. Detector desain (`detect.mjs`) cuma nemuin 1 finding lama yang emang udah di-suppress (idiom spinner, false positive). **Belum ada integration test HTTP beneran** ke route yang butuh admin session (nggak ada akses browser buat login di sesi ini) — logic-nya diverifikasi lewat pembacaan kode + type-check + build, bukan klik-klik langsung; tetap disarankan sekali coba manual di browser sebelum ship, terutama alur edit-tanggal-lalu-cek-reminder dan Batalkan-checkpoint.

### Masih tercatat sebagai backlog, sengaja belum dikerjakan

- `GET /api/certification-holders` hitung status buat seluruh hasil search-match dulu baru dipaginate di JS (bukan `LIMIT`/`OFFSET` di level DB) — karena status itu computed, bukan kolom. Aman di skala sekarang, jadi bottleneck kalau datanya udah ribuan baris.
- Form `CertificationHolderFields` belum ada `required` di field tanggal buat mode Edit, dan hint text-nya salah di situ — sudah tercatat dari audit pertama, sengaja di luar scope P1 waktu itu.
- Endpoint cron nggak ada lock/guard kalau ada 2 invocation yang overlap persis bersamaan (misal test manual pas-pasan sama jadwal crontab beneran) — risiko rendah di model deployment sekarang (satu crontab entry + script test yang dikontrol manual).
- Import `findMany({ bsmrId: { in: [...] } })` ukurannya ngikutin jumlah baris di-upload — bisa kena limit bound-parameter SQLite kalau importnya 999+ baris sekaligus dalam satu file. Nggak realistis di skala data fitur ini sekarang.

---

## Dampak

- **Breaking changes**: tidak ada — fitur baru murni, tidak mengubah behavior yang sudah ada.
- **Dependency baru**: tidak ada (pakai `xlsx`, `date-fns`, `nodemailer` yang sudah jadi dependency project).
- **Env var baru**: `CRON_SECRET` — wajib di-set di semua environment (dev kalau mau testing manual, production wajib untuk cron jalan).
- **Data sampel**: `dev.db` lokal sekarang keisi 20 row (10 dari `Sampel Data J7.xlsx` + 10 dari `Data_J7_Reminder_baru.xlsx`, dua-duanya hasil testing import dengan email tujuan `laksamanadzikri9@gmail.com`) — kalau tidak diperlukan buat demo/staging, boleh dihapus manual lewat tabel di `/admin/reminder-sertifikat` sebelum deploy ke production.
- **Belum dikerjakan** (sesuai Non-Goals PRD, kandidat v2): integrasi booking seminar refreshment, integrasi penawaran pelatihan resertifikasi, kanonikalisasi field "Sertifikasi yang Diambil" (masih free text). Pagination **sudah** dikerjakan (lihat Update 2026-08-27) — tapi masih JS-side di atas hasil `findMany` penuh, bukan `LIMIT`/`OFFSET` di level DB (lihat backlog di Final Audit).
