"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type Lang = "id" | "en";
interface NavItem {
  href: string;
  label: Record<Lang, string>;
  desc?: Record<Lang, string>;
}
interface NavGroup extends NavItem {
  children?: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    href: "/services",
    label: { id: "Layanan", en: "Services" },
    children: [
      { href: "/services", label: { id: "Layanan Kami", en: "Our Services" }, desc: { id: "People, Process, Technology dalam satu kerangka", en: "People, Process, Technology in one framework" } },
      { href: "/methodology", label: { id: "Metodologi", en: "Methodology" }, desc: { id: "Assess → Design → Build → Embed → Sustain", en: "Assess → Design → Build → Embed → Sustain" } },
    ],
  },
  { href: "/industries", label: { id: "Industri", en: "Industries" } },
  {
    href: "/programs",
    label: { id: "Program", en: "Programs" },
    children: [
      { href: "/programs", label: { id: "Program Unggulan", en: "Flagship Programs" }, desc: { id: "Academy, konsultasi, dan sertifikasi", en: "Academy, consulting, and certification" } },
      { href: "/info-pelatihan", label: { id: "Jadwal Pelatihan", en: "Training Schedule" }, desc: { id: "Daftar langsung secara daring", en: "Register online" } },
      { href: "/assessment-center", label: { id: "Assessment Center", en: "Assessment Center" }, desc: { id: "Portal asesmen multi-peran", en: "Multi-role assessment portal" } },
    ],
  },
  {
    href: "/insights",
    label: { id: "Insight", en: "Insights" },
    children: [
      { href: "/insights", label: { id: "Insight & Whitepaper", en: "Insights & Whitepapers" }, desc: { id: "Riset, webinar, studi kasus", en: "Research, webinars, case studies" } },
      { href: "/news-article", label: { id: "News & Article", en: "News & Articles" }, desc: { id: "Kabar dan artikel terbaru", en: "Latest news and articles" } },
    ],
  },
  { href: "/about", label: { id: "Tentang", en: "About" } },
];

function isActive(pathname: string, item: NavGroup) {
  const hrefs = [item.href, ...(item.children?.map((c) => c.href) ?? [])];
  return hrefs.some((h) => pathname === h || pathname.startsWith(h + "/"));
}

