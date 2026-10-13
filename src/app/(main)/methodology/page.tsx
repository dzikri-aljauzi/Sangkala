"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container, PageHeader } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { methodologySteps } from "@/lib/site-content";

const psi = [
  { title: "People Index", desc: { id: "Mengukur kapabilitas dan budaya", en: "Measuring capability and culture" }, w: "72%" },
  { title: "Process Index", desc: { id: "Mengukur efisiensi dan compliance", en: "Measuring efficiency and compliance" }, w: "84%" },
  { title: "Technology Index", desc: { id: "Mengukur digital maturity", en: "Measuring digital maturity" }, w: "61%" },
];

export default function MethodologyPage() {
  const { language } = useLanguage();
  const id = language === "id";
  const line = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: line, offset: ["start 70%", "end 60%"] });

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/services", label: id ? "Layanan" : "Services" }, { href: "/methodology", label: id ? "Metodologi" : "Methodology" }]}
        eyebrow={id ? "Metodologi" : "Methodology"}
        title={id ? "Pendekatan Kami" : "Our Approach"}
        art={{ variant: "bars", seed: 12 }}
        lead={
          id
            ? "Framework 5 tahap yang terstruktur untuk memastikan transformasi yang terukur dan berkelanjutan."
            : "Structured 5-stage framework to ensure measurable and sustainable transformation."
        }
        aside={
          <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 font-serif text-[1.5rem] text-petrol-100 md:text-[2rem]">
            {methodologySteps.map((s, i) => (
              <li key={s.number} className="flex items-center gap-3">
                <a href={`#${s.title.en.toLowerCase()}`} className="transition-colors hover:text-sogan-200">
                  {s.title[language]}
                </a>
                {i < methodologySteps.length - 1 && <span aria-hidden className="text-sogan-200">→</span>}
              </li>
            ))}
          </ol>
        }
      />

      <section className="bg-paper py-24 md:py-32">
        <Container>
          <ol ref={line} className="relative">
            {/* rel dan isinya mengikuti scroll */}
            <span aria-hidden className="absolute bottom-0 left-[1.75rem] top-0 w-px bg-stone-200 md:left-[3.5rem]" />
            <motion.span aria-hidden style={{ scaleY: scrollYProgress }} className="absolute bottom-0 left-[1.75rem] top-0 w-px origin-top bg-petrol-600 md:left-[3.5rem]" />
            {methodologySteps.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.number} id={s.title.en.toLowerCase()} className="relative scroll-mt-28 pb-20 pl-20 last:pb-0 md:pl-36">
                  <span className="absolute left-0 top-0 grid size-14 place-items-center rounded-full border border-petrol-200 bg-paper text-petrol-600 md:left-[1.75rem]">
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <Reveal>
                    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
                      <div>
                        <p className="type-meta mb-3 text-sogan-600">{s.number} · {s.subtitle[language]}</p>
                        <h2 className="type-display">{s.title[language]}</h2>
                        <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-stone-700">{s.desc[language]}</p>
                      </div>
                      <div className="rounded-2xl bg-stone-100 p-7">
                        <h3 className="type-meta mb-5 text-stone-700">Deliverables</h3>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {s.deliverables[language].map((d) => (
                            <li key={d} className="rounded-xl bg-paper px-4 py-3 text-[0.9375rem] text-ink">
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section id="psi" className="scroll-mt-20 bg-petrol-900 py-24 text-paper md:py-32">
        <Container>
          <Reveal>
            <p className="type-meta mb-5 text-sogan-200">PSI</p>
            <h2 className="type-display max-w-[20ch] !text-paper">Performance Sustainability Index</h2>
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-petrol-200">
              {id
                ? "Setiap engagement kami terukur dengan Performance Sustainability Index (PSI) yang melacak progress di 3 dimensi secara real-time."
                : "Every engagement is measured with Performance Sustainability Index (PSI) tracking progress across 3 dimensions in real-time."}
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {psi.map((p, n) => (
              <Reveal key={p.title} delay={n * 120}>
                <article className="rounded-2xl border border-white/10 bg-petrol-800/50 p-8">
                  <h3 className="font-serif text-[1.75rem] text-paper">{p.title}</h3>
                  <p className="mt-2 text-[0.9375rem] text-petrol-200">{p.desc[language]}</p>
                  <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden>
                    <div className="h-full origin-left rounded-full bg-sogan-200" style={{ width: p.w, animation: "grow 1600ms cubic-bezier(.2,.7,.2,1) both", animationDelay: `${300 + n * 150}ms` }} />
                  </div>
                  <p className="type-meta mt-3 text-petrol-300">{id ? "Contoh indikator" : "Sample indicator"}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ClosingCTA
        title={id ? "Siap memulai transformasi?" : "Ready to start your transformation?"}
        lead={
          id
            ? "Konsultasi gratis untuk memahami bagaimana metodologi kami dapat diterapkan di organisasi Anda."
            : "Free consultation to understand how our methodology can be applied in your organization."
        }
      />
    </>
  );
}
