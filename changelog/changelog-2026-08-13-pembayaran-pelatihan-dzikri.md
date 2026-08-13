# Fitur Pembayaran Manual (Upload Bukti Transfer + Persetujuan Admin)

**Tanggal**: 2026-08-13
**PIC**: Dzikri

---

## Ringkasan
Sebagian training di `/info-pelatihan` berbayar. Ditambahkan alur transfer manual + verifikasi admin: peserta transfer ke rekening perusahaan, upload bukti saat daftar, admin cek buktinya lalu approve/reject dari `/admin/pelatihan/[id]`. Tetap **tanpa akun/login** untuk peserta — konsisten dengan `TrainingRegistrant` yang sudah ada. Referensi pola diambil dari project `probisdi.org` (folder project lain) untuk bagian upload-lalu-submit dan endpoint approve/reject berbasis action, tapi sengaja tidak meniru sistem akun member-nya.

Sesi ini juga menambah beberapa penyempurnaan business logic setelah fitur inti selesai: badge status, warning kalau admin lupa centang "berbayar", cross-reference nominal saat review, guard anti double-approve, undo keputusan, export CSV, dan kuota peserta.

---

## Apa yang Berubah

### 1. Data Model (`prisma/schema.prisma`)
- `Training.requiresPayment` (Boolean, default false) — trigger eksplisit, sengaja bukan diturunkan dari field `price` yang teks bebas.
- `Training.capacity` (Int?, opsional) — kuota peserta, null = tidak terbatas.
- `TrainingRegistrant`: `paymentProofPath`, `paymentStatus` (`NOT_REQUIRED`/`PENDING`/`APPROVED`/`REJECTED`), `rejectionReason`, `reviewedAt`, `reviewedById`.
- Model baru `PaymentSetting` — info rekening perusahaan, singleton (`id: "singleton"`, di-upsert), admin bisa edit tanpa deploy ulang.
- 2 migration: `add_payment_proof_to_trainings`, `add_training_capacity`.

### 2. API
- `POST /api/upload/payment-proof` — **publik**, satu-satunya upload endpoint tanpa login di app ini. Terima gambar (jpg/png/webp/gif) + PDF, maks 5MB, ekstensi diambil dari MIME type (bukan nama file klien).
- `PUT /api/trainings/[id]/registrants/[registrantId]` — admin only, `{ action: "approve" | "reject" | "reset", rejectionReason? }`. `reset` membatalkan keputusan (balik ke Menunggu) tanpa kirim email — buat koreksi kalau admin salah klik.
- `GET`/`PUT /api/payment-settings` — baca (publik) & update (admin) info rekening.
- `POST /api/trainings/[id]/registrants` dimodifikasi: validasi bukti bayar wajib kalau `requiresPayment`, dan validasi kuota (registrant `REJECTED` tidak menghitung kuota, jadi slot yang ditolak balik ke pool).
- `POST /api/trainings` & `PUT /api/trainings/[id]` dimodifikasi: terima `requiresPayment` & `capacity`. Field `capacity` di PUT pakai pola "tidak dikirim = biarkan nilai lama, dikirim null = hapus batas, angka = set" — supaya `toggleActive()` yang rekonstruksi body manual tidak diam-diam mereset field ini.
- `GET /api/trainings/[id]` dimodifikasi: tambah `activeRegistrantsCount` (hitungan registrant non-REJECTED) buat halaman publik tampilkan sisa kuota akurat.
- Guard idempotency: approve/reject endpoint skip update+email kalau aksi yang sama persis diulang (mis. admin double-klik) — mencegah email approval/rejection terkirim dobel.
- `src/lib/email.ts`: extract `getMailer()` dari `sendAdminNotification`, tambah `notifyRegistrantPaymentApproved` & `notifyRegistrantPaymentRejected` (non-blocking, never-throw).

