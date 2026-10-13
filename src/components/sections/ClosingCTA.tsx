"use client";

import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Pattern } from "@/components/art/Pattern";
import { Reveal } from "@/components/ui/reveal";

/** Blok penutup bertenaga: petrol 600 penuh, judul serif besar, satu tombol utama. */
export default function ClosingCTA({ title, lead }: { title?: string; lead?: string }) {
  const { language } = useLanguage();
  const id = language === "id";
  return (
    <section className="relative isolate overflow-hidden bg-petrol-600 text-paper">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-40 mix-blend-soft-light">
        <Pattern variant="rings" seed={11} tone="dark" animate />
      </div>
      <Container className="py-24 md:py-36">
        <Reveal>
          <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <h2 className="type-display !text-paper">
              {title ?? (id ? "Siap membangun kinerja yang bertahan?" : "Ready to build performance that lasts?")}
            </h2>
            <div>
              <p className="text-lg leading-relaxed text-petrol-50">
                {lead ??
                  (id
                    ? "Konsultasi gratis 30 menit untuk mendiskusikan kebutuhan transformasi organisasi Anda."
                    : "A free 30-minute consultation to discuss your organization's transformation needs.")}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Button href="/contact" size="xl" className="group bg-paper text-petrol-900 hover:bg-petrol-50">
                  {id ? "Jadwalkan Konsultasi" : "Schedule Consultation"}
                  <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button href="/programs" variant="text" size="lg" className="!text-paper">
                  {id ? "Lihat program →" : "View programs →"}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
