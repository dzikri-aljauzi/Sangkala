# Design — Sangkala Web

Arah desain untuk refactor frontend. Dokumen ini menentukan **cara halaman
disusun dan terasa**: tipografi, ruang, grid, komponen, pola halaman.

**Warna dan logo tidak diatur di sini.** Keduanya terkunci di
[`BRAND.md`](BRAND.md) dan tidak berubah oleh refactor ini. Kalau ada
yang bertentangan, `BRAND.md` menang untuk warna dan logo, dokumen ini
menang untuk yang lain.

---

## Ringkasan Arah

Dari **"landing page startup yang rapi"** ke **"firma penasihat yang
menerbitkan pemikiran"**.

Situs sekarang terbaca seperti template SaaS: setiap isi dibungkus kartu
berbayang dengan ikon dalam kotak petrol, semua judul sama tebal dan sama
besar, hero penuh elemen kecil. Klien Sangkala adalah direksi bank, BUMN,
dan universitas. Mereka membaca situs ini seperti membaca laporan:
mencari struktur, bukti, dan ketenangan.

Tiga perubahan inti:

1. **Tipografi editorial.** Judul memakai serif berbobot normal, isi
   memakai sans dengan baris lega. Hierarki lahir dari ukuran dan jenis
   huruf, bukan dari tebal dan kotak.
2. **Garis, bukan kartu.** Struktur dibentuk oleh garis tipis dan ruang
   kosong. Bayangan dan kotak berwarna hampir hilang dari halaman publik.
3. **Satu fokus per layar.** Satu judul, satu ajakan bertindak, satu
   visual. Sisanya diam.

---

## Referensi dan Apa yang Diambil

Referensi: PwC Global, diamati langsung pada Oktober 2026 dengan
Playwright di 1440px dan 390px (`/gx/en/industries.html`,
`/industries/financial-services.html`, `/services/risk.html`, beranda).

Yang diambil adalah **prinsip**, bukan bentuk. Tabel di bawah mencatat apa
yang diamati, prinsip di baliknya, dan versi Sangkala yang sengaja dibuat
berbeda.

| Diamati di PwC | Prinsip | Versi Sangkala |
|---|---|---|
| Judul serif berbobot normal (55/65px, 38/49px), isi sans 16px dengan line-height 1,7 | Kontras serif dan sans memberi kesan editorial tanpa perlu tebal | IBM Plex Serif untuk judul, satu keluarga dengan Plex Sans dan Plex Mono yang sudah dipakai. Skala sendiri (lihat Tipografi) |
| Hampir tidak ada bayangan atau radius. Struktur dari garis 1px abu terang | Garis lebih tenang daripada kartu | Garis `stone-200`, radius kecil 6px dipertahankan dari `BRAND.md` supaya tidak sekaku PwC |
| Daftar industri dan layanan sebagai baris link penuh lebar, dua kolom, berpanah | Daftar panjang lebih mudah dipindai sebagai indeks daripada grid kartu | **Indeks bernomor**: nomor Mono di kiri, garis bawah saja per baris, tanpa kotak per baris |
| Satu warna aksen untuk semua ajakan bertindak, latar netral di sekitarnya | Aksen langka berarti setiap aksen bermakna | Petrol 600 untuk tombol utama, sesuai `BRAND.md`. Satu per layar |
| Navigasi atas pendek (5 item) dengan baris utilitas kecil di atasnya | Navigasi utama hanya untuk keputusan besar | 5 item utama, baris utilitas berisi bahasa, **Verifikasi Sertifikat**, dan **Portal** (fungsi khas Sangkala) |
| Halaman layanan panjang punya navigasi dalam-halaman yang menempel di atas | Pembaca halaman panjang perlu peta | Navigasi dalam-halaman untuk Layanan dan Metodologi, berupa rail di kiri pada desktop |
| Meta kecil di atas judul kartu (tanggal, jenis, waktu baca) | Konteks sebelum klik | Meta dalam Plex Mono huruf kapital, sudah jadi ciri `BRAND.md` |
| Lebar teks dibatasi sekitar 900px walau container 1340px | Baris teks pendek lebih mudah dibaca | Ukuran baca maksimal 68 karakter (sekitar 680px) |

### Batas Anti-Mirip

