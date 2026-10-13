"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Band } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { IndexList } from "@/components/ui/index-list";
import { Reveal } from "@/components/ui/reveal";

/** Satu-satunya seksi gelap di beranda. Menunjukkan bahwa Sangkala mengoperasikan platformnya sendiri. */
export default function PlatformBand() {
  const { language } = useLanguage();
  const id = language === "id";
  return (
    <Band tone="dark">
      <Reveal>
        <SectionIntro
          onDark
          number="04"
          eyebrow="Platform"
          title={id ? "Platform yang kami operasikan sendiri" : "A platform we operate ourselves"}
          lead={
            id
              ? "Metodologinya berjalan di atas perangkat lunak yang sama dengan yang dipakai klien."
              : "The methodology runs on the same software our clients use."
          }
        />
      </Reveal>
      <Reveal>
        <IndexList
          onDark
          columns={1}
          items={[
            {
              title: "Assessment Center",
              description: id
                ? "Proyek asesmen multi-peran: admin, asesor, klien, dan staf klien dalam satu ruang kerja."
                : "Multi-role assessment projects: admin, assessors, clients, and client staff in one workspace.",
              href: "/assessment-center",
            },
            {
              title: id ? "Verifikasi Sertifikat" : "Certificate Verification",
              description: id
                ? "Setiap sertifikat memuat kode QR menuju halaman verifikasi publik, tanpa login, lengkap dengan masa berlaku dan titik refreshment."
                : "Every certificate carries a QR code to a public verification page, no login, with validity and refreshment checkpoints.",
              href: "/verify",
            },
          ]}
        />
      </Reveal>
    </Band>
  );
}
