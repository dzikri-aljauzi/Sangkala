"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { methodologySteps } from "@/lib/site-content";

function StepCard({ s, language }: { s: (typeof methodologySteps)[number]; language: "id" | "en" }) {
  const Icon = s.icon;
  return (
    <article className="flex h-full w-[min(84vw,30rem)] shrink-0 flex-col rounded-2xl border border-white/10 bg-petrol-800/60 p-8 backdrop-blur-sm md:p-10">
      <div className="flex items-start justify-between">
        <span className="font-serif text-[5.5rem] leading-none text-transparent [-webkit-text-stroke:1px_#e2cdb0]">{s.number}</span>
        <span className="grid size-12 place-items-center rounded-full border border-white/15 text-sogan-200">
          <Icon aria-hidden className="size-5" />
        </span>
      </div>
      <h3 className="mt-8 font-serif text-[2.25rem] leading-tight text-paper">{s.title[language]}</h3>
      <p className="type-meta mt-2 text-petrol-300">{s.subtitle[language]}</p>
      <p className="mt-5 text-[0.9375rem] leading-relaxed text-petrol-100">{s.desc[language]}</p>
      <ul className="mt-auto flex flex-wrap gap-2 pt-8">
        {s.deliverables[language].map((d) => (
          <li key={d} className="rounded-full border border-white/15 px-3 py-1 text-xs text-petrol-100">
            {d}
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * Metodologi lima langkah: di desktop, seksi menempel dan kartu bergeser
 * horizontal mengikuti scroll vertikal. Di mobile dan reduced motion, kartu
 * cukup bertumpuk.
 */
export default function MethodScroll() {
  const { language } = useLanguage();
  const id = language === "id";
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dist = useRef(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Jarak geser = lebar trek - lebar layar, diukur ulang saat ukuran berubah.
  const x = useTransform(scrollYProgress, (v) => {
    const p = Math.min(1, Math.max(0, (v - 0.05) / 0.9));
    return -p * dist.current;
  });
  useEffect(() => {
    const measure = () => {
      if (track.current) dist.current = Math.max(0, track.current.scrollWidth - window.innerWidth + 64);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const bar = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "100%"]);

  const intro = (
    <div className="max-w-[32rem] shrink-0">
      <p className="type-meta mb-5 flex items-center gap-3 text-sogan-200">
        <span>03</span> {id ? "Cara kami bekerja" : "How we work"}
      </p>
      <h2 className="type-h1 !text-paper">{id ? "Satu alur, dari diagnosis sampai keberlanjutan." : "One flow, from diagnosis to sustainability."}</h2>
      <p className="mt-6 text-lg leading-relaxed text-petrol-200">
        {id ? "Lima tahap yang dijalankan tim yang sama, terukur dengan Performance Sustainability Index." : "Five stages run by the same team, measured with the Performance Sustainability Index."}
      </p>
      <Button href="/methodology" variant="text" size="lg" className="mt-6 !text-sogan-200">
        {id ? "Pelajari metodologi →" : "Explore the methodology →"}
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop: scroll horizontal tersemat */}
      <section ref={ref} className="relative hidden h-[360vh] bg-petrol-900 text-paper motion-safe:lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <motion.div ref={track} style={{ x }} className="flex w-max items-stretch gap-8 pl-[max(3rem,calc((100vw-77.5rem)/2+3rem))]">
            <div className="flex items-center pr-12">{intro}</div>
            {methodologySteps.map((s) => (
              <div key={s.number} className="h-[34rem]">
                <StepCard s={s} language={language} />
              </div>
            ))}
          </motion.div>
          <Container className="mt-12 w-full">
            <div className="flex items-center gap-6">
              <div className="h-px flex-1 bg-white/10">
                <motion.div style={{ width: bar }} className="h-px bg-sogan-200" />
              </div>
              <span className="type-meta text-petrol-300">Assess → Sustain</span>
            </div>
          </Container>
        </div>
      </section>

      {/* Mobile / reduced motion: bertumpuk */}
      <section className="bg-petrol-900 py-24 text-paper motion-safe:lg:hidden">
        <Container>
          {intro}
          <div tabIndex={0} role="region" aria-label={id ? "Lima tahap metodologi" : "Five methodology stages"} className="mt-12 -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto focus-visible:outline-2 focus-visible:outline-sogan-200 px-5 pb-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0">
            {methodologySteps.map((s) => (
              <div key={s.number} className="snap-start">
                <StepCard s={s} language={language} />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
