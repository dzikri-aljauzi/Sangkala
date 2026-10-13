"use client";

import { useRef, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/ui/reveal";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  // Minimum 0,5 menjaga kontras teks besar tetap di atas 3:1 (WCAG AA).
  const opacity = useTransform(progress, range, [0.5, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

const stats = [
  { value: "100+", id: "proyek konsultasi di institusi keuangan & BUMN", en: "consulting projects at financial institutions & SOEs" },
  { value: "15.000+", id: "profesional terlatih", en: "trained professionals" },
  { value: "40+", id: "institusi klien", en: "client institutions" },
  { value: "99%", id: "tingkat kepuasan klien", en: "client satisfaction rate" },
];

/** Pernyataan yang "menyala" kata per kata mengikuti scroll, diikuti angka count-up. */
export default function Statement() {
  const { language } = useLanguage();
  const id = language === "id";
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const text = id
    ? "Kami tidak hanya melatih atau mengaudit. Kami menyatukan orang, proses, dan teknologi menjadi satu sistem kinerja yang terukur, patuh, dan siap berubah."
    : "We don't just train or audit. We unite people, process, and technology into one performance system that is measurable, compliant, and ready to change.";
  const words = text.split(" ");
  // Di server (dan tanpa JS) teks tampil penuh; efek "menyala" hanya setelah hidrasi.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <section className="bg-paper py-24 md:py-36">
      <Container>
        <p className="type-meta mb-10 flex items-center gap-3 text-petrol-600">
          <span className="text-sogan-600">01</span> {id ? "Siapa kami" : "Who we are"}
        </p>
        <p ref={ref} className="type-h1 max-w-[22ch] md:max-w-[26ch]">
          {hydrated
            ? words.map((w, i) => <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />)
            : text}
        </p>

        <Reveal>
          <dl className="mt-20 grid grid-cols-2 border-t border-ink lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.value} className={`border-b border-stone-200 py-8 pr-6 lg:border-b-0 ${i > 0 ? "lg:border-l lg:pl-8" : ""} ${i % 2 === 1 ? "border-l pl-6 lg:pl-8" : ""}`}>
                <dd className="font-serif text-[2.25rem] leading-none text-ink sm:text-[3rem] md:text-[4.25rem]">
                  <CountUp value={s.value} />
                </dd>
                <dt className="mt-4 max-w-[16rem] text-[0.9375rem] leading-snug text-stone-700">{s[language]}</dt>
              </div>
            ))}
          </dl>
          <p className="type-meta mt-6 text-stone-700">{id ? "Angka ilustrasi untuk portofolio" : "Illustrative figures for portfolio"}</p>
        </Reveal>
      </Container>
    </section>
  );
}
