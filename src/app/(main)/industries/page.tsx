"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Container, PageHeader } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { IndexList } from "@/components/ui/index-list";
import { RailNav } from "@/components/ui/rail-nav";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { industries } from "@/lib/site-content";

export default function IndustriesPage() {
  const { language } = useLanguage();
  const id = language === "id";

  return (
    <>
      <PageHeader
        eyebrow={id ? "Industri" : "Industries"}
        title={id ? "Industri yang Kami Layani" : "Industries We Serve"}
        lead={
          id
            ? "Fokus vertikal dengan pemahaman mendalam terhadap tantangan spesifik setiap industri."
            : "Vertical focus with deep understanding of specific challenges in each industry."
        }
      />

      <Container className="py-[72px] lg:grid lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-[112px]">
        <RailNav
          className="mb-10 lg:mb-0"
          items={industries.map((ind) => ({ id: ind.id, label: ind.title[language] }))}
        />
        <div className="min-w-0 space-y-24">
          {industries.map((ind, i) => (
            <Reveal key={ind.id}>
              <section id={ind.id} className="scroll-mt-28">
                <SectionIntro
                  number={String(i + 1).padStart(2, "0")}
                  eyebrow={id ? "Industri" : "Industry"}
                  title={ind.title[language]}
                  lead={ind.desc[language]}
                />
                <div className="grid gap-12 xl:grid-cols-[1fr_1.3fr] xl:gap-14">
                  <div>
                    <h3 className="type-meta mb-4 text-stone-700">
                      {id ? "Tantangan industri" : "Industry challenges"}
                    </h3>
                    <ul className="border-t border-ink">
                      {ind.challenges[language].map((c) => (
                        <li key={c} className="border-b border-stone-200 py-4 text-[0.9375rem] leading-relaxed text-ink">
                          {c}
                        </li>
                      ))}
                    </ul>
                    <Button href="/contact" variant="secondary" size="lg" className="mt-6 inline-block">
                        {id ? "Diskusikan Kebutuhan Anda" : "Discuss Your Needs"}
                      </Button>
                  </div>
                  <div>
                    <h3 className="type-meta mb-4 text-stone-700">
                      {id ? "Program unggulan" : "Featured programs"}
                    </h3>
                    <IndexList columns={1} items={ind.programs.map((p) => ({ title: p[language] }))} />
                  </div>
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </Container>

      <ClosingCTA
        title={id ? "Tidak menemukan industri Anda?" : "Don't see your industry?"}
        lead={
          id
            ? "Framework 3P kami dapat diadaptasi untuk berbagai industri regulated. Hubungi kami untuk diskusi kebutuhan spesifik Anda."
            : "Our 3P framework can be adapted for various regulated industries. Contact us to discuss your specific needs."
        }
      />
    </>
  );
}
