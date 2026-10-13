"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

// Testimoni fiktif untuk portofolio. Label "fiktif" tidak boleh dihapus.
const testimonials = [
  {
    quote: "Sangkala membantu kami merapikan proses penerbitan dan verifikasi sertifikat pelatihan. Pengingat masa berlaku membuat tidak ada lagi sertifikat yang lapse tanpa disadari.",
    author: "Contoh Klien A",
    position: "Kepala Divisi Manajemen Risiko",
    company: "Bank Contoh (fiktif)",
  },
  {
    quote: "Alur assessment center-nya jelas untuk setiap peran. Asesor, admin, dan peserta bisa menjalankan bagiannya tanpa saling menunggu.",
    author: "Contoh Klien B",
    position: "Kepala SDM",
    company: "BUMN Contoh (fiktif)",
  },
  {
    quote: "Kerangka People, Process, Technology yang dipakai Sangkala membuat program pelatihan kami terhubung langsung dengan proses dan sistem yang berjalan.",
    author: "Contoh Klien C",
    position: "Wakil Ketua Bidang Akademik",
    company: "Universitas Contoh (fiktif)",
  },
];

export default function TestimonialSlider() {
  const { language } = useLanguage();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const n = testimonials.length;

  useEffect(() => {
    if (hold || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => setI((v) => (v + 1) % n), 8000);
    return () => clearTimeout(timer);
  }, [i, hold, n]);

  const tm = testimonials[i];
  return (
    <section className="bg-paper py-24 md:py-36" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <Container>
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
            <div className="flex flex-col justify-between gap-10">
              <div>
                <p className="type-meta mb-5 flex items-center gap-3 text-petrol-600">
                  <span className="text-sogan-600">06</span> {language === "id" ? "Suara klien" : "Client voices"}
                </p>
                <p className="font-serif text-[7rem] leading-[0.7] text-sogan-200" aria-hidden>
                  &ldquo;
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button type="button" aria-label="Sebelumnya" onClick={() => setI((v) => (v - 1 + n) % n)} className="grid size-12 place-items-center rounded-full border border-ink transition-colors hover:bg-ink hover:text-paper">
                  <ArrowLeft aria-hidden className="size-5" />
                </button>
                <button type="button" aria-label="Berikutnya" onClick={() => setI((v) => (v + 1) % n)} className="grid size-12 place-items-center rounded-full border border-ink transition-colors hover:bg-ink hover:text-paper">
                  <ArrowRight aria-hidden className="size-5" />
                </button>
                <span className="type-meta ml-2 !tracking-normal text-stone-700">
                  {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </span>
              </div>
            </div>

            <figure aria-live="polite">
              <blockquote key={i} className="fade-in type-h2 !leading-[1.3]">
                {tm.quote}
              </blockquote>
              <figcaption key={`c${i}`} className="fade-in mt-10 flex items-center gap-4" style={{ ["--d" as string]: "150ms" }}>
                <span className="grid size-12 place-items-center rounded-full bg-petrol-900 font-serif text-xl text-paper">{tm.author.slice(-1)}</span>
                <span>
                  <span className="block font-semibold text-ink">{tm.author}</span>
                  <span className="block text-sm text-stone-700">
                    {tm.position} · {tm.company}
                  </span>
                </span>
              </figcaption>
              <div className="mt-10 flex gap-2">
                {testimonials.map((_, k) => (
                  <button key={k} type="button" aria-label={`Testimoni ${k + 1}`} onClick={() => setI(k)} className="h-1 flex-1 overflow-hidden rounded-full bg-stone-200">
                    <span className={cn("block h-full origin-left bg-petrol-600", k < i && "scale-x-100", k > i && "scale-x-0")} style={k === i ? { animation: hold ? "none" : "grow 8000ms linear both", transform: hold ? "scaleX(1)" : undefined } : undefined} />
                  </button>
                ))}
              </div>
            </figure>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
