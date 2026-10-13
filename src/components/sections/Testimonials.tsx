"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Band } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { Reveal } from "@/components/ui/reveal";

// Klien dan testimoni fiktif untuk keperluan portofolio. Label "fiktif" tidak boleh dihapus.
const testimonials = [
  {
    quote:
      "Sangkala membantu kami merapikan proses penerbitan dan verifikasi sertifikat pelatihan. Pengingat masa berlaku membuat tidak ada lagi sertifikat yang lapse tanpa disadari.",
    author: "Contoh Klien A",
    position: "Kepala Divisi Manajemen Risiko",
    company: "Bank Contoh (fiktif)",
  },
  {
    quote:
      "Alur assessment center-nya jelas untuk setiap peran. Asesor, admin, dan peserta bisa menjalankan bagiannya tanpa saling menunggu.",
    author: "Contoh Klien B",
    position: "Kepala SDM",
    company: "BUMN Contoh (fiktif)",
  },
  {
    quote:
      "Kerangka People, Process, Technology yang dipakai Sangkala membuat program pelatihan kami terhubung langsung dengan proses dan sistem yang berjalan.",
    author: "Contoh Klien C",
    position: "Wakil Ketua Bidang Akademik",
    company: "Universitas Contoh (fiktif)",
  },
];

const clients = [
  "Bank Contoh A",
  "Bank Contoh B",
  "Bank Contoh C",
  "BUMN Contoh A",
  "BUMN Contoh B",
  "Universitas Contoh A",
  "Universitas Contoh B",
  "Fintech Contoh A",
  "Asosiasi Contoh A",
  "Lembaga Contoh A",
];

export default function Testimonials() {
  const { language } = useLanguage();
  const id = language === "id";
  return (
    <Band tone="stone" id="testimonials">
      <Reveal>
        <SectionIntro
          number="05"
          eyebrow={id ? "Klien" : "Clients"}
          title={id ? "Klien & Testimoni" : "Clients & Testimonials"}
          lead={
            id
              ? "Kepercayaan dan apresiasi dari para pemimpin industri yang telah bermitra dengan kami."
              : "Trust and appreciation from industry leaders who have partnered with us."
          }
        />
      </Reveal>
      <Reveal>
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
          {testimonials.map((tm) => (
            <figure key={tm.author} className="flex flex-col border-t border-ink pt-6">
              <blockquote className="font-serif text-[1.1875rem] leading-[1.7] text-ink">
                &ldquo;{tm.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6">
                <span className="block text-[0.9375rem] font-semibold text-ink">{tm.author}</span>
                <span className="block text-sm text-stone-700">{tm.position}</span>
                <span className="block text-sm text-stone-700">{tm.company}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <div className="mt-16 border-t border-stone-200 pt-8">
          <p className="type-meta mb-6 text-stone-700">
            {id ? "Contoh klien (fiktif, untuk portofolio)" : "Sample clients (fictional, for portfolio)"}
          </p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
            {clients.map((c) => (
              <li key={c} className="font-mono text-sm text-stone-700">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Band>
  );
}
