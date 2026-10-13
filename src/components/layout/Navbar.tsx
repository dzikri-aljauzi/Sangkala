"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type Lang = "id" | "en";
interface NavItem {
  href: string;
  label: Record<Lang, string>;
}
interface NavGroup extends NavItem {
  /** Jika ada, grup tampil sebagai dropdown dan `href` jadi item pertamanya. */
  children?: NavItem[];
}

// Lima item utama (DESIGN.md). Halaman lain dicapai lewat dropdown dan footer.
const navGroups: NavGroup[] = [
  {
    href: "/services",
    label: { id: "Layanan", en: "Services" },
    children: [
      { href: "/services", label: { id: "Layanan Kami", en: "Our Services" } },
      { href: "/methodology", label: { id: "Metodologi", en: "Methodology" } },
    ],
  },
  { href: "/industries", label: { id: "Industri", en: "Industries" } },
  {
    href: "/programs",
    label: { id: "Program", en: "Programs" },
    children: [
      { href: "/programs", label: { id: "Program Kami", en: "Our Programs" } },
      { href: "/info-pelatihan", label: { id: "Info Pelatihan", en: "Training Info" } },
      { href: "/assessment-center", label: { id: "Assessment Center", en: "Assessment Center" } },
    ],
  },
  {
    href: "/insights",
    label: { id: "Insight", en: "Insights" },
    children: [
      { href: "/insights", label: { id: "Insight & Whitepaper", en: "Insights & Whitepapers" } },
      { href: "/news-article", label: { id: "News & Article", en: "News & Articles" } },
    ],
  },
  { href: "/about", label: { id: "Tentang", en: "About" } },
];

function isActive(pathname: string, item: NavGroup) {
  const hrefs = [item.href, ...(item.children?.map((c) => c.href) ?? [])];
  return hrefs.some((h) => pathname === h || pathname.startsWith(h + "/"));
}

function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div className={cn("flex items-center gap-1 text-xs", className)} role="group" aria-label="Bahasa / Language">
      {(["id", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="text-stone-400">/</span>}
          <button
            type="button"
            onClick={() => setLanguage(l)}
            aria-pressed={language === l}
            className={cn(
              "type-meta !tracking-wider px-1 py-0.5 transition-colors",
              language === l ? "text-ink underline underline-offset-4 decoration-petrol-600" : "text-stone-700 hover:text-ink"
            )}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}

/** Baris utilitas: fungsi khas Sangkala yang bukan navigasi utama. Hanya desktop. */
function UtilityBar() {
  const { t } = useLanguage();
  return (
    <div className="notranslate hidden border-b border-stone-200 bg-stone-100 lg:block">
      <div className="mx-auto flex h-8 max-w-content items-center justify-end gap-6 px-12 text-xs text-stone-700">
        <Link href="/verify" className="transition-colors hover:text-petrol-600">
          {t("nav.verify")}
        </Link>
        <Link href="/assessment-center" className="transition-colors hover:text-petrol-600">
          {t("nav.portal")}
        </Link>
        <span aria-hidden className="h-3 w-px bg-stone-200" />
        <LanguageToggle />
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  // Tutup menu saat pindah halaman.
  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-petrol-600 focus:px-4 focus:py-2 focus:text-white"
      >
        {t("nav.skip")}
      </a>
      <UtilityBar />
      <header className="notranslate sticky top-0 z-50 border-b border-stone-200 bg-paper">
        <nav
          aria-label="Utama"
          className="mx-auto flex h-16 max-w-content items-center justify-between px-5 md:px-8 lg:h-[72px] lg:px-12"
        >
          <Link href="/" aria-label="Sangkala, beranda" className="shrink-0">
            <Logo className="h-8 lg:h-9" priority />
          </Link>

          {/* Desktop */}
          <div ref={navRef} className="hidden items-stretch gap-1 self-stretch lg:flex">
            {navGroups.map((g) => {
              const active = isActive(pathname, g);
              const open = openGroup === g.href;
              const base =
                "relative flex items-center gap-1 px-4 text-[0.9375rem] font-medium transition-colors";
              const state = active ? "text-ink" : "text-stone-700 hover:text-petrol-600";
              const underline = active && (
                <span aria-hidden className="absolute inset-x-4 bottom-0 h-0.5 bg-petrol-600" />
              );
              if (!g.children) {
                return (
                  <Link key={g.href} href={g.href} aria-current={active ? "page" : undefined} className={cn(base, state)}>
                    {g.label[language]}
                    {underline}
                  </Link>
                );
              }
              return (
                <div key={g.href} className="relative flex">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="true"
                    onClick={() => setOpenGroup(open ? null : g.href)}
                    className={cn(base, state)}
                  >
                    {g.label[language]}
                    <ChevronDown aria-hidden className={cn("size-4 transition-transform", open && "rotate-180")} />
                    {underline}
                  </button>
                  {open && (
                    <ul className="absolute left-0 top-full z-50 w-64 border border-stone-200 bg-paper py-2 shadow-md">
                      {g.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            className={cn(
                              "block px-5 py-2.5 text-[0.9375rem] transition-colors hover:bg-stone-100 hover:text-petrol-600",
                              pathname === c.href ? "text-ink font-medium" : "text-stone-700"
                            )}
                          >
                            {c.label[language]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Tombol sekunder: tombol utama milik isi halaman (DESIGN.md) */}
            <Link
              href="/contact"
              className="hidden h-10 items-center rounded-lg border border-ink px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-stone-100 md:inline-flex"
            >
              {t("nav.contactUs")}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="menu-mobile"
              aria-label={mobileOpen ? t("nav.close") : t("nav.menu")}
              className="-mr-2 p-2 text-ink lg:hidden"
            >
              {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile: panel layar penuh berisi indeks */}
        {mobileOpen && (
          <div
            id="menu-mobile"
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-paper lg:hidden"
          >
            <div className="px-5 pb-12 pt-6">
              <ul className="border-t border-ink">
                {navGroups.map((g, i) => (
                  <li key={g.href} className="border-b border-stone-200 py-4">
                    <div className="flex items-baseline gap-4">
                      <span className="type-meta w-8 shrink-0 !tracking-normal text-stone-700">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <Link href={g.href} className="type-card block !text-[1.375rem]">
                          {g.label[language]}
                        </Link>
                        {g.children && (
                          <ul className="mt-2 space-y-1">
                            {g.children
                              .filter((c) => c.href !== g.href)
                              .map((c) => (
                                <li key={c.href}>
                                  <Link href={c.href} className="block py-1 text-[0.9375rem] text-stone-700">
                                    {c.label[language]}
                                  </Link>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <ul className="mt-6 space-y-3 text-[0.9375rem] text-stone-700">
                <li>
                  <Link href="/verify" className="inline-flex items-center gap-2">
                    {t("nav.verify")} <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </li>
                <li>
                  <Link href="/assessment-center" className="inline-flex items-center gap-2">
                    {t("nav.portal")} <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </li>
              </ul>

              <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-6">
                <LanguageToggle />
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center rounded-lg bg-petrol-600 px-6 text-[0.9375rem] font-semibold text-white hover:bg-petrol-700"
                >
                  {t("nav.contactUs")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
