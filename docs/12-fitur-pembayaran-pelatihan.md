# 12 - Fitur Pembayaran Manual (Training Berbayar)

## Konsep

Sebagian training di `/info-pelatihan` berbayar. Alih-alih integrasi payment gateway, sistem ini pakai pola **transfer manual + verifikasi admin**: peserta transfer ke rekening perusahaan, upload bukti transfer saat daftar, admin cek buktinya lalu approve/reject.

**Tanpa akun/login.** Peserta publik tetap cuma isi form (nama/email/HP) seperti pendaftaran training gratis — tidak ada sistem member baru. Ini keputusan sadar, konsisten dengan `TrainingRegistrant` yang sudah ada sejak awal, supaya tidak menambah kompleksitas auth untuk kasus pemakaian yang sebenarnya sederhana.

---

## Alur Lengkap

```
Admin centang "Training ini berbayar" + isi Pengaturan Rekening (sekali saja, berlaku semua training)
         │
         ▼
Peserta buka /info-pelatihan/[id] → klik "Daftar Sekarang"
         │
         ▼
Modal pendaftaran menampilkan panel info rekening + field upload bukti transfer
         │
         ▼
Peserta isi form + upload bukti → submit
         │                              (upload bukti terjadi SAAT file dipilih,
         │                               bukan saat submit — lihat "Pola Upload")
         ▼
TrainingRegistrant baru dibuat, paymentStatus = PENDING
Peserta lihat pesan "menunggu verifikasi pembayaran"
         │
         ▼
Admin buka /admin/pelatihan/[id] → lihat bukti di tabel pendaftar
         │
    ┌────┴────┐
    ▼         ▼
 Setujui    Tolak (wajib isi alasan)
    │         │
    ▼         ▼
APPROVED   REJECTED + rejectionReason
    │         │
    ▼         ▼
Email ke   Email ke peserta (alasan penolakan)
peserta    → peserta isi ULANG form dari awal (row baru,
(terkonfirmasi)   row lama yang ditolak tetap ada sebagai riwayat)
```

Untuk training **gratis** (`requiresPayment = false`), alurnya persis seperti sebelum fitur ini ada — tidak ada panel rekening, tidak ada upload, `paymentStatus` otomatis `NOT_REQUIRED`.

---

## Data Model

### `Training` — 1 field baru
| Field | Tipe | Keterangan |
|---|---|---|
| `requiresPayment` | `Boolean` (default `false`) | Trigger utama. Menentukan apakah form publik & validasi API minta bukti bayar. **Bukan** diturunkan dari field `price` (yang teks bebas dan rawan salah baca) — sengaja jadi field eksplisit. |

### `TrainingRegistrant` — field pembayaran
| Field | Tipe | Keterangan |
|---|---|---|
| `paymentProofPath` | `String?` | Path file, mis. `/uploads/payment-proofs/xxx.jpg` |
| `paymentStatus` | `String` (default `"NOT_REQUIRED"`) | `NOT_REQUIRED` \| `PENDING` \| `APPROVED` \| `REJECTED` |
| `rejectionReason` | `String?` | Diisi cuma saat `REJECTED` |
| `reviewedAt` | `DateTime?` | Kapan admin approve/reject |
| `reviewedById` | `String?` | Admin mana yang review (relasi ke `User`) |

**Penting**: `paymentStatus` merekam kondisi *saat orang itu daftar*, bukan hasil kalkulasi live dari `Training.requiresPayment` sekarang. Kalau admin ubah training dari berbayar → gratis (atau sebaliknya) setelah ada pendaftar, **row registrant lama tidak ikut berubah**. Flag `requiresPayment` cuma ngatur form & validasi untuk pendaftar *baru* ke depannya.

### `PaymentSetting` — tabel baru, singleton
Info rekening perusahaan (nama bank, no. rekening, atas nama, catatan opsional) disimpan di DB, bukan hardcode — admin bisa ubah dari `/admin/pelatihan/pengaturan-pembayaran` tanpa deploy ulang. Selalu 1 row saja (`id: "singleton"`, pakai `upsert`, tidak perlu query cari row id).

---

## API Endpoints

| Endpoint | Method | Akses | Fungsi |
|---|---|---|---|
| `/api/upload/payment-proof` | POST | **Publik** | Upload bukti transfer. Terima gambar (jpg/png/webp/gif) + PDF, maks 5MB. Satu-satunya upload endpoint di app ini tanpa login. |
| `/api/trainings/[id]/registrants` | POST | Publik | Sudah ada sebelumnya, dimodifikasi: kalau `training.requiresPayment`, wajib `paymentProofPath` di body atau ditolak 400. |
| `/api/trainings/[id]/registrants/[registrantId]` | PUT | Admin only | Approve/reject. Body: `{ action: "approve" \| "reject", rejectionReason?: string }`. Reject wajib alasan. |
| `/api/payment-settings` | GET | Publik | Baca info rekening (dipakai form pendaftaran). |
| `/api/payment-settings` | PUT | Admin only | Update info rekening. |
| `/api/trainings` (POST) / `/api/trainings/[id]` (PUT) | - | Admin only | Sudah ada, dimodifikasi terima `requiresPayment`. |

---

