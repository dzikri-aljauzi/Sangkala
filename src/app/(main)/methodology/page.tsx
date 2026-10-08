"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import {
  Search,
  Palette,
  Hammer,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  BarChart3,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: { id: "Assess", en: "Assess" },
    subtitle: { id: "Diagnostic & Gap Analysis", en: "Diagnostic & Gap Analysis" },
    desc: {
      id: "Melakukan penilaian komprehensif terhadap kondisi saat ini di ketiga dimensi: People, Process, dan Technology. Mengidentifikasi gap dan area improvement.",
      en: "Conducting comprehensive assessment of current state across three dimensions: People, Process, and Technology. Identifying gaps and improvement areas.",
    },
    deliverables: {
      id: ["Assessment report", "Gap analysis", "Benchmark data", "Priority matrix"],
      en: ["Assessment report", "Gap analysis", "Benchmark data", "Priority matrix"],
    },
    color: "blue",
  },
  {
    number: "02",
    icon: Palette,
    title: { id: "Design", en: "Design" },
    subtitle: { id: "Integrated People, Process, Technology Framework & Roadmap", en: "Integrated People, Process, Technology Framework & Roadmap" },
    desc: {
      id: "Merancang framework dan roadmap terintegrasi yang menghubungkan ketiga pilar. Memastikan alignment dengan strategi bisnis dan kebutuhan regulasi.",
      en: "Designing integrated framework and roadmap connecting all three pillars. Ensuring alignment with business strategy and regulatory requirements.",
    },
    deliverables: {
      id: ["People, Process, Technology Framework design", "Implementation roadmap", "Quick wins identification", "Resource planning"],
      en: ["People, Process, Technology Framework design", "Implementation roadmap", "Quick wins identification", "Resource planning"],
    },
    color: "teal",
  },
  {
    number: "03",
    icon: Hammer,
    title: { id: "Build", en: "Build" },
    subtitle: { id: "Capability Development + Implementation", en: "Capability Development + Implementation" },
    desc: {
      id: "Membangun kapabilitas melalui training dan development, sekaligus mengimplementasikan improvement pada proses dan teknologi.",
      en: "Building capabilities through training and development, while implementing process and technology improvements.",
    },
    deliverables: {
      id: ["Training programs", "Process improvements", "Technology implementation", "Documentation"],
      en: ["Training programs", "Process improvements", "Technology implementation", "Documentation"],
    },
    color: "cyan",
  },
  {
    number: "04",
    icon: RefreshCw,
    title: { id: "Embed", en: "Embed" },
    subtitle: { id: "Change Management & Institutionalization", en: "Change Management & Institutionalization" },
    desc: {
      id: "Memastikan perubahan tertanam dalam budaya organisasi. Mengelola resistance dan membangun ownership di seluruh level.",
      en: "Ensuring changes are embedded in organizational culture. Managing resistance and building ownership at all levels.",
    },
    deliverables: {
      id: ["Change management plan", "Communication strategy", "Training reinforcement", "Success stories"],
      en: ["Change management plan", "Communication strategy", "Training reinforcement", "Success stories"],
    },
    color: "purple",
  },
  {
    number: "05",
    icon: TrendingUp,
    title: { id: "Sustain", en: "Sustain" },
    subtitle: { id: "Continuous Monitoring & Improvement", en: "Continuous Monitoring & Improvement" },
    desc: {
      id: "Monitoring berkelanjutan dengan Performance Sustainability Index (PSI). Audit periodik dan continuous improvement untuk memastikan keberlanjutan.",
      en: "Continuous monitoring with Performance Sustainability Index (PSI). Periodic audits and continuous improvement to ensure sustainability.",
    },
    deliverables: {
      id: ["PSI dashboard", "Periodic review", "Improvement recommendations", "Best practices sharing"],
      en: ["PSI dashboard", "Periodic review", "Improvement recommendations", "Best practices sharing"],
    },
    color: "gold",
  },
];

const colorMap = {
  blue: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    text: "text-petrol-600",
    border: "border-petrol-300",
  },
  teal: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    text: "text-petrol-600",
    border: "border-petrol-300",
  },
  cyan: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    text: "text-petrol-600",
    border: "border-petrol-300",
  },
  purple: {
    gradient: "bg-petrol-800",
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-300",
  },
  gold: {
    gradient: "bg-stone-700",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-300",
  },
};

