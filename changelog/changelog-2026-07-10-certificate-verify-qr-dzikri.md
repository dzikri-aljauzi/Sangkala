# Halaman Verifikasi Sertifikat & QR Code (Bank BPD DIY)

**Tanggal**: 2026-07-10
**PIC**: Dzikri

---

## Ringkasan
Permintaan urgent: sertifikat pelatihan "Perbankan Syariah" untuk peserta Bank BPD DIY perlu QR code yang tersambung ke website LNA dan menampilkan keterangan verifikasi. Dibuatkan halaman statis (tanpa database) dan QR code yang mengarah ke halaman tersebut, dengan tampilan mengikuti gaya halaman verifikasi sertifikat yang sudah dirancang sebelumnya.

---

## Apa yang Berubah

### 1. Halaman Verifikasi Statis
- Route baru: `src/app/(verify)/verify/bpd-diy-syariah-2026/page.tsx`.
- Berisi data sertifikat hardcode (program, nama instansi, tanggal terbit) dan kalimat verifikasi resmi sesuai permintaan atasan.
- Tampilan mengikuti gaya visual halaman verifikasi sertifikat berbasis database (logo LNA, banner "Sertifikat Resmi Terverifikasi", kartu detail) tanpa bergantung pada data di database.
- URL setelah deploy: `https://leadershipnasionalasia.com/verify/bpd-diy-syariah-2026`.

### 2. QR Code
- File `public/qr/bpd-diy-syariah-2026.png` (1024×1024, error-correction tinggi) berisi tautan ke halaman verifikasi di atas.
- Setelah deploy juga bisa diunduh langsung dari `https://leadershipnasionalasia.com/qr/bpd-diy-syariah-2026.png`.

### 3. Perbaikan Bug: Nested `<html>` di Route Group `(verify)`
- `src/app/(verify)/layout.tsx` sebelumnya merender `<html>`/`<body>` sendiri, padahal root layout (`src/app/layout.tsx`) sudah melakukannya — menyebabkan tag `<html>` bertumpuk (invalid HTML) di semua halaman verifikasi, termasuk halaman verifikasi sertifikat yang sudah ada (`verify/[id]`).
- Layout disederhanakan agar hanya meneruskan `children`, mengikuti pola yang sama seperti route group `(main)`.

---

## Dampak
- **Flow bisnis**: Tidak perlu proses admin/database untuk kasus sertifikat mendesak seperti ini — cukup deploy halaman statis + cetak QR code.
- **Kompatibilitas**: Tidak memengaruhi fitur sertifikat berbasis database yang sedang dikembangkan (`verify/[id]`), hanya memperbaiki bug layout yang juga berdampak pada route tersebut.
- **Breaking changes**: Tidak ada.
- **Catatan**: Nama "Bank BPD DIY" dan tanggal terbit (10 Maret 2026) di-hardcode di halaman — perlu dicek ulang penulisan resminya sebelum QR code dicetak ke sertifikat asli.
