# Halaman Verifikasi Sertifikat & QR Code (Bank BPD Bali & Bank BPD DIY)

**Tanggal**: 2026-07-10
**PIC**: Dzikri

---

## Ringkasan
Permintaan lanjutan (sama seperti kasus sertifikat Bank BPD DIY sebelumnya, lihat [[changelog-2026-07-10-certificate-verify-qr-dzikri]]): sertifikat pelatihan "Risiko Bisnis" untuk peserta Bank BPD Bali dan Bank BPD DIY perlu QR code yang tersambung ke website LNA dan menampilkan keterangan verifikasi. Dibuatkan halaman statis (tanpa database) dan QR code dengan pola yang sama seperti sertifikat sebelumnya.

---

## Apa yang Berubah

### 1. Halaman Verifikasi Statis
- Route baru: `src/app/(verify)/verify/bpd-bali-diy-risiko-bisnis-2026/page.tsx`.
- Data sertifikat hardcode: program "Pelatihan Risiko Bisnis", instansi "Bank BPD Bali dan Bank BPD DIY", tanggal terbit 11 Juli 2026.
- Menggunakan struktur & gaya visual yang sama dengan halaman verifikasi sebelumnya (`verify/bpd-diy-syariah-2026`), mengikuti layout `(verify)` yang sudah diperbaiki (tanpa nested `<html>`).
- URL setelah deploy: `https://leadershipnasionalasia.com/verify/bpd-bali-diy-risiko-bisnis-2026`.

### 2. QR Code
- File `public/qr/bpd-bali-diy-risiko-bisnis-2026.png` (1024×1024, error-correction tinggi) berisi tautan ke halaman verifikasi di atas.
- Setelah deploy juga bisa diunduh langsung dari `https://leadershipnasionalasia.com/qr/bpd-bali-diy-risiko-bisnis-2026.png`.

---

## Dampak
- **Flow bisnis**: Sama seperti sertifikat sebelumnya — tidak perlu proses admin/database, cukup deploy halaman statis + cetak QR code.
- **Kompatibilitas**: Tidak memengaruhi halaman verifikasi lain (baik statis maupun berbasis database).
- **Breaking changes**: Tidak ada.
- **Catatan**: Nama kedua bank ("Bank BPD Bali", "Bank BPD DIY") dan tanggal terbit (11 Juli 2026) di-hardcode di halaman — perlu dicek ulang penulisan resminya sebelum QR code dicetak ke sertifikat asli.
