# Brand — Sangkala Technology

Palet dan aturan visual untuk **brand perusahaan**: landing page,
materi tulisan, kartu nama, avatar. Berlaku untuk repo `sangkala-web`.

Untuk token aplikasi produk (status sertifikat, mode gelap, variabel
shadcn) lihat `TOKENS.md`. Keduanya berbagi warna primer yang sama,
supaya landing page dan screenshot produk di dalamnya terlihat satu
keluarga.

---

## Inti Brand

**Nama.** Sangkala, dari *sengkalan*: rangkaian kata penanda tahun dalam
tradisi Jawa. Perusahaan yang urusannya masa berlaku dan penanda waktu.

**Kesan yang dituju.** Tenang, teliti, institusional tapi tidak kaku.
Bukan startup yang berteriak, bukan firma konsultan yang dingin.

**Dua gagasan yang menurunkan seluruh palet:**

1. *Teal petrol gelap* sebagai warna utama. Tenang dan serius, dan
   menjauh dari biru korporat yang sudah dipakai hampir semua firma
   konsultan
2. *Sogan* (cokelat batik klasik) sebagai aksen tipis. Satu-satunya
   rujukan budaya di palet, dan yang membuat Sangkala tidak terbaca
   seperti template SaaS generik

---

## Warna Inti

Empat warna yang membentuk hampir seluruh tampilan.

| Peran | Nama | Hex | Dipakai untuk |
|---|---|---|---|
| Primer | Petrol | `#0D5C63` | Tombol utama, tautan, logo, ring fokus |
| Tinta | Ink | `#17181A` | Teks utama, judul |
| Kertas | Paper | `#FCFCFB` | Latar halaman |
| Aksen | Sogan | `#8A5A2B` | Detail kecil saja. Lihat batasnya di bawah |

Proporsi di satu layar kira-kira **kertas 70, tinta dan netral 20,
petrol 8, sogan 2**. Kalau sogan terasa dominan, terlalu banyak.

---

## Ramp Petrol

Ramp inilah yang membuat primer bisa dipakai di latar, garis, dan teks
tanpa menambah warna lain.

| Stop | Hex | Dipakai untuk |
|---|---|---|
| 50 | `#EEF6F6` | Latar seksi bertint |
| 100 | `#D9EBEC` | Latar kartu bertint, badge ringan |
| 200 | `#B3D6D8` | Garis bertint |
| 300 | `#85BABD` | Ilustrasi, ikon di latar gelap |
| 400 | `#4F9A9F` | Ikon, aksen di latar gelap |
| 500 | `#2A7C82` | Hover ringan |
| **600** | **`#0D5C63`** | **Primer** |
| 700 | `#0A4A50` | Hover tombol primer |
| 800 | `#083A3F` | Teks di atas latar petrol muda |
| 900 | `#052A2E` | Latar seksi gelap, footer |

---

## Ramp Netral

Sedikit hangat, bukan abu kebiruan, supaya berdampingan wajar dengan
sogan.

| Stop | Hex | Dipakai untuk |
|---|---|---|
| 0 | `#FFFFFF` | Kartu di atas kertas |
| 50 | `#FCFCFB` | **Kertas**, latar halaman |
| 100 | `#F2F3F1` | Latar seksi selang-seling |
| 200 | `#E3E5E2` | Garis, pemisah |
| 400 | `#9AA09C` | Placeholder, ikon redup |
| 600 | `#6B716E` | Teks sekunder |
| 700 | `#565C59` | Teks sekunder di atas netral 100 |
| 800 | `#2C312F` | Teks kuat |
| 900 | `#17181A` | **Ink**, teks utama |

---

## Ramp Sogan

Tiga stop saja. Ramp ini sengaja pendek karena sogan bukan warna kerja.

| Stop | Hex | Dipakai untuk |
|---|---|---|
| 50 | `#F3EADF` | Latar kecil: kutipan, catatan |
| 200 | `#E2CDB0` | Garis dekoratif, aksen di latar gelap |
| 600 | `#8A5A2B` | Aksen utama |
| 700 | `#5C3B1B` | Teks di atas sogan 50 |

### Batas pemakaian sogan

Sogan boleh untuk: garis tipis pemisah, ornamen kecil, nomor bagian
(01, 02, 03), label kecil, kutipan, dan tanda "konsep brand" di halaman
tentang.

Sogan **tidak** boleh untuk: tombol, tautan, badge, apa pun yang
berfungsi sebagai status, atau teks isi paragraf.

Alasannya praktis. Produk Sangkala Certify memakai merah, oranye,
kuning, biru, dan hijau untuk status sertifikat. Cokelat berada cukup
jauh dari kelimanya untuk tidak tertukar, dan **tetap harus dijaga
supaya tidak pernah dipakai sebagai penanda status**.

---

## Pasangan Warna yang Aman

Rasio kontras dihitung dengan rumus WCAG. Batas AA untuk teks biasa
adalah 4,5.

