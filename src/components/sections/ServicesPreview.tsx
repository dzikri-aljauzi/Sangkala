"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import {
  Users,
  Cog,
  Cpu,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Target,
  FileCheck,
  LineChart,
  Cloud,
  Lock,
  Database,
} from "lucide-react";

const services = [
  {
    pillar: "People Excellence",
    pillarKey: "services.people.title",
    icon: Users,
    color: "blue",
    items: [
      { icon: GraduationCap, titleKey: "services.people.items.0.title", descKey: "services.people.items.0.desc" },
      { icon: ShieldCheck, titleKey: "services.people.items.1.title", descKey: "services.people.items.1.desc" },
      { icon: Target, titleKey: "services.people.items.2.title", descKey: "services.people.items.2.desc" },
    ],
  },
  {
    pillar: "Process Optimization",
    pillarKey: "services.process.title",
    icon: Cog,
    color: "teal",
    items: [
      { icon: FileCheck, titleKey: "services.process.items.0.title", descKey: "services.process.items.0.desc" },
      { icon: LineChart, titleKey: "services.process.items.1.title", descKey: "services.process.items.1.desc" },
      { icon: ShieldCheck, titleKey: "services.process.items.2.title", descKey: "services.process.items.2.desc" },
    ],
  },
  {
    pillar: "Technology Enablement",
    pillarKey: "services.technology.title",
    icon: Cpu,
    color: "cyan",
    items: [
      { icon: Cloud, titleKey: "services.technology.items.0.title", descKey: "services.technology.items.0.desc" },
      { icon: Lock, titleKey: "services.technology.items.1.title", descKey: "services.technology.items.1.desc" },
      { icon: Database, titleKey: "services.technology.items.2.title", descKey: "services.technology.items.2.desc" },
    ],
  },
];

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    text: "text-blue-600",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    iconBg: "bg-gradient-to-br from-teal-500 to-teal-600",
    text: "text-teal-600",
  },
  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    iconBg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    text: "text-cyan-600",
  },
};

export default function ServicesPreview() {
  const { t, language } = useLanguage();

  return (
    <Section variant="default" padding="xl">
      <SectionHeader
        title={t("services.title")}
        subtitle={t("services.subtitle")}
        description={t("services.description")}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
        {services.map((service, index) => {
          const colors = colorMap[service.color as keyof typeof colorMap];

          return (
            <motion.div
              key={service.pillar}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 ${colors.bg} border ${colors.border}`}
            >
              {/* Pillar Header */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${colors.iconBg} flex items-center justify-center`}
                >
                  <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${colors.text}`}>
                  {t(service.pillarKey)}
                </h3>
              </div>

              {/* Service Items */}
              <div className="space-y-3 sm:space-y-4">
                {service.items.map((item) => (
                  <div
                    key={item.titleKey}
                    className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                      <div>
                        <h4 className="font-semibold text-slate-800 text-xs sm:text-sm mb-0.5 sm:mb-1">
                          {t(item.titleKey)}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                          {t(item.descKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center mt-10 sm:mt-12"
      >
        <Link href="/services">
          <Button variant="primary" size="lg" className="group w-full sm:w-auto justify-center">
            {language === "id" ? "Lihat Semua Layanan" : "View All Services"}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </motion.div>
    </Section>
  );
}
