"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Main nav links (without dropdowns)
const mainNavLinks = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/industries", key: "nav.industries" },
];

// Program dropdown items
const programDropdown = {
  label: { id: "Program", en: "Programs" },
  items: [
    { href: "/programs", key: "nav.programs", label: { id: "Program Kami", en: "Our Programs" } },
    { href: "/assessment-center", key: "nav.assessmentCenter", label: { id: "Assessment Center", en: "Assessment Center" } },
    { href: "/info-pelatihan", key: "nav.infoPelatihan", label: { id: "Info Pelatihan", en: "Training Info" } },
  ],
};

// End nav links (after dropdowns)
const endNavLinks = [
  { href: "/methodology", key: "nav.methodology" },
  { href: "/insights", key: "nav.insights" },
  { href: "/news-article", key: "nav.newsArticle" },
  { href: "/contact", key: "nav.contact" },
];

// All links for mobile menu
const allMobileLinks = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/industries", key: "nav.industries" },
  { href: "/programs", key: "nav.programs" },
  { href: "/assessment-center", key: "nav.assessmentCenter" },
  { href: "/info-pelatihan", key: "nav.infoPelatihan" },
  { href: "/methodology", key: "nav.methodology" },
  { href: "/insights", key: "nav.insights" },
  { href: "/news-article", key: "nav.newsArticle" },
  { href: "/contact", key: "nav.contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "id" ? "en" : "id");
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const isDropdownActive = (items: typeof programDropdown.items) => {
    return items.some(item => pathname === item.href);
  };

  return (
    <header
      className={cn(
        "notranslate fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100"
          : "bg-white/80 backdrop-blur-sm"
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-20">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center gap-2 sm:gap-3">
            <Wordmark className="text-lg lg:text-xl" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5" ref={dropdownRef}>
            {/* Main Links */}
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-2 py-1.5 text-xs 2xl:text-sm font-medium rounded-lg transition-all duration-200",
                  pathname === link.href
                    ? "text-petrol-600 bg-petrol-50"
                    : "text-stone-600 hover:text-petrol-600 hover:bg-stone-50"
                )}
              >
                {t(link.key)}
              </Link>
            ))}

            {/* Program Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("program")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 text-xs 2xl:text-sm font-medium rounded-lg transition-all duration-200",
                  isDropdownActive(programDropdown.items)
                    ? "text-petrol-600 bg-petrol-50"
                    : "text-stone-600 hover:text-petrol-600 hover:bg-stone-50"
                )}
              >
                {programDropdown.label[language]}
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  openDropdown === "program" && "rotate-180"
                )} />
              </button>

              <AnimatePresence>
                {openDropdown === "program" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden z-50"
                  >
                    {programDropdown.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className={cn(
                          "block px-4 py-3 text-sm font-medium transition-all duration-200",
                          pathname === item.href
                            ? "text-petrol-600 bg-petrol-50"
                            : "text-stone-600 hover:text-petrol-600 hover:bg-stone-50"
                        )}
                      >
                        {item.label[language]}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* End Nav Links (Methodology, Insight, News & Article, Contact) */}
            {endNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-2 py-1.5 text-xs 2xl:text-sm font-medium rounded-lg transition-all duration-200",
                  pathname === link.href
                    ? "text-petrol-600 bg-petrol-50"
                    : "text-stone-600 hover:text-petrol-600 hover:bg-stone-50"
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 relative z-50">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-stone-600 hover:bg-stone-50 hover:text-petrol-600"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>

            {/* CTA Button */}
            <Link href="/contact" className="hidden md:block">
              <Button variant="primary" size="sm">
                {t("nav.cta")}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors text-stone-700 hover:bg-stone-100"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden absolute top-full left-0 right-0 w-full h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-5rem)] bg-white border-t border-stone-100 shadow-xl z-40 overflow-y-auto overflow-x-hidden will-change-[transform,opacity]"
          >
            <div className="container mx-auto px-4 py-6 sm:py-8 pb-12">
              <div className="flex flex-col gap-2">
                {allMobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-3 text-lg font-medium rounded-lg transition-all duration-150",
                      pathname === link.href
                        ? "text-[#0d5c63] bg-[#0d5c63]/10"
                        : "text-[#2c312f] hover:text-[#0d5c63] hover:bg-[#0d5c63]/5"
                    )}
                  >
                    {t(link.key)}
                  </Link>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 pb-6">
                <Link href="/contact" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="lg" className="w-full">
                    {t("nav.cta")}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
