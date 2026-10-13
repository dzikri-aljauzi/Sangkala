"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { Pattern } from "@/components/art/Pattern";
import { Reveal } from "@/components/ui/reveal";
import { industries } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const art = [
  { variant: "rings" as const, seed: 4 },
  { variant: "arcs" as const, seed: 9 },
  { variant: "waves" as const, seed: 13 },
];

/** Panel industri yang melebar saat diarahkan atau difokus (desktop); kartu bertumpuk di mobile. */
export default function IndustryPanels() {
  const { language } = useLanguage();
  const id = language === "id";
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-stone-100 py-24 md:py-32">
      <Container>
        <Reveal>
          <p className="type-meta mb-5 flex items-center gap-3 text-petrol-600">
            <span className="text-sogan-600">05</span> {id ? "Industri" : "Industries"}
          </p>
          <h2 className="type-display mb-14 max-w-[18ch]">{id ? "Tiga sektor teregulasi. Satu bahasa kerja." : "Three regulated sectors. One working language."}</h2>
        </Reveal>

        <div className="flex flex-col gap-4 lg:h-[34rem] lg:flex-row">
          {industries.map((ind, i) => {
            const on = open === i;
            return (
              <Link
                key={ind.id}
                href={`/industries#${ind.id}`}
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
                className={cn(
                  "group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl bg-petrol-900 p-7 text-paper transition-[flex-grow] duration-700 [transition-timing-function:cubic-bezier(.2,.7,.2,1)] md:p-9 lg:min-h-0",
                  on ? "lg:flex-[3]" : "lg:flex-1"
                )}
              >
                <div aria-hidden className="absolute inset-0 -z-10 transition-transform duration-700 group-hover:scale-105">
                  <Pattern variant={art[i].variant} seed={art[i].seed} tone="dark" />
                </div>
                <div aria-hidden className="absolute inset-0 -z-10 bg-petrol-900/35" />
                <span className="type-meta absolute left-7 top-7 text-sogan-200 md:left-9 md:top-9">0{i + 1}</span>
                <ArrowUpRight aria-hidden className="absolute right-7 top-7 size-6 text-paper transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 md:right-9 md:top-9" />
                <h3 className="font-serif text-[2rem] leading-tight md:text-[2.5rem]">{ind.title[language]}</h3>
                <div className={cn("grid transition-[grid-template-rows,opacity] duration-700", on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[1fr] opacity-100 lg:grid-rows-[0fr] lg:opacity-0")}>
                  <div className="overflow-hidden">
                    <p className="mt-4 max-w-[36rem] text-[0.9375rem] leading-relaxed text-petrol-100">{ind.desc[language]}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {ind.programs.slice(0, 4).map((p) => (
                        <li key={p.en} className="rounded-full border border-white/25 bg-petrol-900/40 px-3 py-1 text-xs text-paper">
                          {p[language]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
