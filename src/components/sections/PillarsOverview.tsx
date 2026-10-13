"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Band } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { IndexList } from "@/components/ui/index-list";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const pillars = [
  { key: "people", anchor: "people" },
  { key: "process", anchor: "process" },
  { key: "technology", anchor: "technology" },
] as const;

export default function PillarsOverview() {
  const { t, language } = useLanguage();
  const id = language === "id";
  return (
    <Band>
      <Reveal>
        <SectionIntro
          number="01"
          eyebrow={t("about.subtitle")}
          title={id ? "Integrator Ekosistem Kinerja" : "Performance Ecosystem Integrator"}
          lead={t("about.narrative")}
        />
      </Reveal>
      <Reveal>
        <p className="mb-8 max-w-[68ch] text-lg text-stone-700">{t("about.intro")}</p>
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
          {pillars.map((p) => (
            <div key={p.key}>
              <h3 className="type-card mb-2">{t(`about.pillars.${p.key}.title`)}</h3>
              <p className="mb-6 min-h-[3rem] text-[0.9375rem] leading-relaxed text-stone-700">
                {t(`about.pillars.${p.key}.desc`)}
              </p>
              <IndexList
                columns={1}
                items={[0, 1, 2].map((n) => ({ title: t(`services.${p.key}.items.${n}.title`) }))}
              />
              <Link href={`/services#${p.anchor}`} className="mt-5 inline-block">
                <Button variant="text" size="sm">
                  {id ? "Lihat layanan →" : "View services →"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </Reveal>
    </Band>
  );
}
