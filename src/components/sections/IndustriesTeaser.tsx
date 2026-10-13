"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Band } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { IndexList } from "@/components/ui/index-list";
import { Reveal } from "@/components/ui/reveal";
import { industries } from "@/lib/site-content";

export default function IndustriesTeaser() {
  const { language } = useLanguage();
  const id = language === "id";
  return (
    <Band>
      <Reveal>
        <SectionIntro
          number="03"
          eyebrow={id ? "Industri" : "Industries"}
          title={id ? "Tiga sektor, satu pemahaman regulasi" : "Three sectors, one regulatory understanding"}
          lead={
            id
              ? "Kami bekerja di lingkungan yang diaudit dan diatur, dan bahasa kerjanya sudah kami kenal."
              : "We work in audited, regulated environments, and we already speak their language."
          }
        />
      </Reveal>
      <Reveal>
        <IndexList
          columns={1}
          items={industries.map((ind) => ({
            title: ind.title[language],
            description: ind.desc[language],
            href: `/industries#${ind.id}`,
          }))}
        />
      </Reveal>
    </Band>
  );
}