export default function MethodologyPage() {
  const { language } = useLanguage();

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-petrol-600 mb-3 sm:mb-4">
              {language === "id" ? "Metodologi" : "Methodology"}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-stone-800">
              {language === "id" ? "Pendekatan Kami" : "Our Approach"}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-stone-600 max-w-3xl">
              {language === "id"
                ? "Framework 5 tahap yang terstruktur untuk memastikan transformasi yang terukur dan berkelanjutan."
                : "Structured 5-stage framework to ensure measurable and sustainable transformation."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Methodology Steps */}
      <Section variant="default" padding="xl">
        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-stone-200 -translate-x-1/2" />

          <div className="space-y-10 sm:space-y-12 lg:space-y-16">
            {steps.map((step, index) => {
              const colors = colorMap[step.color as keyof typeof colorMap];
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className={`grid lg:grid-cols-2 gap-6 sm:gap-8 items-center ${isEven ? "" : "lg:flex-row-reverse"}`}>
                    {/* Content */}
                    <div className={`${isEven ? "lg:pr-16 lg:text-right" : "lg:pl-16 lg:order-2"}`}>
                      <div className={`inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 ${isEven ? "lg:flex-row-reverse" : ""}`}>
                        <span className={`text-4xl sm:text-5xl md:text-6xl font-bold ${colors.text} opacity-20`}>
                          {step.number}
                        </span>
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl ${colors.gradient} flex items-center justify-center`}>
                          <step.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                        </div>
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-800 mb-1 sm:mb-2">
                        {step.title[language]}
                      </h2>
                      <p className={`text-sm sm:text-base md:text-lg ${colors.text} mb-3 sm:mb-4`}>
                        {step.subtitle[language]}
                      </p>
                      <p className="text-xs sm:text-sm md:text-base text-stone-500">{step.desc[language]}</p>
                    </div>

                    {/* Deliverables */}
                    <div className={`${colors.bg} rounded-xl sm:rounded-2xl p-4 sm:p-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                      <h3 className="font-semibold text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                        {language === "id" ? "Deliverables:" : "Deliverables:"}
                      </h3>
                      <ul className="space-y-2 sm:space-y-3">
                        {step.deliverables[language].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 sm:gap-3">
                            <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text} flex-shrink-0`} />
                            <span className="text-xs sm:text-sm md:text-base text-stone-500">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className={`w-6 h-6 rounded-full ${colors.gradient} border-4 border-white shadow-lg`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* PSI Section */}
      <Section variant="light" padding="xl">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-petrol-500 mb-4 sm:mb-6">
              <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-800 mb-3 sm:mb-4">
              Performance Sustainability Index (PSI)
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-stone-500">
              {language === "id"
                ? "Setiap engagement kami terukur dengan Performance Sustainability Index (PSI) yang melacak progress di 3 dimensi secara real-time."
                : "Every engagement is measured with Performance Sustainability Index (PSI) tracking progress across 3 dimensions in real-time."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "People Index",
                desc: { id: "Mengukur kapabilitas dan budaya", en: "Measuring capability and culture" },
                color: "blue",
              },
              {
                title: "Process Index",
                desc: { id: "Mengukur efisiensi dan compliance", en: "Measuring efficiency and compliance" },
                color: "teal",
              },
              {
                title: "Technology Index",
                desc: { id: "Mengukur digital maturity", en: "Measuring digital maturity" },
                color: "cyan",
              },
            ].map((item, index) => {
              const colors = colorMap[item.color as keyof typeof colorMap];

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg text-center"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full ${colors.gradient} flex items-center justify-center mb-3 sm:mb-4`}>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                      {item.title.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-800 mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-stone-500">{item.desc[language]}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section variant="dark" padding="xl">
        <div className="max-w-4xl mx-auto text-center px-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              {language === "id"
                ? "Siap Memulai Transformasi?"
                : "Ready to Start Your Transformation?"}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-stone-300 mb-6 sm:mb-8">
              {language === "id"
                ? "Konsultasi gratis untuk memahami bagaimana metodologi kami dapat diterapkan di organisasi Anda."
                : "Free consultation to understand how our methodology can be applied in your organization."}
            </p>
            <Link href="/contact" className="block sm:inline-block">
              <Button variant="gold" size="xl" className="group w-full sm:w-auto justify-center">
                {language === "id" ? "Jadwalkan Konsultasi" : "Schedule Consultation"}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
