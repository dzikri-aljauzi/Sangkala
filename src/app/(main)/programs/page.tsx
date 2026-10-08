"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  ArrowRight,
  Clock,
  Users,
  Award,
  CheckCircle,
  Calendar,
  Target,
  Briefcase,
} from "lucide-react";

const programs = [
  {
    id: "grc-academy",
    title: { id: "GRC Leadership Academy for Financial Institutions", en: "GRC Leadership Academy for Financial Institutions" },
    duration: { id: "6 bulan cohort program", en: "6-month cohort program" },
    desc: {
      id: "Program komprehensif untuk membangun kompetensi GRC di level kepemimpinan. Modul mencakup Governance, Risk, Compliance, Business Judgment Rule, dan Crisis Management. Blended learning dengan workshop, coaching, dan simulasi.",
      en: "Comprehensive program to build GRC competencies at leadership level. Modules cover Governance, Risk, Compliance, Business Judgment Rule, and Crisis Management. Blended learning with workshops, coaching, and simulations.",
    },
    highlights: [
      { id: "Certification", en: "Certification" },
      { id: "Alumni Network", en: "Alumni Network" },
      { id: "Executive Coaching", en: "Executive Coaching" },
    ],
    features: {
      id: [
        "6 modul intensif",
        "Workshop bulanan",
        "Coaching session individual",
        "Simulasi kasus nyata",
        "Sertifikasi kelulusan",
        "Akses alumni network eksklusif",
      ],
      en: [
        "6 intensive modules",
        "Monthly workshops",
        "Individual coaching sessions",
        "Real case simulations",
        "Completion certification",
        "Exclusive alumni network access",
      ],
    },
    audience: { id: "Board, C-Level, Senior Management", en: "Board, C-Level, Senior Management" },
    color: "blue",
  },
  {
    id: "ipt-consulting",
    title: { id: "Integrated Performance Transformation (IPT) Consulting", en: "Integrated Performance Transformation (IPT) Consulting" },
    duration: { id: "9-12 bulan engagement", en: "9-12 month engagement" },
    desc: {
      id: "End-to-end engagement untuk transformasi organisasi yang holistik. Dimulai dari diagnostic, design, implementation, hingga monitoring. Deliverable mencakup Integrated People, Process, Technology roadmap, KPI dashboard, dan change management plan.",
      en: "End-to-end engagement for holistic organizational transformation. Starting from diagnostic, design, implementation, to monitoring. Deliverables include Integrated People, Process, Technology roadmap, KPI dashboard, and change management plan.",
    },
    highlights: [
      { id: "Full Transformation Support", en: "Full Transformation Support" },
      { id: "Dedicated Team", en: "Dedicated Team" },
      { id: "Measurable KPIs", en: "Measurable KPIs" },
    ],
    features: {
      id: [
        "Diagnostic & gap analysis",
        "Customized People, Process, Technology roadmap",
        "Implementation support",
        "Change management",
        "Performance dashboard",
        "Quarterly review & adjustment",
      ],
      en: [
        "Diagnostic & gap analysis",
        "Customized People, Process, Technology roadmap",
        "Implementation support",
        "Change management",
        "Performance dashboard",
        "Quarterly review & adjustment",
      ],
    },
    audience: { id: "Organisasi yang membutuhkan transformasi menyeluruh", en: "Organizations requiring comprehensive transformation" },
    color: "teal",
  },
  {
    id: "digital-bootcamp",
    title: { id: "Digital Readiness Bootcamp for BUMN", en: "Digital Readiness Bootcamp for SOEs" },
    duration: { id: "3 bulan intensive program", en: "3-month intensive program" },
    desc: {
      id: "Program intensif untuk mempercepat kesiapan digital BUMN. Coverage mencakup digital strategy, IT governance, data analytics, dan cybersecurity. Outcome berupa digital transformation roadmap dan quick wins implementation.",
      en: "Intensive program to accelerate SOE digital readiness. Coverage includes digital strategy, IT governance, data analytics, and cybersecurity. Outcome includes digital transformation roadmap and quick wins implementation.",
    },
    highlights: [
      { id: "Quick Wins", en: "Quick Wins" },
      { id: "Roadmap", en: "Roadmap" },
      { id: "Hands-on Practice", en: "Hands-on Practice" },
    ],
    features: {
      id: [
        "Digital maturity assessment",
        "Digital strategy workshop",
        "IT governance framework",
        "Data analytics fundamentals",
        "Cybersecurity awareness",
        "Implementation of 3 quick wins",
      ],
      en: [
        "Digital maturity assessment",
        "Digital strategy workshop",
        "IT governance framework",
        "Data analytics fundamentals",
        "Cybersecurity awareness",
        "Implementation of 3 quick wins",
      ],
    },
    audience: { id: "BUMN yang memulai transformasi digital", en: "SOEs starting digital transformation" },
    color: "cyan",
  },
  {
    id: "it-grc-certification",
    title: { id: "Certified IT GRC Professional Program", en: "Certified IT GRC Professional Program" },
    duration: { id: "Preparation program", en: "Preparation program" },
    desc: {
      id: "Program persiapan untuk sertifikasi IT GRC internasional seperti CGRC (ISC²), CRISC (ISACA), atau GRCP (OCEG). Instruktur certified dengan study materials lengkap dan exam simulation.",
      en: "Preparation program for international IT GRC certifications such as CGRC (ISC²), CRISC (ISACA), or GRCP (OCEG). Certified instructors with complete study materials and exam simulation.",
    },
    highlights: [
      { id: "Exam Preparation", en: "Exam Preparation" },
      { id: "Post-program Mentoring", en: "Post-program Mentoring" },
      { id: "Study Materials", en: "Study Materials" },
    ],
    features: {
      id: [
        "Kurikulum sesuai exam syllabus",
        "Instruktur bersertifikat",
        "Study materials lengkap",
        "Practice questions bank",
        "Exam simulation",
        "Post-program mentoring",
      ],
      en: [
        "Curriculum aligned with exam syllabus",
        "Certified instructors",
        "Complete study materials",
        "Practice questions bank",
        "Exam simulation",
        "Post-program mentoring",
      ],
    },
    audience: { id: "IT professionals, Risk & Compliance professionals", en: "IT professionals, Risk & Compliance professionals" },
    color: "gold",
  },
];

