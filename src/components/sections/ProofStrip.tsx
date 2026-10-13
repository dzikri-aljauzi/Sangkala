"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";

const metrics = [
  { value: "100+", key: "metrics.institutions", note: { id: "proyek konsultasi", en: "consulting projects" } },
  { value: "15.000+", key: "metrics.professionals" },
  { value: "99%", key: "metrics.satisfaction" },
  { value: "ISO 9001", key: "metrics.certified" },
];

/** Angka tanpa kartu dan ikon. Angka di situs ini ilustrasi untuk portofolio. */
export default function ProofStrip() {
  const { t, language } = useLanguage();
  return (
    <section className="border-b border-stone-200 bg-paper">
      <Container className="py-12 md:py-14">
        <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <div key={m.key} className={i > 0 ? "lg:border-l lg:border-stone-200 lg:pl-8" : ""}>
              <dd className="type-h1 !text-[2.125rem] md:!text-[2.875rem]">{m.value}</dd>
              <dt className="mt-2 max-w-[14rem] text-sm leading-snug text-stone-700">
                {m.note ? `${m.note[language]} · ${t(m.key)}` : t(m.key)}
              </dt>
            </div>
          ))}
        </dl>
        <p className="type-meta mt-8 text-stone-700">
          {language === "id" ? "Angka ilustrasi untuk portofolio" : "Illustrative figures for portfolio"}
        </p>
      </Container>
    </section>
  );
}
