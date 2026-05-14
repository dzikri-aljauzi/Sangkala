"use client";

import { useRef, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Cog, Cpu } from "lucide-react";

// Dynamic import for 3D Globe to avoid SSR issues
const Globe3D = dynamic(() => import("@/components/ui/3d-globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

// Markers with correct coordinates
const indonesiaMarkers = [
  { lat: -6.2615, lng: 106.8106, label: "Jakarta Selatan" },
  { lat: -7.9666, lng: 112.6326, label: "Malang" },
  { lat: 1.3521, lng: 103.8198, label: "Singapore" },
];

export default function Hero() {
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center bg-gradient-to-br from-sky-50 via-white to-blue-50 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-sky-300/25 rounded-full blur-[100px] sm:blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-300/20 rounded-full blur-[100px] sm:blur-[120px]"
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-cyan-200/15 rounded-full blur-[120px] sm:blur-[150px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 sm:pt-28 lg:pt-0 pb-8 sm:pb-12 lg:pb-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Content - Text Section */}
          <div className="order-1 relative z-20">
            {/* 3P Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap gap-2 sm:gap-3 mb-5 sm:mb-6"
            >
              {[
                { icon: Users, label: "People" },
                { icon: Cog, label: "Process" },
                { icon: Cpu, label: "Technology" },
              ].map((item, index) => (
                <motion.span
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium border border-blue-100 shadow-sm text-slate-700"
                >
                  <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  {item.label}
                </motion.span>
              ))}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[1.75rem] leading-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold sm:leading-tight mb-4 sm:mb-6 text-slate-800"
            >
              {t("hero.headline")}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-xl leading-relaxed"
            >
              {t("hero.subheadline")}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="gold" size="lg" className="group shadow-lg w-full sm:w-auto justify-center">
                  {t("hero.ctaPrimary")}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/programs" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto justify-center">
                  {t("hero.ctaSecondary")}
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-200"
            >
              <p className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3">
                {language === "id" ? "Dipercaya oleh:" : "Trusted by:"}
              </p>
              <div className="flex flex-wrap gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-1 items-center">
                <span className="text-slate-600 font-medium text-xs sm:text-sm">BUMN Strategis</span>
                <span className="text-slate-600 font-medium text-xs sm:text-sm">Bank Nasional</span>
                <span className="text-slate-600 font-medium text-xs sm:text-sm">Fintech Leaders</span>
              </div>
            </motion.div>
          </div>

          {/* 3D Globe */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="order-2 relative z-10 w-full flex flex-col items-center justify-center"
          >
            {/* Mobile Title Above Globe */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:hidden text-center mb-4"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-slate-700">
                {t("hero.globeTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Jakarta • Malang • Singapore
              </p>
            </motion.div>

            <div className="relative w-full max-w-[300px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-none h-[300px] sm:h-[340px] md:h-[400px] lg:h-[500px] xl:h-[560px] flex items-center justify-center mx-auto">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              >
                <Globe3D
                  markers={indonesiaMarkers}
                  config={{
                    radius: 1.75,
                    atmosphereColor: "#93c5fd",
                    atmosphereIntensity: 0.8,
                    atmosphereBlur: 2,
                    autoRotateSpeed: 0.3,
                    wireframeColor: "#93c5fd",
                    showWireframe: true,
                    showAtmosphere: true,
                    markerColor: "#fbbf24",
                    ambientIntensity: 1.2,
                    pointLightIntensity: 1.8,
                  }}
                  className="h-full w-full"
                  onMarkerClick={(marker) => console.log("Clicked:", marker.label)}
                />
              </Suspense>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
