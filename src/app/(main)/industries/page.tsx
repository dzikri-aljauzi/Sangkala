"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Container, PageHeader } from "@/components/ui/layout";
import { IndexList } from "@/components/ui/index-list";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Pattern } from "@/components/art/Pattern";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { industries } from "@/lib/site-content";

const art = [
  { variant: "rings" as const, seed: 4 },
  { variant: "arcs" as const, seed: 9 },
  { variant: "waves" as const, seed: 13 },
];

export default function IndustriesPage() {
  const { language } = useLanguage();
  const id = language === "id";

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/industries", label: id ? "Industri" : "Industries" }]}
        eyebrow={id ? "Industri" : "Industries"}
        title={id ? "Industri yang Kami Layani" : "Industries We Serve"}
        art={{ variant: "arcs", seed: 6 }}
        lead={
          id
            ? "Fokus vertikal dengan pemahaman mendalam terhadap tantangan spesifik setiap industri."
            : "Vertical focus with deep understanding of specific challenges in each industry."
        }
        aside={
          <nav aria-label={id ? "Di halaman ini" : "On this page"} className="flex flex-wrap gap-3">
            {industries.map((ind, n) => (
              <a key={ind.id} href={`#${ind.id}`} className="flex items-center gap-3 rounded-full border border-white/20 px-5 py-2.5 text-sm text-paper transition-colors hover:border-paper hover:bg-white/5">
                <span className="type-meta !tracking-normal text-sogan-200">0{n + 1}</span>
                {ind.title[language]}
              </a>
            ))}
          </nav>
        }
      />

      {industries.map((ind, i) => {
        const Icon = ind.icon;
        return (
          <section key={ind.id} id={ind.id} className={`scroll-mt-20 py-20 md:py-28 ${i % 2 === 1 ? "bg-stone-100" : "bg-paper"}`}>
            <Container>
              <Reveal>
                <div className="relative isolate overflow-hidden rounded-3xl bg-petrol-900 text-paper">
                  <div aria-hidden className="absolute inset-0 -z-10">
                    <Pattern variant={art[i].variant} seed={art[i].seed} tone="dark" animate />
                  </div>
                  <div className="grid gap-8 p-8 md:min-h-[24rem] md:grid-cols-[1.4fr_1fr] md:items-end md:p-14">
                    <div>
                      <span className="mb-8 grid size-14 place-items-center rounded-2xl border border-white/20 bg-petrol-900/50 text-sogan-200 backdrop-blur-sm">
                        <Icon aria-hidden className="size-6" />
                      </span>
                      <p className="type-meta mb-4 text-sogan-200">0{i + 1} · {id ? "Industri" : "Industry"}</p>
                      <h2 className="type-display !text-paper">{ind.title[language]}</h2>
                    </div>
                    <p className="text-lg leading-relaxed text-petrol-100">{ind.desc[language]}</p>
                  </div>
                </div>
              </Reveal>

              <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
                <div>
                  <h3 className="type-meta mb-6 text-stone-700">{id ? "Tantangan industri" : "Industry challenges"}</h3>
                  <ol className="grid gap-4 sm:grid-cols-2">
                    {ind.challenges[language].map((c, n) => (
                      <li key={c}>
                        <Reveal delay={n * 80}>
                          <div className="h-full rounded-2xl border border-stone-200 bg-paper p-6 transition-colors duration-300 hover:border-petrol-300">
                            <span className="font-serif text-[2.5rem] leading-none text-petrol-400">0{n + 1}</span>
                            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink">{c}</p>
                          </div>
                        </Reveal>
                      </li>
                    ))}
                  </ol>
                  <Button href="/contact" size="lg" className="mt-8">
                    {id ? "Diskusikan Kebutuhan Anda" : "Discuss Your Needs"}
                  </Button>
                </div>
                <div>
                  <h3 className="type-meta mb-6 text-stone-700">{id ? "Program unggulan" : "Featured programs"}</h3>
                  <Reveal>
                    <IndexList columns={1} items={ind.programs.map((p) => ({ title: p[language] }))} />
                  </Reveal>
                </div>
              </div>
            </Container>
          </section>
        );
      })}

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