const colorMap = {
  blue: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    border: "border-petrol-200",
    text: "text-petrol-600",
  },
  teal: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    border: "border-petrol-200",
    text: "text-petrol-600",
  },
  cyan: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    border: "border-petrol-200",
    text: "text-petrol-600",
  },
  gold: {
    gradient: "bg-stone-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
  },
};

export default function ProgramsPage() {
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
              {language === "id" ? "Program Unggulan" : "Flagship Programs"}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-stone-800">
              {language === "id"
                ? "Program Unggulan Kami"
                : "Our Flagship Programs"}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-stone-600 max-w-3xl">
              {language === "id"
                ? "Program signature dengan dampak terukur untuk transformasi organisasi Anda."
                : "Signature programs with measurable impact for your organizational transformation."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programs List */}
      <Section variant="default" padding="xl">
        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {programs.map((program, index) => {
            const colors = colorMap[program.color as keyof typeof colorMap];

            return (
              <motion.div
                key={program.id}
                id={program.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-stone-100"
              >
                {/* Header */}
                <div className={`${colors.gradient} p-4 sm:p-6 md:p-8 text-white`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                          {program.title[language]}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 text-white/80 text-xs sm:text-sm">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{program.duration[language]}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {program.highlights.map((highlight) => (
                        <span
                          key={highlight.en}
                          className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm"
                        >
                          {highlight[language]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Description */}
                    <div>
                      <p className="text-sm sm:text-base md:text-lg text-stone-500 mb-4 sm:mb-6">
                        {program.desc[language]}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-stone-500 mb-4 sm:mb-6">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium">
                          {language === "id" ? "Target Peserta:" : "Target Audience:"}
                        </span>
                        <span>{program.audience[language]}</span>
                      </div>

                      <Link href="/contact" className="block sm:inline-block">
                        <Button variant="primary" size="lg" className="group w-full sm:w-auto justify-center">
                          {language === "id" ? "Daftar Sekarang" : "Register Now"}
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>

                    {/* Features */}
                    <div className={`${colors.bg} rounded-lg sm:rounded-xl p-4 sm:p-6`}>
                      <h3 className="font-semibold text-stone-800 mb-3 sm:mb-4 text-sm sm:text-base">
                        {language === "id" ? "Yang Akan Anda Dapatkan:" : "What You'll Get:"}
                      </h3>
                      <ul className="space-y-2 sm:space-y-3">
                        {program.features[language].map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 sm:gap-3">
                            <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                            <span className="text-xs sm:text-sm md:text-base text-stone-500">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Custom Program CTA */}
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
                ? "Butuh Program Khusus?"
                : "Need a Custom Program?"}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-stone-300 mb-6 sm:mb-8">
              {language === "id"
                ? "Kami dapat merancang program yang disesuaikan dengan kebutuhan spesifik organisasi Anda."
                : "We can design programs tailored to your organization's specific needs."}
            </p>
            <Link href="/contact" className="block sm:inline-block">
              <Button variant="gold" size="xl" className="group w-full sm:w-auto justify-center">
                {language === "id" ? "Diskusikan Kebutuhan Anda" : "Discuss Your Needs"}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
