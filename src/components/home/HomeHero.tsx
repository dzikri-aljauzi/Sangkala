"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Pause, Play, ShieldCheck, BellRing, FileCheck2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import OrbitCanvas from "@/components/motion/OrbitCanvas";
import { RotatingWord } from "@/components/motion/RotatingWord";
import { RiseText } from "@/components/motion/RiseText";

const feed = [
  { icon: ShieldCheck, id: "Sertifikat SKL/06062026/PLTH-GRK/001 diverifikasi", en: "Certificate SKL/06062026/PLTH-GRK/001 verified" },
  { icon: BellRing, id: "Pengingat refreshment dikirim ke 12 peserta", en: "Refreshment reminder sent to 12 holders" },
  { icon: FileCheck2, id: "Laporan asesmen diunggah oleh asesor", en: "Assessment report uploaded by assessor" },
];

/** Contoh aktivitas platform yang bergulir: menunjukkan bahwa Sangkala mengoperasikan produknya. */
function ActivityTicker({ paused }: { paused: boolean }) {
  const { language } = useLanguage();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % feed.length), 3200);
    return () => clearInterval(id);
  }, [paused]);
  const item = feed[i];
  const Icon = item.icon;
  return (
    <div className="w-[22rem] rounded-xl border border-white/15 bg-petrol-900/70 px-4 py-3 backdrop-blur-md">
      <p className="type-meta mb-2 flex items-center gap-2 text-petrol-300">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sogan-200 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-sogan-200" />
        </span>
        {language === "id" ? "Contoh aktivitas platform" : "Sample platform activity"}
      </p>
      <div key={i} className="fade-in flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-petrol-700 text-paper">
          <Icon aria-hidden className="size-4" />
        </span>
        <p className="text-sm leading-snug text-paper">{item[language]}</p>
      </div>
    </div>
  );
}

export default function HomeHero() {
  const { t, language } = useLanguage();
  const [paused, setPaused] = useState(false);
  const id = language === "id";

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-petrol-900 text-paper">
      <OrbitCanvas paused={paused} className="absolute inset-0 -z-10 h-full w-full" />

      <Container className="pt-header flex w-full flex-1 flex-col justify-center pb-10">
        <div className="max-w-[60rem] pt-12 md:pt-6">
          <p className="type-meta fade-in mb-6 flex items-center gap-3 text-sogan-200">
            <span aria-hidden className="h-px w-10 bg-sogan-200" />
            {id ? "GRC · Kepemimpinan · Asesmen" : "GRC · Leadership · Assessment"}
          </p>
          <h1 className="type-hero !text-paper">
            <RiseText text={id ? "Membangun organisasi yang" : "Building organizations that are"} />
            <br />
            <span className="rise-word" style={{ ["--i" as string]: 4 }}>
              <span>
                <RotatingWord
                  paused={paused}
                  className="italic text-sogan-200"
                  words={id ? ["tangguh.", "patuh.", "siap diaudit.", "berkelanjutan."] : ["resilient.", "compliant.", "audit-ready.", "sustainable."]}
                />
              </span>
            </span>
          </h1>
          <p className="type-lead fade-in mt-6 max-w-[40rem] !text-petrol-100" style={{ ["--d" as string]: "650ms" }}>
            {t("hero.subheadline")}
          </p>
          <div className="fade-in mt-8 flex flex-wrap items-center gap-4" style={{ ["--d" as string]: "800ms" }}>
            <Button href="/contact" size="xl" className="group bg-paper text-petrol-900 hover:bg-petrol-50">
              {t("hero.ctaPrimary")}
              <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button href="/programs" variant="secondary" size="xl" className="border-paper/50 text-paper hover:bg-paper/10">
              {t("hero.ctaSecondary")}
            </Button>
          </div>
        </div>
      </Container>

      <Container className="w-full pb-6">
        <div className="flex items-end justify-between gap-6 border-t border-white/10 pt-5">
          <a href="#mulai" className="group flex items-center gap-3 text-sm text-petrol-200 hover:text-paper">
            <span className="grid size-10 place-items-center rounded-full border border-white/20 transition-colors group-hover:border-paper">
              <ArrowDown aria-hidden className="size-4 animate-bounce" />
            </span>
            {id ? "Gulir untuk menjelajah" : "Scroll to explore"}
          </a>
          <div className="hidden lg:block">
            <ActivityTicker paused={paused} />
          </div>
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-pressed={paused}
            className="flex items-center gap-2 text-sm text-petrol-200 transition-colors hover:text-paper"
          >
            {paused ? (id ? "Putar animasi" : "Play animation") : id ? "Jeda animasi" : "Pause animation"}
            {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
          </button>
        </div>
      </Container>
    </section>
  );
}
