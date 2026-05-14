"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { Users, Cog, Cpu, ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: Users,
    titleKey: "about.pillars.people.title",
    descKey: "about.pillars.people.desc",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Cog,
    titleKey: "about.pillars.process.title",
    descKey: "about.pillars.process.desc",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: Cpu,
    titleKey: "about.pillars.technology.title",
    descKey: "about.pillars.technology.desc",
    color: "from-cyan-500 to-cyan-600",
  },
];

export default function AboutPreview() {
  const { t, language } = useLanguage();

  return (
    <Section variant="light" padding="xl">
      <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-cyan-600 mb-2 sm:mb-3">
            {t("about.subtitle")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
            {language === "id"
              ? "Integrator Ekosistem Kinerja"
              : "Performance Ecosystem Integrator"}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-500 mb-4 sm:mb-6">{t("about.narrative")}</p>
          <p className="text-sm sm:text-base lg:text-lg text-slate-500 mb-6 sm:mb-8">{t("about.intro")}</p>

          <Link href="/about">
            <Button variant="primary" size="lg" className="group w-full sm:w-auto justify-center">
              {language === "id" ? "Pelajari Lebih Lanjut" : "Learn More"}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* 3P Pillars */}
        <div className="space-y-4 sm:space-y-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.titleKey}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center flex-shrink-0`}
                >
                  <pillar.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">
                    {t(pillar.titleKey)}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500">{t(pillar.descKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Differentiator Quote */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-12 sm:mt-16 text-center"
      >
        <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 italic px-4">
          "{t("about.differentiator")}"
        </blockquote>
      </motion.div>
    </Section>
  );
}
