# Design — Sangkala Web (v2)

Arah desain frontend. Warna dan logo terkunci di [`BRAND.md`](BRAND.md);
dokumen ini mengatur tipografi, gerak, ilustrasi, komponen, dan pola halaman.

**Konteks.** Sangkala adalah perusahaan fiktif dan situs ini adalah proyek
portofolio full-stack. Pembaca terpentingnya recruiter dan engineer: situs
harus terasa hidup dan sekaligus membuktikan kemampuan teknis pembuatnya.

---

## Ringkasan Arah

v1 ("tenang, garis, tanpa gerak") terlalu monoton. v2 mempertahankan palet
dan logo, tetapi menambah energi:

1. **Imersif.** Setiap halaman dibuka dengan blok gelap Petrol 900 di bawah
   header transparan, berisi ilustrasi generatif yang bergerak pelan.
2. **Bergerak dengan tujuan.** Judul naik kata per kata, angka menghitung
   naik, teks "menyala" mengikuti scroll, tab berganti otomatis, metodologi
   bergeser horizontal. Setiap gerak bisa dijeda atau dimatikan.
3. **Bukti, bukan klaim.** Screenshot aplikasi yang benar-benar berjalan
   (Assessment Center, pengingat sertifikasi, verifikasi) dan halaman studi
   kasus `/tentang-proyek` untuk pembaca teknis.
4. **Ilustrasi milik sendiri.** Tanpa foto stok; gambar dibuat oleh kode
   (`Pattern`, `OrbitCanvas`) dari palet brand, deterministik per halaman.

---

## Batas yang Tetap Berlaku

- Palet petrol, sogan, netral dan logo dari `BRAND.md`
- Tidak ada **gradien warna**. Fade transparansi (`mask-image`, fade canvas)
  hanya untuk melembutkan tepi ilustrasi
- Sogan tidak untuk tombol, tautan, atau status
- Batas anti-mirip PwC: tanpa jajar genjang/pita diagonal di atas foto, tanpa
  garis pendek berwarna di atas kartu, tanpa tombol bersudut 0 berteks hitam,
  tanpa font Charter/Helvetica, tanpa menyalin nama seksi atau kalimat
- Klien, testimoni, dan angka di beranda adalah contoh fiktif dan diberi label

---

## Tipografi

Fluid dengan `clamp()`; kelas di `globals.css`.

| Kelas | Ukuran | Dipakai untuk |
|---|---|---|
| `type-hero` | 44 → 100px | Judul hero beranda dan konsep nama |
| `type-display` | 40 → 80px | Judul halaman dalam, judul seksi utama |
| `type-h1` | 36 → 68px | Pernyataan besar, judul seksi sekunder |
| `type-h2` | 30 → 52px | Kutipan testimoni, judul blok |
| `type-card` | 20 → 24px | Judul kartu |
| `type-lead` | 17 → 21px | Paragraf pembuka |
| `type-meta` | 12px Mono kapital | Label, nomor seksi, meta |

Serif (IBM Plex Serif 400) untuk judul, tidak pernah bold. Kata penekanan
boleh miring berwarna Sogan 200 di atas latar gelap (mis. *tangguh.*).

---

## Gerak

| Pola | Komponen | Catatan |
|---|---|---|
| Kata naik saat halaman dimuat | `RiseText` | CSS murni, tetap jalan tanpa JS |
| Kata berganti di judul | `RotatingWord` | Lebar stabil; pembaca layar membaca kata pertama |
| Muncul saat masuk layar | `Reveal` | Terlihat di HTML server; hanya elemen di bawah layar yang disembunyikan |
| Angka menghitung naik | `CountUp` | HTML server berisi angka akhir |
| Pita berjalan | `Marquee` | Berhenti saat hover |
| Teks menyala mengikuti scroll | `Statement` | Opasitas minimum 0,5 (kontras ≥ 3:1) |
| Scroll horizontal tersemat | `MethodScroll` | Desktop saja; mobile dan reduced motion bertumpuk |
| Bingkai miring lalu tegak | `PlatformShowcase` | `rotateX` mengikuti scroll |
| Panel melebar | `IndustryPanels` | Hover dan fokus keyboard |
| Hero orbit interaktif | `OrbitCanvas` | Canvas 2D, berhenti di luar layar, tombol jeda |

Wajib: `prefers-reduced-motion` mematikan semua animasi; konten tidak pernah
bergantung pada JavaScript untuk terlihat; setiap animasi otomatis bisa
dijeda (hover, fokus, atau tombol).

---

## Header dan Footer

- Header tetap, transparan dengan lapisan Petrol 900/40 di atas blok gelap,
  menjadi solid (kertas + blur) setelah scroll, bersembunyi saat scroll turun
  dan muncul saat naik. Halaman dengan sisi terang di atas (login asesmen)
  memaksa header solid
- Dropdown berupa panel dengan judul dan deskripsi
- Menu mobile layar penuh gelap dengan tautan serif besar
- Footer: pernyataan besar + email, kolom tautan, wordmark raksasa samar

---

## Komponen Utama

| Komponen | Lokasi |
|---|---|
| `PageHeader` (gelap, breadcrumb, ilustrasi, `aside`) | `ui/layout.tsx` |
| `Pattern` (orbits, rings, grid, waves, bars, arcs) | `art/Pattern.tsx` |
| `OrbitCanvas`, `RotatingWord`, `RiseText`, `CountUp`, `Marquee` | `motion/` |
| `InsightCard` (sampul gambar atau ilustrasi dari judul) | `ui/insight-card.tsx` |
| `BrowserFrame` | `home/BrowserFrame.tsx` |
| `ClosingCTA` (Petrol 600 penuh) | `sections/ClosingCTA.tsx` |
| `Button` dengan `href` (merender `<a>`) | `ui/button.tsx` |

---

## Pola Halaman

**Beranda:** hero orbit → marquee klien (fiktif) → pernyataan menyala +
angka → tab tiga pilar → metodologi horizontal → showcase platform → panel
industri → slider testimoni → insight → CTA → footer.

**Halaman dalam:** `PageHeader` gelap → isi dengan blok bergantian kertas /
stone 100 / Petrol 900 → `ClosingCTA`. Layanan memakai panel ilustrasi yang
menempel; Industri memakai banner per sektor; Metodologi memakai lini masa
yang terisi mengikuti scroll; Program memakai sampul ilustrasi bergantian.

**`/tentang-proyek`:** angka nyata dari codebase, fitur yang berjalan,
diagram arsitektur, stack. Nama dan tautan pembuat diisi di
`projectAuthor` (`src/lib/site-content.ts`); kosong berarti disembunyikan.

**Screenshot produk** ada di `public/showcase/*.webp` (diambil dari aplikasi
yang berjalan dengan data demo). Ambil ulang bila tampilan aplikasi berubah.

---

## Daftar Periksa

- [ ] Tanpa scroll horizontal di 390px
- [ ] Nol pelanggaran axe (WCAG 2.1 AA) di desktop dan mobile
- [ ] Tanpa hydration mismatch (koordinat SVG dibulatkan 2 desimal)
- [ ] Reduced motion: semua animasi berhenti, metodologi bertumpuk
- [ ] Tanpa JavaScript: judul, pernyataan, dan isi `Reveal` terlihat
- [ ] Teks di atas ilustrasi punya latar Petrol 900 eksplisit di wadahnya
