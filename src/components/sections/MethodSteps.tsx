"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Band } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { methodologySteps } from "@/lib/site-content";

/** Lima langkah dengan nomor Mono dan garis sogan tipis (detail sogan yang diizinkan). */
export default function MethodSteps() {
  const { language } = useLanguage();
  const id = language === "id";
  return (
    <Band tone="stone">
      <Reveal>
        <SectionIntro
          number="02"
          eyebrow={id ? "Metodologi" : "Methodology"}
          title="Assess → Design → Build → Embed → Sustain"
          lead={
            id
              ? "Satu alur yang sama dari diagnosis sampai keberlanjutan, dijalankan oleh tim yang sama."
              : "One flow from diagnosis to sustainability, run by the same team."
          }
        />
      </Reveal>
      <Reveal>
        <ol className="grid gap-10 md:grid-cols-5 md:gap-6">
          {methodologySteps.map((s) => (
            <li key={s.number} className="relative">
              <div className="mb-5 flex items-center gap-3">
                <span className="type-meta !tracking-normal text-sogan-600">{s.number}</span>
                <span aria-hidden className="h-px flex-1 bg-sogan-200" />
              </div>
              <h3 className="type-h3 mb-2">{s.title[language]}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-stone-700">{s.subtitle[language]}</p>
            </li>
          ))}
        </ol>
        <Link href="/methodology" className="mt-10 inline-block">
          <Button variant="text">{id ? "Pelajari metodologi →" : "Explore the methodology →"}</Button>
        </Link>
      </Reveal>
    </Band>
  );
}
