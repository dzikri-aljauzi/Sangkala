"use client";

import Link from "next/link";
import { Linkedin, Instagram, Lock } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useLanguage } from "@/context/LanguageContext";

type Lang = "id" | "en";
interface FooterLink {
  href: string;
  label: Record<Lang, string>;
}

const serviceLinks: FooterLink[] = [
  { href: "/services#people", label: { id: "People Excellence", en: "People Excellence" } },
  { href: "/services#process", label: { id: "Process Optimization", en: "Process Optimization" } },
  { href: "/services#technology", label: { id: "Technology Enablement", en: "Technology Enablement" } },
  { href: "/methodology", label: { id: "Metodologi", en: "Methodology" } },
];

const industryLinks: FooterLink[] = [
  { href: "/industries#banking", label: { id: "Perbankan", en: "Banking" } },
  { href: "/industries#soe", label: { id: "BUMN", en: "SOE" } },
  { href: "/industries#fintech", label: { id: "Fintech", en: "Fintech" } },
];

const companyLinks: FooterLink[] = [
  { href: "/about", label: { id: "Tentang Kami", en: "About Us" } },
  { href: "/programs", label: { id: "Program", en: "Programs" } },
  { href: "/insights", label: { id: "Insight", en: "Insights" } },
  { href: "/news-article", label: { id: "News & Article", en: "News & Articles" } },
  { href: "/contact", label: { id: "Kontak", en: "Contact" } },
];

const platformLinks: FooterLink[] = [
  { href: "/verify", label: { id: "Verifikasi Sertifikat", en: "Verify Certificate" } },
  { href: "/assessment-center", label: { id: "Assessment Center", en: "Assessment Center" } },
  { href: "/info-pelatihan", label: { id: "Info Pelatihan", en: "Training Info" } },
];

function Column({ title, links, lang }: { title: string; links: FooterLink[]; lang: Lang }) {
  return (
    <div>
      <h2 className="type-meta mb-5 text-sogan-200">{title}</h2>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="link-grow text-[0.9375rem] text-petrol-200 transition-colors hover:text-paper">
              {l.label[lang]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { language, t } = useLanguage();
  const id = language === "id";
  const year = new Date().getFullYear();

  return (
    <footer className="notranslate relative overflow-hidden bg-petrol-900 text-paper">
      <div className="mx-auto max-w-content px-5 pt-20 md:px-8 lg:px-12 lg:pt-28">
        {/* Pernyataan besar + kontak langsung */}
        <div className="grid gap-10 border-b border-petrol-800 pb-16 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <p className="type-h1 max-w-[16ch] !text-paper">
            {id ? "Mari bicara tentang tata kelola organisasi Anda." : "Let's talk about your organization's governance."}
          </p>
          <div className="space-y-3 lg:text-right">
            <a href="mailto:hello@sangkala.example" className="link-grow inline-block font-serif text-2xl text-paper md:text-3xl">
              hello@sangkala.example
            </a>
            <p className="text-petrol-300">+62 000 0000 0000 · Jakarta, Indonesia</p>
            <p className="text-sm text-petrol-400">{id ? "(alamat fiktif untuk portofolio)" : "(fictional address, for portfolio)"}</p>
          </div>
        </div>

        <div className="grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-10">
          <div>
            <Link href="/" aria-label="Sangkala, beranda">
              <Logo className="h-9 brightness-0 invert" />
            </Link>
            <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-petrol-300">{t("footer.tagline")}</p>
            <div className="mt-6 flex gap-3 text-petrol-200">
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid size-10 place-items-center rounded-full border border-petrol-700 transition-colors hover:border-paper hover:text-paper">
                <Linkedin className="size-4" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid size-10 place-items-center rounded-full border border-petrol-700 transition-colors hover:border-paper hover:text-paper">
                <Instagram className="size-4" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:contents">
            <Column title={t("footer.links.services")} links={serviceLinks} lang={language} />
            <Column title={t("footer.links.industries")} links={industryLinks} lang={language} />
            <Column title={t("footer.links.company")} links={companyLinks} lang={language} />
            <Column title={t("footer.links.platform")} links={platformLinks} lang={language} />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-petrol-800 py-6 text-sm text-petrol-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Sangkala. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/tentang-proyek" className="transition-colors hover:text-paper">
              {id ? "Tentang proyek ini" : "About this project"}
            </Link>
            <Link href="/admin/login" className="inline-flex items-center gap-2 transition-colors hover:text-paper">
              <Lock aria-hidden className="size-4" />
              Portal Admin
            </Link>
          </div>
        </div>
      </div>
      {/* Wordmark raksasa sebagai penutup halaman */}
      <div aria-hidden className="pointer-events-none mx-auto -mb-[4vw] max-w-content select-none px-5 md:px-8 lg:px-12">
        <Logo className="!h-auto w-full opacity-[0.07] brightness-0 invert" />
      </div>
    </footer>
  );
}
