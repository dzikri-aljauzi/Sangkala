"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Band } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";

/** Satu blok penutup per halaman. Satu tombol utama, satu tombol teks. */
export default function ClosingCTA({
  title,
  lead,
}: {
  title?: string;
  lead?: string;
}) {
  const { language } = useLanguage();
  const id = language === "id";
  return (
    <Band tone="tint" size="lg">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="type-h2">
          {title ?? (id ? "Siap membangun kinerja berkelanjutan?" : "Ready to build sustainable performance?")}
        </h2>
        <p className="type-lead mx-auto mt-4">
          {lead ??
            (id
              ? "Konsultasi gratis 30 menit untuk mendiskusikan kebutuhan transformasi organisasi Anda."
              : "Free 30-minute consultation to discuss your organization's transformation needs.")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <Link href="/contact">
            <Button size="lg">{id ? "Jadwalkan Konsultasi" : "Schedule Consultation"}</Button>
          </Link>
          <Link href="/programs">
            <Button variant="text" size="lg">
              {id ? "Lihat program kami →" : "View our programs →"}
            </Button>
          </Link>
        </div>
      </div>
    </Band>
  );
}