| Teks | Latar | Rasio | Keterangan |
|---|---|---|---|
| Ink | Paper | 17,3 | Teks utama |
| Petrol 600 | Paper | 7,5 | Tautan, judul bertint |
| Putih | Petrol 600 | 7,7 | Tombol primer |
| Putih | Petrol 700 | 10,0 | Tombol primer saat hover |
| Petrol 600 | Petrol 50 | 7,0 | Teks di kartu bertint |
| Petrol 800 | Petrol 100 | 10,1 | Badge ringan |
| Netral 600 | Paper | 4,9 | Teks sekunder, hanya di atas kertas |
| Sogan 600 | Paper | 5,7 | Label dan nomor bagian |
| Sogan 600 | Sogan 50 | 4,9 | Cukup, hanya untuk teks agak besar |
| Sogan 700 | Sogan 50 | 8,4 | Teks kecil di kotak sogan |
| Paper | Petrol 900 | 14,9 | Teks di seksi gelap |
| Petrol 300 | Petrol 900 | 7,1 | Teks sekunder di seksi gelap |
| Petrol 400 | Petrol 900 | 4,7 | Hanya untuk ikon dan teks besar |
| Sogan 200 | Petrol 900 | 9,9 | Aksen di seksi gelap |

**Satu jebakan.** Netral 600 di atas netral 100 hanya 4,5 lebih sedikit
sedikit, tepat di batas. Di seksi berlatar `#F2F3F1`, pakai netral 700
untuk teks sekunder.

---

## Tombol dan Tautan

| Elemen | Latar | Teks | Catatan |
|---|---|---|---|
| Tombol utama | Petrol 600 | Putih | Hover ke Petrol 700. **Satu per layar** |
| Tombol sekunder | Transparan, garis Netral 200 | Ink | Hover latar Netral 100 |
| Tautan | — | Petrol 600 | Garis bawah saat hover |
| Ring fokus | — | Petrol 600, 2px, jarak 2px | Jangan dimatikan |

Satu tombol utama per layar berlaku juga di landing page. Hero punya
satu ajakan bertindak. Kalau ada dua, tidak ada yang utama.

---

## Seksi Gelap

Landing page boleh punya satu atau dua seksi gelap (hero atau footer),
bukan mode gelap penuh. Mode gelap penuh ada di aplikasi produk, bukan
di sini.

- Latar Petrol 900 `#052A2E`
- Teks utama Paper, teks sekunder Petrol 300
- Aksen kecil Sogan 200
- Tombol utama: latar Paper, teks Petrol 900, supaya tetap menjadi satu
  titik paling terang di seksi itu

---

## Tipografi

Sama dengan produk, supaya keduanya satu keluarga.

| Peran | Font | Dipakai untuk |
|---|---|---|
| Serif | IBM Plex Serif (400) | Judul halaman publik. Tidak pernah bold. Lihat `DESIGN.md` |
| Sans | IBM Plex Sans | Teks isi, navigasi, tombol, dan semua UI aplikasi |
| Mono | IBM Plex Mono | Nomor bagian, label kecil, contoh nomor sertifikat dan hash |

Mono untuk nomor bagian "01", "02" dan label kecil adalah detail murah
yang langsung membedakan halaman ini dari template.

---

## Yang Dihindari

- Gradien. Brand ini datar
- Biru korporat. Itu bahasa visual firma konsultan
- Merah, oranye, kuning, hijau sebagai warna dekorasi. Semuanya sudah
  terpakai sebagai status di produk, dan screenshot produk di landing
  page akan menampilkannya
- Warna lebih dari tiga hue dalam satu seksi
- Stok foto orang berjabat tangan atau berdiri di depan laptop
- Teks putih di atas petrol 400 atau lebih terang
- Sogan sebagai warna isi

---

## CSS untuk Landing Page

Next.js dengan Tailwind v4. Letakkan di `app/globals.css`.

```css
@import "tailwindcss";

@theme {
  --color-paper: #FCFCFB;
  --color-ink: #17181A;

  --color-petrol-50: #EEF6F6;
  --color-petrol-100: #D9EBEC;
  --color-petrol-200: #B3D6D8;
  --color-petrol-300: #85BABD;
  --color-petrol-400: #4F9A9F;
  --color-petrol-500: #2A7C82;
  --color-petrol-600: #0D5C63;
  --color-petrol-700: #0A4A50;
  --color-petrol-800: #083A3F;
  --color-petrol-900: #052A2E;

  --color-stone-100: #F2F3F1;
  --color-stone-200: #E3E5E2;
  --color-stone-400: #9AA09C;
  --color-stone-600: #6B716E;
  --color-stone-700: #565C59;
  --color-stone-800: #2C312F;

  --color-sogan-50: #F3EADF;
  --color-sogan-200: #E2CDB0;
  --color-sogan-600: #8A5A2B;
  --color-sogan-700: #5C3B1B;

  --font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  --radius-md: 0.375rem;
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
}
```

Nama ramp netral memakai `stone` supaya tidak bentrok dengan `gray`
bawaan Tailwind. Kalau lebih suka menimpa `gray`, ganti saja awalannya.

---

## Logo

Belum dibuat, dan sebaiknya tidak dibuat dulu.

Untuk versi pertama landing page, pakai **wordmark teks**: "Sangkala"
dalam IBM Plex Sans medium, warna Petrol 600, huruf kecil semua atau
huruf kapital di awal saja. Selesai dalam lima menit dan terbaca bersih.

Logo bergambar baru dipertimbangkan setelah landing page online. Kalau
nanti dibuat, bentuknya harus bisa bertahan di ukuran favicon 16px dan
cukup satu warna.

---

## Daftar Periksa Sebelum Publikasi

- [ ] Hanya satu tombol utama per layar
- [ ] Tidak ada warna di luar tiga ramp di dokumen ini
- [ ] Sogan hanya muncul di detail kecil
- [ ] Semua teks lolos kontras 4,5, termasuk teks sekunder
- [ ] Tidak ada gradien
- [ ] Tidak ada status yang dibedakan hanya oleh warna
- [ ] Wordmark terbaca jelas di ukuran favicon