## Pola Upload: "Upload Saat Pilih File", Bukan "Upload Saat Submit"

File bukti transfer di-upload ke server **begitu peserta memilih file** (event `onChange` pada `<input type="file">`), bukan ditunda sampai form di-submit. Path hasil upload disimpan di state, baru diikutkan saat submit form utama.

Ini pola yang **sudah dipakai** di admin (`handleImageUpload` untuk gambar training) — bukan hal baru yang diperkenalkan fitur ini, cuma diterapkan konsisten. Efeknya: submit form utama jadi cepat (file sudah ada di server duluan), dan peserta bisa lihat konfirmasi upload berhasil sebelum submit.

---

## Keamanan Endpoint Upload Publik

`/api/upload/payment-proof` adalah satu-satunya upload endpoint tanpa login di aplikasi ini — jadi butuh pengaman ekstra dibanding `/api/upload/training` (yang admin-only):

- **Allowlist MIME type** ketat — cuma gambar umum + PDF, bukan semua tipe file.
- **Ekstensi file diambil dari MIME type**, bukan dari nama file yang dikirim klien (mencegah trik `virus.exe.jpg`).
- **Cap ukuran 5MB**, dicek di server (bukan cuma `accept` di HTML yang gampang dilewati).
- **Nama file random** di server (`timestamp-random.ext`) — klien tidak bisa kontrol path/nama file tersimpan.
- File cuma bisa dibuka lewat `/api/public/images/[...path]` yang sudah ada proteksi directory traversal-nya.

**Yang sengaja TIDAK ada** (di luar scope, biar konsisten dengan endpoint publik lain yang juga tidak punya ini): rate limiting, virus scan, CAPTCHA.

---

## Review Bukti Pembayaran di Admin

Bukti bisa berupa **gambar atau PDF**. Next.js `<Image>` cuma bisa render gambar, jadi UI review-nya:
- Gambar → ditampilkan langsung di dalam dialog preview.
- PDF → link "Buka PDF di tab baru", biarkan browser pakai native PDF viewer-nya. Tidak ada library PDF viewer tambahan yang dipasang — sengaja, biar tetap simpel.

Tabel pendaftar (`/admin/pelatihan/[id]`) dapat 3 kolom baru: **Status Pembayaran** (badge warna: kuning=Menunggu, hijau=Disetujui, merah=Ditolak), **Bukti** (tombol buka preview), **Aksi** (tombol Setujui/Tolak — cuma muncul kalau status masih Menunggu).

---

## Kenapa Resubmission = "Daftar Ulang", Bukan Link Khusus?

Kalau bukti ditolak, peserta **tidak** dapat link resubmit khusus — cukup isi form pendaftaran lagi dari awal di halaman training yang sama. Ini bikin row baru di `TrainingRegistrant`, row lama (yang ditolak) tetap ada sebagai riwayat.

Alasan: karena tidak ada login/session, sistem tidak punya cara membuktikan "orang yang submit ulang ini adalah orang yang sama" tanpa infrastruktur tambahan (token unik, halaman resubmit terpisah). Daripada bangun mekanisme itu untuk kasus yang jarang terjadi, lebih simpel biarkan peserta daftar ulang — dan admin toh sudah bisa lihat riwayat penuh (termasuk yang ditolak) di tabel yang sama.

---

## Halaman & Komponen yang Terlibat

| File | Peran |
|---|---|
| `src/app/admin/pelatihan/page.tsx` | Checkbox "Training ini berbayar" saat create training |
| `src/app/admin/pelatihan/[id]/page.tsx` | Checkbox saat edit + tabel review pembayaran (bagian terbesar) |
| `src/app/admin/pelatihan/pengaturan-pembayaran/page.tsx` | Form edit info rekening (halaman baru) |
| `src/app/(main)/info-pelatihan/[id]/page.tsx` | Modal pendaftaran publik — panel rekening + upload |
| `src/lib/email.ts` | `notifyRegistrantPaymentApproved` / `notifyRegistrantPaymentRejected` |
| `src/lib/translations.ts` | Copy bilingual untuk semua teks di atas (key `registrationModal.*`) |

---

## Testing Manual

Checklist singkat untuk verifikasi end-to-end (butuh browser + login admin `admin@lna.com` / `admin123`, dan SMTP dikonfigurasi kalau mau cek email beneran terkirim — lihat `docs/11-shadcn-mcp.md` bagian setup kalau belum):

1. **Training gratis** — pastikan tidak berubah sama sekali (tidak ada panel rekening/upload di modal, tidak ada kolom Aksi di tabel admin).
2. **Training berbayar, happy path** — isi Pengaturan Rekening → buat training baru dengan checkbox aktif → daftar publik dengan upload JPEG → cek status "Menunggu" muncul di admin → klik Setujui → cek email diterima.
3. **Training berbayar, reject** — daftar dengan upload PDF → cek preview PDF buka di tab baru → Tolak dengan alasan → cek email berisi alasan → coba Tolak tanpa alasan (harus diblok) → simulasikan "daftar ulang" (isi form lagi) → pastikan row lama tetap ada dengan status Ditolak, row baru muncul terpisah.
4. **Pengaturan Rekening** — `GET` publik tanpa login (200), `PUT` tanpa login (401), submit dengan field kosong (diblok).