Bagian ini mengikat. Situs ini portofolio. Kalau seseorang melihatnya
dan teringat PwC, refactor gagal.

**Jangan pernah dipakai:**

- Bentuk jajar genjang, pita diagonal, atau bentuk geometris apa pun yang
  ditumpuk di atas foto. Itu tanda tangan visual PwC
- Garis pendek berwarna di atas kartu studi kasus (pola "dash lalu
  tanggal")
- Panel judul hero abu yang menempel di bawah foto besar
- Tombol berlatar penuh dengan teks hitam dan sudut 0
- Tab vertikal yang item aktifnya diisi warna aksen penuh
- Laci "Get in touch" yang menempel di bawah layar
- Latar pita berwarna peach atau oranye muda
- Foto stok orang tersenyum di depan laptop atau tablet. `BRAND.md`
  sudah melarang ini
- Font Charter, Georgia, atau Helvetica Neue
- Menyalin kalimat, struktur judul, atau nama seksi PwC
  ("Featured insights", "Explore our industry expertise", dan
  sejenisnya). Tulis sendiri dalam bahasa Sangkala

**Yang membuat Sangkala tetap Sangkala:**

- Palet petrol dan sogan dari `BRAND.md`
- **Plex Mono untuk penomoran dan meta**: `01`, `02`, nomor sertifikat,
  tanggal
- **Motif waktu**: cincin dan garis tik dari `time-rings.tsx`,
  disederhanakan menjadi satu elemen tenang, bukan ilustrasi ramai.
  Merujuk ke *sengkalan*, penanda tahun
- **Metodologi lima langkah** (Assess, Design, Build, Embed, Sustain)
  sebagai struktur berulang yang tidak dimiliki firma lain
- **Bukti produk**: Assessment Center dan verifikasi sertifikat
  ditampilkan sebagai sesuatu yang benar-benar dioperasikan, bukan
  sekadar layanan

---

## Masalah Situs Sekarang

Diamati dari screenshot lokal pada 1440px dan 390px.

| Masalah | Lokasi | Arah perbaikan |
|---|---|---|
| Semua isi dalam kartu putih berbayang (`shadow-xl`, `rounded-xl`) dengan ikon dalam kotak petrol | `ui/card.tsx`, `sections/*` | Ganti dengan garis dan indeks bernomor |
| Semua judul 48px bold, sehingga H1 dan H2 tidak berbeda | Beranda | Skala tipografi baru, judul serif berbobot normal |
| Hero memuat chip People/Process/Technology, ilustrasi orbit, label 01–05, dan "Dipercaya oleh" sekaligus | `sections/Hero.tsx` | Satu judul, satu paragraf, satu tombol, satu visual |
| Dua tombol utama di layar pertama ("Daftar Sekarang" di navbar dan "Konsultasi Gratis" di hero) | `layout/Navbar.tsx`, `Hero.tsx` | Tombol navbar menjadi tombol sekunder |
| Navigasi 9 item | `layout/Navbar.tsx` | 5 item. Insight dan News & Article digabung, Metodologi masuk ke Layanan |
| Ajakan bertindak penutup muncul dua kali berturut-turut | `CTASection.tsx` dan footer | Satu blok penutup saja |
| Seksi gelap memakai `stone-800` (abu kehitaman), bukan Petrol 900. Terlihat di halaman Layanan | `ui/section.tsx`, varian `dark` | Petrol 900 sesuai `BRAND.md` |
| Isi dirender tersembunyi (`opacity: 0`) sampai animasi scroll berjalan, sehingga seksi tampak kosong tanpa JavaScript, saat dicetak, dan bagi crawler. Pola `initial="hidden"` + `whileInView` tertulis langsung di sekitar 35 file (halaman, `sections/*`, dashboard). `ui/animated.tsx` adalah kode mati dan sudah dihapus | Halaman dan `sections/*` | Pakai `<Reveal>` (`ui/reveal.tsx`): terlihat di HTML server, hanya elemen di bawah layar yang disembunyikan sebentar. Migrasi per halaman di fase 1–3 |
| Efek hover angkat kartu (`hover:-translate-y-1`, `hover:shadow-2xl`) | `ui/card.tsx` | Hover hanya mengubah warna garis atau teks |
| Klaim angka (99% kepuasan, ISO 9001, 15.000+) tanpa sumber yang terlihat | `ValueMetrics.tsx` | Tampilkan hanya angka yang bisa disebut sumbernya. Lihat `PRODUCT.md` |

---

## Tipografi

| Peran | Font | Ukuran / line-height (desktop) | Mobile | Bobot |
|---|---|---|---|---|
| Display | IBM Plex Serif | 60 / 66 | 38 / 44 | 400 |
| H1 | IBM Plex Serif | 46 / 54 | 34 / 40 | 400 |
| H2 | IBM Plex Serif | 34 / 42 | 27 / 34 | 400 |
| H3 | IBM Plex Sans | 21 / 30 | 19 / 28 | 600 |
| Judul kartu | IBM Plex Serif | 22 / 30 | 20 / 28 | 400 |
| Lead | IBM Plex Sans | 19 / 32 | 17 / 28 | 400 |
| Isi | IBM Plex Sans | 16 / 27 | 16 / 27 | 400 |
| Kecil | IBM Plex Sans | 14 / 22 | 14 / 22 | 400 |
| Label / meta | IBM Plex Mono | 12 / 16, huruf kapital, tracking 0,08em | sama | 500 |
| Navigasi | IBM Plex Sans | 15 / 24 | 17 / 26 di menu mobile | 500 |

Aturan:

- Judul serif **tidak pernah bold**. Tekanan datang dari ukuran
- Display hanya untuk H1 di beranda. Halaman lain mulai dari H1
- Paragraf maksimal 68 karakter (`max-w-[68ch]`)
- Teks isi `ink`, teks sekunder `stone-600` (di atas `stone-100` pakai
  `stone-700`, lihat jebakan kontras di `BRAND.md`)
- Tracking judul serif `-0.01em` untuk Display dan H1, `normal` untuk
  yang lain

`BRAND.md` saat ini hanya mencantumkan Plex Sans dan Plex Mono. Plex Serif
ditambahkan di fase 0 sebagai anggota ketiga keluarga yang sama, dan
tabel tipografi di `BRAND.md` diperbarui setelah disetujui.

---

## Ruang dan Grid

**Container**

| Token | Nilai |
|---|---|
| Lebar isi maksimal | 1240px |
| Gutter | 20px mobile, 32px tablet, 48px desktop |
| Kolom | 12 kolom, gap 24px desktop, 16px mobile |
| Ukuran baca | 68ch |

**Ritme vertikal** (basis 4px)

| Jarak | Desktop | Mobile |
|---|---|---|
| Padding seksi | 112px | 72px |
| Header seksi ke isi | 48px | 32px |
| Antar blok dalam seksi | 64px | 40px |
| Judul ke paragraf | 16px | 12px |
| Paragraf ke tombol | 32px | 24px |

**Header seksi standar.** Label Mono (opsional, sogan 600 atau petrol
600), lalu H2 serif, lalu paragraf lead maksimal dua kalimat. Rata kiri,
selalu. Judul seksi rata tengah hanya untuk blok penutup.

**Latar seksi.** Kertas sebagai default. `stone-100` untuk selang-seling,
maksimal satu kali berturut-turut. Petrol 900 untuk paling banyak satu
seksi per halaman, ditambah footer.

---

## Bentuk, Garis, Gerak

| Hal | Aturan |
|---|---|
| Radius | 6px untuk tombol, input, kartu. 0 untuk baris indeks dan pemisah |
| Garis | 1px `stone-200`. Garis penekanan 1px `ink` (misalnya di atas header tabel) |
| Bayangan | Tidak ada di halaman publik. Hanya untuk dropdown, popover, dialog |
| Hover link dan baris | Warna teks ke petrol 600, panah bergeser 4px ke kanan. 150ms |
| Hover tombol | Perubahan warna latar saja. 150ms |
| Reveal saat scroll | Opsional. Fade dan geser 8px, sekali saja, 300ms. Isi tetap terlihat tanpa JavaScript |
| `prefers-reduced-motion` | Semua gerak dimatikan |

---

## Komponen

### Header

- Tinggi 72px, latar kertas, garis bawah `stone-200`. Menempel saat
  scroll tanpa bayangan
- **Baris utilitas** 32px di atasnya (hanya desktop): kiri kosong, kanan
  `Verifikasi Sertifikat` · `Portal` · pemilih bahasa `ID / EN`. Teks
  kecil `stone-600`
- Wordmark di kiri. Lima item navigasi di tengah-kiri: **Layanan,
  Industri, Program, Insight, Tentang**
- Kanan: tombol **sekunder** "Hubungi Kami". Tombol utama milik isi
  halaman, bukan header
- Item aktif: teks ink dengan garis bawah 2px petrol 600 setebal baris
  header
- Mobile: wordmark, ikon pencarian (kalau ada), ikon menu. Menu terbuka
  sebagai panel layar penuh berisi daftar indeks besar

### Tombol

| Varian | Tampilan | Pemakaian |
|---|---|---|
| Utama | Latar petrol 600, teks putih, tinggi 48px, padding 0 24px, 15px 600, radius 6px | Satu per layar |
| Sekunder | Garis 1px ink, teks ink, latar transparan. Hover latar `stone-100` | Ajakan pendamping |
| Teks | Teks petrol 600 600 dengan panah →, tanpa garis. Hover garis bawah | Di dalam blok, "Selengkapnya" |
| Di seksi gelap | Latar kertas, teks petrol 900 | Sesuai `BRAND.md` |

Tidak ada tombol ikon panah di dalam lingkaran, tidak ada tombol bergradien.

### Indeks Bernomor

Pengganti grid kartu untuk daftar layanan, industri, dan program.

```
01   Program Kepemimpinan Eksekutif & Board              →
─────────────────────────────────────────────────────────────
02   Pengembangan Budaya Compliance & Risiko              →
─────────────────────────────────────────────────────────────
```

- Nomor Plex Mono 13px `stone-600`, lebar tetap 48px
- Judul Plex Sans 18px 500 ink. Deskripsi opsional satu baris 14px
  `stone-600` di bawahnya
- Garis bawah 1px `stone-200` per baris, garis atas 1px ink di baris
  pertama
- Tinggi minimum 64px. Seluruh baris bisa diklik
- Hover: judul ke petrol 600, panah bergeser 4px
- Dua kolom di desktop kalau lebih dari 6 item, satu kolom di mobile

### Kartu Insight

Untuk artikel, whitepaper, webinar, dan studi kasus. **Teks dulu**, karena
Sangkala tidak punya perpustakaan foto dan `BRAND.md` melarang foto stok.

- Tanpa latar dan bayangan. Garis atas 1px `stone-200`, padding atas 20px
- Meta Plex Mono: `WHITEPAPER · 12 MAR 2026 · 8 MENIT`
- Judul Plex Serif 22px, maksimal 3 baris
- Ringkasan 15px `stone-600`, maksimal 2 baris
- Gambar opsional rasio 3:2 di atas meta, radius 6px. Kalau tidak ada
  gambar, tidak ada placeholder
- Grid 3 kolom, gap 32px. Satu kartu unggulan boleh selebar 2 kolom

### Rail Navigasi Dalam-Halaman

Untuk halaman panjang (Layanan, Metodologi, Program).

- Desktop: kolom kiri 240px, menempel di bawah header. Daftar anchor 14px
  `stone-600`, item aktif ink dengan garis kiri 2px petrol 600
- Mobile: baris anchor yang bisa digeser horizontal di bawah header,
  item aktif bergaris bawah petrol
- Tidak ada latar berwarna pada item aktif

### Langkah Metodologi

Komponen khas Sangkala. Dipakai di beranda, Metodologi, dan Program.

- Lima kolom di desktop, vertikal di mobile
- Nomor Plex Mono `01`–`05` sogan 600, garis tipis `sogan-200` yang
  menyambung antarnomor (detail sogan yang diizinkan `BRAND.md`)
- Judul langkah H3, deskripsi 15px maksimal 3 baris

### Angka Bukti

- Angka Plex Serif 46px ink, keterangan 14px `stone-600` di bawahnya
- Sumber atau periode dalam Plex Mono 12px (`SUMBER: LAPORAN TAHUNAN
  2025`). Tanpa sumber, angka tidak ditampilkan
- Dipisah garis vertikal `stone-200`, tanpa ikon, tanpa kartu

### Testimoni

- Kutipan Plex Serif 22px/34px, latar kertas, tanpa tanda kutip raksasa
- Nama 15px 600, jabatan dan institusi 14px `stone-600`
- Satu kutipan besar per layar dengan navigasi sederhana, atau tiga
  kolom tanpa kartu. Bukan carousel otomatis

### Strip Logo Klien

- Logo grayscale, opasitas 70%, tinggi seragam 32px. Warna asli saat
  hover
- Grid statis 6 kolom di desktop, bukan marquee berjalan
- Label Mono di atasnya, misalnya `DIPERCAYA OLEH 40+ INSTITUSI`

### Form (Kontak, Registrasi Pelatihan)

- Label di atas field, 14px 500. Penanda wajib berupa teks "(wajib)",
  bukan hanya tanda bintang merah
- Field tinggi 48px, garis 1px `stone-200`, radius 6px. Fokus memakai
  ring petrol `BRAND.md`
- Dua kolom di desktop untuk pasangan pendek (nama depan dan belakang),
  satu kolom di mobile
- Pesan error 14px di bawah field, dengan ikon dan teks, bukan hanya
  warna

### Footer

- Latar Petrol 900, teks kertas, sekunder petrol 300
- Atas: wordmark dan satu kalimat posisi, lalu 3 kolom link (Layanan,
  Perusahaan, Sumber Daya)
- Bawah: garis `petrol-800`, hak cipta, legal, tautan Portal
- Tidak ada blok ajakan bertindak di dalam footer

---

## Pola Halaman

### Beranda

| # | Seksi | Isi | Latar |
|---|---|---|---|
| 1 | Hero | Label Mono, Display serif, lead dua kalimat, satu tombol utama ditambah satu tombol teks. Kanan: satu motif cincin waktu yang tenang | Kertas |
| 2 | Bukti klien | Strip logo klien | Kertas, garis atas |
| 3 | Apa yang kami kerjakan | Header seksi, tiga kolom People/Process/Technology, masing-masing berisi indeks pendek 3–4 baris | Kertas |
| 4 | Cara kami bekerja | Langkah Metodologi 01–05 | `stone-100` |
| 5 | Industri | Tiga blok teks besar: Perbankan, BUMN, Fintech, masing-masing dengan satu kalimat dan tombol teks | Kertas |
| 6 | Platform | Assessment Center dan Verifikasi Sertifikat, dengan screenshot produk asli | Petrol 900 |
| 7 | Suara klien | Testimoni | Kertas |
| 8 | Insight | Tiga kartu insight terbaru | Kertas |
| 9 | Penutup | Satu kalimat dan satu tombol utama, rata tengah | `petrol-50` |
| 10 | Footer | | Petrol 900 |

### Layanan

- Header halaman: label Mono, H1, lead
- Rail navigasi dalam-halaman di kiri (People, Process, Technology,
  Integrasi)
- Setiap pilar: H2, paragraf, indeks bernomor layanan. Bukan grid kartu
- Integrasi lintas pilar sebagai tabel sederhana atau indeks, di latar
  Petrol 900

### Industri

- Satu halaman, tiga seksi (Perbankan, BUMN, Fintech) dengan rail kiri
- Setiap seksi: tantangan utama (3 poin), layanan yang relevan (indeks),
  satu studi kasus atau testimoni

### Program dan Info Pelatihan

- Daftar pelatihan sebagai tabel indeks: tanggal (Mono), judul, format,
  status pendaftaran
- Filter sebagai baris tombol sekunder kecil di atas daftar
- Detail pelatihan: kolom isi 8/12, kolom samping 4/12 yang menempel
  berisi jadwal, harga, dan satu tombol daftar

### Insight

- Satu artikel unggulan selebar 2 kolom, lalu grid kartu insight
- Filter jenis (Artikel, Whitepaper, Webinar, Studi Kasus) sebagai tab
  bergaris bawah
- Halaman artikel: ukuran baca 68ch, H1 serif, meta Mono, isi 18px/32px

### Kontak

- Dua kolom: kiri informasi (alamat, email, telepon, jam), kanan form
- Tanpa peta tertanam kecuali alamat asli tersedia

### Verifikasi Sertifikat (`/verify/[id]`)

Halaman publik paling sensitif soal kepercayaan.

- Status di paling atas dalam satu kalimat besar dengan ikon dan teks.
  Misalnya "Sertifikat ini sah dan berlaku hingga 12 Maret 2028". Status
  tidak boleh hanya dibedakan warna
- Data sertifikat sebagai daftar definisi dua kolom: nama, program,
  tanggal terbit, masa berlaku, nomor (Mono)
- Lini waktu `Terbit → Refreshment I → Refreshment II → Kedaluwarsa`
  dengan posisi saat ini
- Hash verifikasi dalam Mono di bawah, kecil
- Dua halaman verifikasi hardcoded dipindah ke template `[id]` yang sama

### Assessment Center dan Admin

Fase 5 dan 6 hanya menerima **token** dari dokumen ini: font, warna,
radius, garis, gerak. Struktur dashboard tidak berubah sampai ada
referensi pola sendiri. Pengecualian: kartu berbayang di dashboard boleh
tetap ada sampai fase itu dikerjakan.

---

## Token untuk `globals.css`

Tambahan dan perubahan terhadap `@theme` yang sudah ada. Warna tidak
berubah.

```css
@theme inline {
  --font-serif: var(--font-plex-serif), ui-serif, Georgia, serif;
  --font-display: var(--font-serif);
  --font-heading: var(--font-serif);

  --text-display: 3.75rem;    --text-display--line-height: 4.125rem;
  --text-h1: 2.875rem;        --text-h1--line-height: 3.375rem;
  --text-h2: 2.125rem;        --text-h2--line-height: 2.625rem;
  --text-h3: 1.3125rem;       --text-h3--line-height: 1.875rem;
  --text-card: 1.375rem;      --text-card--line-height: 1.875rem;
  --text-lead: 1.1875rem;     --text-lead--line-height: 2rem;
  --text-body: 1rem;          --text-body--line-height: 1.6875rem;
  --text-meta: 0.75rem;       --text-meta--line-height: 1rem;

  --container-content: 77.5rem;  /* 1240px */
  --container-prose: 68ch;

  --radius: 0.375rem;            /* 6px, menggantikan 0.5rem */
}
```

Font dimuat di `app/layout.tsx` lewat `next/font/google`:
`IBM_Plex_Serif` dengan bobot 400 dan 400 italic, variabel
`--font-plex-serif`.

**Status fase 0 (diterapkan).** Token ada di `globals.css` sebagai kelas
`type-display`, `type-h1`, `type-h2`, `type-h3`, `type-card`, `type-lead`,
`type-meta`, dan `prose-width` (ukuran mobile dan desktop sudah di dalamnya),
bukan sebagai utilitas `text-*`. `--font-heading` sengaja tidak diubah karena
dipakai dialog yang dibagi dengan admin.

---

## Urutan Pengerjaan

| Fase | Isi | Selesai jika |
|---|---|---|
| 0 | Token di atas, Plex Serif, komponen dasar (`Button`, `IndexList`, `InsightCard`, `SectionHeader`, `Rail`), perbaikan `animated.tsx` | Komponen ada dan dipakai minimal di satu halaman |
| 1 | Header, baris utilitas, menu mobile, footer | Navigasi 5 item, satu tombol utama per layar |
| 2 | Beranda, Layanan, Industri, Tentang, Metodologi, Kontak | Tidak ada `Card` berbayang tersisa di halaman publik |
| 3 | Insight, artikel, info pelatihan | Kartu insight dan tabel pelatihan memakai komponen fase 0 |
| 4 | Verifikasi sertifikat | Halaman hardcoded hilang, status terbaca tanpa warna |
| 5–6 | Assessment Center, admin | Token saja, lalu referensi pola terpisah |

## Daftar Periksa per Halaman

- [ ] Satu tombol utama per layar, termasuk header
- [ ] Judul serif tidak bold
- [ ] Tidak ada bayangan di halaman publik
- [ ] Tidak ada elemen dari daftar Batas Anti-Mirip
- [ ] Isi terlihat dengan JavaScript dimatikan
- [ ] Paragraf tidak lebih lebar dari 68ch
- [ ] Setiap angka bukti punya sumber
- [ ] Kontras teks lolos 4,5 (lihat tabel pasangan warna di `BRAND.md`)
- [ ] Layout benar di 390px tanpa scroll horizontal
