"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Marquee } from "@/components/motion/Marquee";

// Klien fiktif untuk portofolio. Label "fiktif" tidak boleh dihapus.
const clients = ["Bank Contoh A", "BUMN Contoh A", "Universitas Contoh A", "Fintech Contoh A", "Bank Contoh B", "Asosiasi Contoh A", "BUMN Contoh B", "Lembaga Contoh A", "Bank Contoh C", "Universitas Contoh B"];

export default function ClientMarquee() {
  const { language } = useLanguage();
  return (
    <section id="mulai" className="scroll-mt-20 border-b border-stone-200 bg-paper py-10">
      <p className="type-meta mb-6 text-center text-stone-700">
        {language === "id" ? "Dipercaya institusi teregulasi · contoh fiktif untuk portofolio" : "Trusted by regulated institutions · fictional examples for portfolio"}
      </p>
      <Marquee duration={45}>
        {clients.map((c) => (
          <span key={c} className="flex items-center whitespace-nowrap px-8 font-serif text-[1.75rem] italic text-stone-700 md:text-[2.25rem]">
            {c}
            <span aria-hidden className="ml-16 text-base not-italic text-sogan-600">✦</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
