"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { BrowserFrame } from "./BrowserFrame";
import { cn } from "@/lib/utils";

const tabs = [
  {
    key: "ac",
    src: "/showcase/overview.webp",
    url: "sangkala.example/assessment-center/…/overview",
    title: { id: "Assessment Center", en: "Assessment Center" },
    lead: { id: "Ruang kerja asesmen multi-peran: admin, asesor, klien, dan staf klien dalam satu portal.", en: "A multi-role assessment workspace: admin, assessors, clients, and client staff in one portal." },
    points: {
      id: ["Akses berbasis peran dengan NextAuth (JWT)", "Unggah laporan, resume per eselon, dan dokumentasi", "Pantau progres asesmen per proyek"],
      en: ["Role-based access with NextAuth (JWT)", "Upload reports, resumes per echelon, and documentation", "Track assessment progress per project"],
    },
  },
  {
    key: "reminder",
    src: "/showcase/reminder.webp",
    url: "sangkala.example/admin/reminder-sertifikat",
    title: { id: "Pengingat Sertifikasi", en: "Certification Reminders" },
    lead: { id: "Tidak ada lagi sertifikat yang kedaluwarsa diam-diam. Status dihitung otomatis dari tanggal ujian, refreshment, dan masa berlaku.", en: "No more certificates lapsing silently. Status is computed from exam, refreshment, and expiry dates." },
    points: {
      id: ["Status otomatis: aktif, mendekati refreshment, mendekati kedaluwarsa", "Email pengingat terjadwal lewat cron", "Impor massal dari spreadsheet"],
      en: ["Automatic status: active, refreshment due, expiring", "Scheduled reminder emails via cron", "Bulk import from spreadsheets"],
    },
  },
  {
    key: "verify",
    src: "/showcase/verify.webp",
    url: "sangkala.example/verify/…",
    title: { id: "Verifikasi Publik", en: "Public Verification" },
    lead: { id: "Setiap sertifikat PDF membawa kode QR menuju halaman verifikasi publik, tanpa login.", en: "Every PDF certificate carries a QR code to a public verification page, no login needed." },
    points: {
      id: ["PDF dibuat di server dengan pdf-lib dan QR", "Kode QR memakai hash verifikasi acak", "Daftar penerima kolektif yang bisa dicari"],
      en: ["Server-generated PDF with pdf-lib and QR", "QR codes use a random verification hash", "Searchable collective recipient list"],
    },
  },
];

/** Bukti produk: screenshot asli aplikasi dalam bingkai browser yang miring lalu tegak saat di-scroll. */
export default function PlatformShowcase() {
  const { language } = useLanguage();
  const id = language === "id";
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const tab = tabs[active];

  return (
    <section className="overflow-hidden bg-paper py-24 md:py-36">
      <Container>
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-end">
            <div>
              <p className="type-meta mb-5 flex items-center gap-3 text-petrol-600">
                <span className="text-sogan-600">04</span> Platform
              </p>
              <h2 className="type-h1 max-w-[22ch]">{id ? "Bukan hanya saran. Kami menjalankan perangkat lunaknya." : "Not just advice. We run the software."}</h2>
            </div>
            <p className="type-lead max-w-[34rem]">
              {id
                ? "Metodologi Sangkala berjalan di atas platform yang dibangun sendiri. Ini tangkapan layar aplikasinya yang berjalan."
                : "Sangkala's methodology runs on a platform built in-house. These are screenshots of the running application."}
            </p>
          </div>
        </Reveal>

        <div role="tablist" aria-label="Platform" className="mt-14 flex gap-2 overflow-x-auto border-b border-stone-200">
          {tabs.map((tb, i) => (
            <button
              key={tb.key}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "-mb-px shrink-0 border-b-2 px-1 pb-4 pr-6 text-left transition-colors",
                i === active ? "border-petrol-600 text-ink" : "border-transparent text-stone-700 hover:text-ink"
              )}
            >
              <span className="type-meta mr-3 !tracking-normal text-sogan-600">0{i + 1}</span>
              <span className="text-lg font-medium">{tb.title[language]}</span>
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
          <div key={tab.key} className="fade-in">
            <h3 className="type-h2">{tab.title[language]}</h3>
            <p className="mt-5 text-lg leading-relaxed text-stone-700">{tab.lead[language]}</p>
            <ul className="mt-8 space-y-4">
              {tab.points[language].map((pt) => (
                <li key={pt} className="flex gap-3 text-[0.9375rem] text-ink">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-petrol-600 text-paper">
                    <Check aria-hidden className="size-3" />
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          <div ref={ref} className="relative [perspective:1600px]">
            <motion.div style={{ rotateX, scale }} className="origin-bottom">
              <div key={tab.key} className="fade-in">
                <BrowserFrame src={tab.src} url={tab.url} alt={`${tab.title[language]}: tangkapan layar aplikasi`} />
              </div>
            </motion.div>
            {tab.key === "verify" && (
              <div className="fade-in absolute -bottom-10 -right-2 w-[28%] min-w-[8rem] overflow-hidden rounded-[1.75rem] border-[6px] border-ink bg-ink shadow-2xl md:-right-6" style={{ ["--d" as string]: "250ms" }}>
                <Image src="/showcase/verify-mobile.webp" alt="Halaman verifikasi di ponsel" width={780} height={1688} className="h-auto w-full rounded-[1.25rem]" />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