### 3. Admin UI
- `/admin/pelatihan` & `/admin/pelatihan/[id]`: checkbox "Training ini berbayar", input "Kuota Peserta (opsional)", badge "Berbayar" di card/detail, warning inline kalau harga diisi tapi checkbox belum dicentang.
- `/admin/pelatihan/[id]`: tabel pendaftar dapat kolom Status Pembayaran (badge warna), Bukti (dialog preview — gambar inline / link PDF tab baru, dengan nominal seharusnya ditampilkan buat cross-check), dan Aksi (Setujui/Tolak saat Menunggu, Batalkan saat sudah diputuskan). Tombol "Export CSV" buat rekap data pendaftar.
- `/admin/pelatihan/pengaturan-pembayaran` (halaman baru) — form edit info rekening.

### 4. Publik (`/info-pelatihan/[id]`)
- Modal pendaftaran: panel info rekening + field upload bukti (muncul kalau training berbayar), pesan sukses beda untuk status "menunggu verifikasi".
- Tampilan sisa kuota + tombol "Daftar Sekarang" otomatis disable & berubah jadi "Kuota Penuh" kalau slot habis.

### 5. Bug fix
- Modal pendaftaran publik pakai `overflow-hidden` tanpa batas tinggi — begitu field bertambah (panel rekening + upload), konten melebihi viewport dan bagian bawah (termasuk field upload bukti) ke-clip, tidak bisa di-scroll. Diperbaiki jadi `max-h-[90vh] overflow-y-auto`, sama seperti pola yang sudah dipakai di modal admin.

### 6. Dokumentasi
- `docs/12-fitur-pembayaran-pelatihan.md` — penjelasan konsep, alur, data model, dan rasional keputusan desain, buat referensi tim.

---

## Keputusan yang Diambil
- **Tanpa akun/login untuk peserta** — konsisten dengan `TrainingRegistrant` yang sudah ada, bukan meniru sistem member `probisdi.org`.
- **`requiresPayment` field eksplisit**, bukan derive dari `price` (teks bebas, rawan salah baca).
- **Info rekening di DB** (bukan hardcode) — admin bisa update tanpa deploy ulang.
- **Resubmission setelah ditolak = isi ulang form dari awal** (row baru), bukan link resubmit khusus — karena tanpa login, sistem tidak punya cara membuktikan "orang yang sama" tanpa infrastruktur tambahan yang tidak sepadan untuk kasus ini.
- **Registrant REJECTED tidak menghitung kuota** — slot yang ditolak otomatis balik ke pool, dihitung ulang di server (bukan cuma di UI) supaya tidak race dengan tampilan yang stale.
- **Guard idempotency di server, bukan cuma disable button di frontend** — supaya aman dari multi-tab/retry jaringan, bukan cuma double-klik biasa.

---

## Verifikasi
- `npm run lint` — 0 error di semua file yang diubah (ada 1 warning pre-existing tidak terkait).
- `npm run build` — sukses, semua route baru terdaftar (`/admin/pelatihan/pengaturan-pembayaran`, `/api/payment-settings`, `/api/trainings/[id]/registrants/[registrantId]`, `/api/upload/payment-proof`), tidak ada type error.
- Manual testing: alur lengkap daftar → upload bukti → admin approve/reject → email (via Ethereal SMTP test inbox) sudah dicoba langsung dan dikonfirmasi jalan.

---

## Dampak
- **Breaking changes**: tidak ada — training lama otomatis `requiresPayment: false, capacity: null` dari default migration, perilakunya persis seperti sebelum fitur ini ada.
- **Dependency baru**: tidak ada (semua fitur pakai library yang sudah terpasang — nodemailer, Prisma, shadcn components yang sudah di-setup sesi sebelumnya).
- **Catatan proses**: commit ini menggabungkan seluruh pekerjaan satu sesi (bukan per-perubahan) karena semua edit numpuk di file yang sama dan tidak aman dipisah tanpa staging manual per-hunk.
