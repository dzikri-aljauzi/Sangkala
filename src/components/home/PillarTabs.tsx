"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { Pattern } from "@/components/art/Pattern";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const pillars = [
  { key: "people", anchor: "people", art: "orbits" as const, seed: 21 },
  { key: "process", anchor: "process", art: "grid" as const, seed: 8 },
  { key: "technology", anchor: "technology", art: "bars" as const, seed: 5 },
];
const DURATION = 7000;

/** Tiga pilar sebagai tab yang berganti otomatis; jeda saat diarahkan atau difokus. */
export default function PillarTabs() {
  const { t, language } = useLanguage();
  const id = language === "id";
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (hold || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => {
      setActive((v) => (v + 1) % pillars.length);
      setCycle((c) => c + 1);
    }, DURATION);
    return () => clearTimeout(timer);
  }, [active, hold, cycle]);

  const p = pillars[active];

  return (
    <section className="bg-petrol-50 py-24 md:py-32" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      <Container>
        <Reveal>
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="type-meta mb-5 flex items-center gap-3 text-petrol-600">
                <span className="text-sogan-600">02</span> {id ? "Apa yang kami kerjakan" : "What we do"}
              </p>
              <h2 className="type-display max-w-[16ch]">{id ? "Tiga pilar, satu sistem kinerja." : "Three pillars, one performance system."}</h2>
            </div>
            <Button href="/services" variant="secondary" size="lg" className="group">
              {id ? "Semua layanan" : "All services"}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
          <div role="tablist" aria-label={id ? "Pilar layanan" : "Service pillars"} className="flex flex-col">
            {pillars.map((x, i) => {
              const on = i === active;
              return (
                <button
                  key={x.key}
                  role="tab"
                  id={`tab-${x.key}`}
                  aria-selected={on}
                  aria-controls={`panel-${x.key}`}
                  onClick={() => {
                    setActive(i);
                    setCycle((c) => c + 1);
                  }}
                  className="group relative border-t border-petrol-200 py-6 text-left"
                >
                  <span className="flex items-baseline gap-5">
                    <span className={cn("type-meta !tracking-normal transition-colors", on ? "text-sogan-600" : "text-stone-700")}>0{i + 1}</span>
                    <span className={cn("font-serif text-[2rem] leading-none transition-colors md:text-[2.75rem]", on ? "text-ink" : "text-stone-500 group-hover:text-ink")}>
                      {t(`about.pillars.${x.key}.title`)}
                    </span>
                  </span>
                  {/* bilah progres auto-advance */}
                  <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
                    {on && (
                      <span
                        key={cycle}
                        className="block h-full origin-left bg-petrol-600"
                        style={{ animation: hold ? "none" : `grow ${DURATION}ms linear both`, transform: hold ? "scaleX(1)" : undefined }}
                      />
                    )}
                  </span>
                  <span className={cn("grid transition-[grid-template-rows] duration-500", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <span className="overflow-hidden">
                      <span className="block pl-11 pt-4 text-[0.9375rem] leading-relaxed text-stone-700">{t(`about.pillars.${x.key}.desc`)}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div id={`panel-${p.key}`} role="tabpanel" aria-labelledby={`tab-${p.key}`} key={p.key} className="fade-in overflow-hidden rounded-2xl bg-paper">
            <div className="relative aspect-[16/8] overflow-hidden bg-petrol-900">
              <Pattern variant={p.art} seed={p.seed} tone="dark" animate className="scale-110" />
              <p className="absolute bottom-5 left-6 font-serif text-[2.5rem] italic text-paper md:text-[3.5rem]">{t(`about.pillars.${p.key}.title`)}</p>
            </div>
            <ul className="divide-y divide-stone-200 px-6 md:px-8">
              {[0, 1, 2].map((n) => (
                <li key={n} className="flex items-start gap-4 py-5">
                  <span className="type-meta pt-1 !tracking-normal text-stone-700">{String(n + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-medium text-ink">{t(`services.${p.key}.items.${n}.title`)}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-stone-700">{t(`services.${p.key}.items.${n}.desc`)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-6 pb-6 md:px-8">
              <Button href={`/services#${p.anchor}`} variant="text">
                {id ? `Jelajahi ${t(`about.pillars.${p.key}.title`)} →` : `Explore ${t(`about.pillars.${p.key}.title`)} →`}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