function LanguageToggle({ onDark }: { onDark: boolean }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-1 text-xs" role="group" aria-label="Bahasa / Language">
      {(["id", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className={onDark ? "text-petrol-300" : "text-stone-400"}>/</span>}
          <button
            type="button"
            onClick={() => setLanguage(l)}
            aria-pressed={language === l}
            className={cn(
              "type-meta !tracking-wider px-1 py-0.5 transition-colors",
              language === l
                ? cn("underline underline-offset-4", onDark ? "text-paper decoration-sogan-200" : "text-ink decoration-petrol-600")
                : onDark
                  ? "text-petrol-100 hover:text-paper"
                  : "text-stone-700 hover:text-ink"
            )}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  // Tutup menu saat pindah halaman (penyesuaian state saat render, bukan di effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMobileOpen(false);
    setOpenGroup(null);
  }

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // sembunyi saat turun jauh, muncul lagi saat naik
      setHidden(y > 480 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 480) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // Di puncak halaman header transparan di atas hero gelap; setelah scroll jadi solid.
  // Halaman login asesmen punya panel terang di kanan, jadi header selalu solid di sana.
  const forceSolid = /\/assessment-center\/[^/]+\/login$/.test(pathname ?? "");
  const solid = scrolled || !!openGroup || forceSolid;
  const onDark = !solid || mobileOpen;

  return (
    <>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-petrol-600 focus:px-4 focus:py-2 focus:text-white"
      >
        {t("nav.skip")}
      </a>
      <div
        className={cn(
          "notranslate fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 [transition-timing-function:cubic-bezier(.2,.7,.2,1)]",
          hidden && !mobileOpen && "-translate-y-full",
          mobileOpen ? "bg-petrol-900" : solid ? "border-b border-stone-200 bg-paper/95 backdrop-blur-md" : "border-b border-white/10 bg-petrol-900/40"
        )}
      >
        {/* Baris utilitas: hilang saat header menjadi solid */}
        <div
          className={cn(
            "hidden overflow-hidden transition-[height,opacity] duration-300 lg:block",
            solid ? "h-0 opacity-0" : "h-8 opacity-100"
          )}
        >
          <div className="mx-auto flex h-8 max-w-content items-center justify-end gap-6 px-12 text-xs">
            <Link href="/verify" className="text-petrol-100 transition-colors hover:text-paper">
              {t("nav.verify")}
            </Link>
            <Link href="/assessment-center" className="text-petrol-100 transition-colors hover:text-paper">
              {t("nav.portal")}
            </Link>
            <span aria-hidden className="h-3 w-px bg-white/20" />
            <LanguageToggle onDark />
          </div>
        </div>

        <header>
          <nav aria-label="Utama" className="mx-auto flex h-16 max-w-content items-center justify-between px-5 md:px-8 lg:h-[72px] lg:px-12">
            <Link href="/" aria-label="Sangkala, beranda" className="shrink-0">
              <Logo className={cn("h-8 transition-[filter] duration-300 lg:h-9", onDark && "brightness-0 invert")} priority />
            </Link>

            <div ref={navRef} className="hidden items-stretch gap-1 self-stretch lg:flex">
              {navGroups.map((g) => {
                const active = isActive(pathname, g);
                const open = openGroup === g.href;
                const base = "relative flex items-center gap-1 px-4 text-[0.9375rem] font-medium transition-colors";
                const state = onDark
                  ? active ? "text-paper" : "text-petrol-100 hover:text-paper"
                  : active ? "text-ink" : "text-stone-700 hover:text-petrol-600";
                const underline = (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-4 bottom-0 h-0.5 origin-left transition-transform duration-300",
                      onDark ? "bg-sogan-200" : "bg-petrol-600",
                      active || open ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                );
                if (!g.children) {
                  return (
                    <Link key={g.href} href={g.href} aria-current={active ? "page" : undefined} className={cn(base, state, "group")}>
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
                      <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
                      {underline}
                    </button>
                    {open && (
                      <div className="fade-in absolute left-0 top-full z-50 w-[22rem] border border-stone-200 bg-paper p-2 shadow-xl [--d:0ms]">
                        {g.children.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            className="group flex items-start justify-between gap-4 rounded-md px-4 py-3 transition-colors hover:bg-petrol-50"
                          >
                            <span>
                              <span className={cn("block text-[0.9375rem] font-medium", pathname === c.href ? "text-petrol-600" : "text-ink")}>
                                {c.label[language]}
                              </span>
                              {c.desc && <span className="mt-0.5 block text-sm text-stone-700">{c.desc[language]}</span>}
                            </span>
                            <ArrowUpRight aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-petrol-600" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className={cn(
                  "hidden h-10 items-center rounded-lg border px-5 text-[0.9375rem] font-semibold transition-colors md:inline-flex",
                  onDark ? "border-paper/70 text-paper hover:bg-paper hover:text-petrol-900" : "border-ink text-ink hover:bg-ink hover:text-paper"
                )}
              >
                {t("nav.contactUs")}
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="menu-mobile"
                aria-label={mobileOpen ? t("nav.close") : t("nav.menu")}
                className={cn("-mr-2 p-2 lg:hidden", onDark ? "text-paper" : "text-ink")}
              >
                {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
              </button>
            </div>
          </nav>
        </header>

        {mobileOpen && (
          <div id="menu-mobile" className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-petrol-900 text-paper lg:hidden">
            <div className="px-5 pb-12 pt-4">
              <ul>
                {navGroups.map((g, i) => (
                  <li key={g.href} className="fade-in border-b border-white/10 py-5" style={{ ["--d" as string]: `${i * 60}ms` }}>
                    <div className="flex items-baseline gap-4">
                      <span className="type-meta w-8 shrink-0 !tracking-normal text-sogan-200">{String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1">
                        <Link href={g.href} className="font-serif text-[2rem] leading-tight text-paper">
                          {g.label[language]}
                        </Link>
                        {g.children && (
                          <ul className="mt-2 space-y-1">
                            {g.children
                              .filter((c) => c.href !== g.href)
                              .map((c) => (
                                <li key={c.href}>
                                  <Link href={c.href} className="block py-1 text-[0.9375rem] text-petrol-200">
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
              <ul className="mt-8 space-y-3 text-[0.9375rem] text-petrol-200">
                <li><Link href="/verify">{t("nav.verify")} →</Link></li>
                <li><Link href="/assessment-center">{t("nav.portal")} →</Link></li>
              </ul>
              <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
                <LanguageToggle onDark />
                <Link href="/contact" className="inline-flex h-12 items-center rounded-lg bg-paper px-6 text-[0.9375rem] font-semibold text-petrol-900">
                  {t("nav.contactUs")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
