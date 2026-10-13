"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Container, PageHeader } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { RailNav } from "@/components/ui/rail-nav";
import { Reveal } from "@/components/ui/reveal";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { methodologySteps } from "@/lib/site-content";

const psi = [
  { title: "People Index", desc: { id: "Mengukur kapabilitas dan budaya", en: "Measuring capability and culture" } },
  { title: "Process Index", desc: { id: "Mengukur efisiensi dan compliance", en: "Measuring efficiency and compliance" } },
  { title: "Technology Index", desc: { id: "Mengukur digital maturity", en: "Measuring digital maturity" } },
];

export default function MethodologyPage() {
  const { language } = useLanguage();
  const id = language === "id";

  return (
    <>
      <PageHeader
        eyebrow={id ? "Metodologi" : "Methodology"}
        title={id ? "Pendekatan Kami" : "Our Approach"}
        lead={
          id
            ? "Framework 5 tahap yang terstruktur untuk memastikan transformasi yang terukur dan berkelanjutan."
            : "Structured 5-stage framework to ensure measurable and sustainable transformation."
        }
      />

      <Container className="py-[72px] lg:grid lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-[112px]">
        <RailNav
          className="mb-10 lg:mb-0"
          items={[
            ...methodologySteps.map((s) => ({ id: s.title.en.toLowerCase(), label: `${s.number} ${s.title[language]}` })),
            { id: "psi", label: "PSI" },
          ]}
        />
        <div className="min-w-0 space-y-20">
          {methodologySteps.map((s) => (
            <Reveal key={s.number}>
              <section id={s.title.en.toLowerCase()} className="scroll-mt-28">
                <SectionIntro number={s.number} eyebrow={s.subtitle[language]} title={s.title[language]} lead={s.desc[language]} />
                <h3 className="type-meta mb-4 text-stone-700">Deliverables</h3>
                <ul className="border-t border-ink md:grid md:grid-cols-2 md:gap-x-12">
                  {s.deliverables[language].map((d) => (
                    <li key={d} className="border-b border-stone-200 py-4 text-[0.9375rem] text-ink">
                      {d}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}

          <Reveal>
            <section id="psi" className="scroll-mt-28 bg-stone-100 p-8 md:p-12">
              <SectionIntro
                number="06"
                eyebrow="PSI"
                title="Performance Sustainability Index (PSI)"
                lead={
                  id
                    ? "Setiap engagement kami terukur dengan Performance Sustainability Index (PSI) yang melacak progress di 3 dimensi secara real-time."
                    : "Every engagement is measured with Performance Sustainability Index (PSI) tracking progress across 3 dimensions in real-time."
                }
              />
              <div className="grid gap-8 md:grid-cols-3">
                {psi.map((p) => (
                  <div key={p.title} className="border-t border-ink pt-4">
                    <h3 className="type-card mb-2">{p.title}</h3>
                    <p className="text-[0.9375rem] text-stone-700">{p.desc[language]}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        </div>
      </Container>

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
