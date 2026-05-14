"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Instagram,
} from "lucide-react";

const quickLinks = [
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/programs", key: "nav.programs" },
  { href: "/methodology", key: "nav.methodology" },
  { href: "/insights", key: "nav.insights" },
  { href: "/news-article", key: "nav.newsArticle" },
];

const serviceLinks = [
  { href: "/services#people", label: { id: "People Excellence", en: "People Excellence" } },
  { href: "/services#process", label: { id: "Process Optimization", en: "Process Optimization" } },
  { href: "/services#technology", label: { id: "Technology Enablement", en: "Technology Enablement" } },
];

const industryLinks = [
  { href: "/industries#banking", label: { id: "Perbankan", en: "Banking" } },
  { href: "/industries#soe", label: { id: "BUMN", en: "SOE" } },
  { href: "/industries#fintech", label: { id: "Fintech", en: "Fintech" } },
];

export default function Footer() {
  const { language, t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100">
      {/* CTA Section */}
      <div className="border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
                {t("footer.cta")}
              </h3>
              <p className="text-sm sm:text-base text-slate-500">{t("footer.tagline")}</p>
            </div>
            <Link href="/contact" className="w-full md:w-auto">
              <Button variant="gold" size="lg" className="shadow-lg w-full md:w-auto justify-center">
                {t("nav.cta")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 mb-4 lg:mb-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Image
                src="/logo-lna-transparent.png"
                alt="Leadership Nasional Asia"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <span className="font-bold text-base sm:text-lg text-slate-800">Leadership Nasional Asia</span>
            </Link>
            <p className="text-sm sm:text-base text-slate-500 mb-5 sm:mb-6 max-w-sm">
              {language === "id"
                ? "Sustainable Performance through Integrated People, Process, Technology Excellence. People · Process · Technology – Engineered for Resilient Growth."
                : "Sustainable Performance through Integrated People, Process, Technology Excellence. People · Process · Technology – Engineered for Resilient Growth."}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/in/pt-leadership-nasional-asia-b26522382/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://www.instagram.com/leadershipnasionalasia/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-pink-500 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-slate-800 mb-3 sm:mb-4">{t("footer.links.quickLinks")}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-slate-800 mb-3 sm:mb-4">{t("footer.links.services")}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {link.label[language]}
                  </Link>
                </li>
              ))}
              {industryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {link.label[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-semibold text-sm sm:text-base text-slate-800 mb-3 sm:mb-4">{t("footer.links.contact")}</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2.5 sm:gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-500">
                  Pondok Indah Office Tower 3, Lt. 17,<br />
                  Jl. Sultan Iskandar Muda Kav. V-TA,<br />
                  Pondok Indah, Jakarta 12310
                </span>
              </li>
              <li className="flex items-center gap-2.5 sm:gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <a
                  href="tel:+622129538817"
                  className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors"
                >
                  021-29538817
                </a>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:leadership.nasional@gmail.com"
                  className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors break-all sm:break-normal"
                >
                  leadership.nasional@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-slate-500 text-xs sm:text-sm text-center sm:text-left">
              © {currentYear} Leadership Nasional Asia. {t("footer.rights")}
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link
                href="/privacy"
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
