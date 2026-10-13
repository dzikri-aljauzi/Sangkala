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
            <Link href={l.href} className="text-[0.9375rem] text-petrol-200 transition-colors hover:text-paper hover:underline underline-offset-4">
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
  const year = new Date().getFullYear();

  return (
    <footer className="notranslate bg-petrol-900 text-paper">
      <div className="mx-auto max-w-content px-5 pb-10 pt-16 md:px-8 lg:px-12 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-10">
          <div>
            <Link href="/" aria-label="Sangkala, beranda">
              {/* Logo satu warna petrol; dirender putih di atas Petrol 900. */}
              <Logo className="h-9 brightness-0 invert" />
            </Link>
            <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-petrol-300">
              {t("footer.tagline")}
            </p>
            <div className="mt-6 flex gap-4 text-petrol-300">
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition-colors hover:text-paper">
                <Linkedin className="size-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-colors hover:text-paper">
                <Instagram className="size-5" />
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

        <div className="mt-14 grid gap-8 border-t border-petrol-800 pt-8 md:grid-cols-2">
          <address className="not-italic text-[0.9375rem] leading-relaxed text-petrol-300">
            <span className="type-meta mb-3 block text-sogan-200">{t("footer.links.contact")}</span>
            Jakarta, Indonesia
            <br />
            <span className="text-petrol-400">(alamat fiktif untuk portofolio)</span>
            <br />
            <a href="mailto:hello@sangkala.example" className="hover:text-paper hover:underline underline-offset-4">
              hello@sangkala.example
            </a>
            <br />
            <a href="tel:+620000000000" className="hover:text-paper hover:underline underline-offset-4">
              +62 000 0000 0000
            </a>
          </address>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-petrol-800 pt-6 text-sm text-petrol-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Sangkala. {t("footer.rights")}
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 transition-colors hover:text-paper"
          >
            <Lock aria-hidden className="size-4" />
            Portal Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
