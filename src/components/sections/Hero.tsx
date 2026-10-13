"use client";

import Link from "next/link";
import TimeRings from "@/components/ui/time-rings";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";

/** Satu judul, satu paragraf, satu tombol utama, satu visual (DESIGN.md). */
export default function Hero() {
  const { t, language } = useLanguage();
  return (
    <section className="border-b border-stone-200 bg-paper">
      <Container className="grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-24">
        <div>
          <p className="type-meta mb-6 text-petrol-600">
            {language === "id" ? "GRC · Kepemimpinan · Asesmen" : "GRC · Leadership · Assessment"}
          </p>
          <h1 className="type-display">{t("hero.headline")}</h1>
          <p className="type-lead mt-6 max-w-[34rem]">{t("hero.subheadline")}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/contact">
              <Button size="lg">{t("hero.ctaPrimary")}</Button>
            </Link>
            <Link href="/programs">
              <Button variant="text" size="lg">
                {t("hero.ctaSecondary")} →
              </Button>
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[420px] lg:max-w-none">
          <TimeRings className="h-[400px] w-full lg:h-[480px]" />
        </div>
      </Container>
    </section>
  );
}
