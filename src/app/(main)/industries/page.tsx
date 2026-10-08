"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Landmark,
  Smartphone,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const industries = [
  {
    id: "banking",
    icon: Building2,
    title: { id: "Perbankan & Lembaga Keuangan", en: "Banking & Financial Institutions" },
    desc: {
      id: "Navigasi kompleksitas regulasi OJK, transformasi digital, dan risk culture dalam satu integrated approach.",
      en: "Navigate OJK regulatory complexity, digital transformation, and risk culture in one integrated approach.",
    },
    programs: [
      { id: "GRC for Banking Leadership", en: "GRC for Banking Leadership" },
      { id: "Credit Risk Analytics", en: "Credit Risk Analytics" },
      { id: "Asesmen Risk Leadership", en: "Risk Leadership Assessment" },
      { id: "Digital Banking Readiness", en: "Digital Banking Readiness" },
      { id: "Strategi Risiko Bisnis & Risk Culture", en: "Business Risk Strategy & Risk Culture" },
      { id: "Pembekalan dan Refreshment Manajemen Risiko J4-J7", en: "Risk Management Training & Refreshment J4-J7" },
      { id: "Anti-Money Laundering (AML) & Fraud Awareness", en: "Anti-Money Laundering (AML) & Fraud Awareness" },
      { id: "Strategi Talenta Digital", en: "Digital Talent Strategy" },
      { id: "Pengakuan ERM Berbasis ISO 31000-2018", en: "ERM Recognition Based ISO 31000-2018" },
      { id: "Climate Risk Management System (CRMS)", en: "Climate Risk Management System (CRMS)" },
    ],
    challenges: {
      id: [
        "Kompleksitas regulasi OJK yang terus berkembang",
        "Tekanan transformasi digital dari fintech",
        "Kebutuhan risk culture yang kuat",
        "Tuntutan compliance yang ketat",
      ],
      en: [
        "Evolving OJK regulatory complexity",
        "Digital transformation pressure from fintech",
        "Need for strong risk culture",
        "Strict compliance requirements",
      ],
    },
    color: "blue",
  },
  {
    id: "soe",
    icon: Landmark,
    title: { id: "BUMN Strategis", en: "Strategic State-Owned Enterprises" },
    desc: {
      id: "Dari mandat kedaulatan hingga efisiensi operasional—kami memahami dual mandate BUMN dan risiko hukum yang menyertainya.",
      en: "From sovereignty mandate to operational efficiency—we understand SOE dual mandate and accompanying legal risks.",
    },
    programs: [
      { id: "Business Judgment Rule for SOE Directors", en: "Business Judgment Rule for SOE Directors" },
      { id: "Performance Management System", en: "Performance Management System" },
      { id: "Public Procurement Compliance", en: "Public Procurement Compliance" },
      { id: "Digital Transformation for SOE", en: "Digital Transformation for SOE" },
      { id: "GCG Implementation", en: "GCG Implementation" },
    ],
    challenges: {
      id: [
        "Dual mandate: kedaulatan vs efisiensi",
        "Risiko hukum pidana korporasi",
        "Tuntutan transparansi dan akuntabilitas",
        "Kebutuhan modernisasi dan digitalisasi",
      ],
      en: [
        "Dual mandate: sovereignty vs efficiency",
        "Corporate criminal law risks",
        "Transparency and accountability demands",
        "Modernization and digitalization needs",
      ],
    },
    color: "teal",
  },
  {
    id: "fintech",
    icon: Smartphone,
    title: { id: "Fintech & Insurtech", en: "Fintech & Insurtech" },
    desc: {
      id: "Agile, compliant, dan scalable—bangun fondasi GRC sejak awal tanpa menghambat inovasi.",
      en: "Agile, compliant, and scalable—build GRC foundation from the start without hindering innovation.",
    },
    programs: [
      { id: "Agile GRC Framework", en: "Agile GRC Framework" },
      { id: "Embedded Compliance", en: "Embedded Compliance" },
      { id: "Tech Risk Assessment", en: "Tech Risk Assessment" },
      { id: "Regulatory Sandbox Navigation", en: "Regulatory Sandbox Navigation" },
      { id: "Scalable Governance Model", en: "Scalable Governance Model" },
    ],
    challenges: {
      id: [
        "Keseimbangan antara inovasi dan compliance",
        "Kecepatan scaling vs maturity governance",
        "Regulasi yang terus berkembang",
        "Tech risk yang kompleks",
      ],
      en: [
        "Balance between innovation and compliance",
        "Scaling speed vs governance maturity",
        "Evolving regulations",
        "Complex tech risks",
      ],
    },
    color: "cyan",
  },
];

const colorMap = {
  blue: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    border: "border-petrol-200",
    text: "text-petrol-600",
    lightBg: "bg-petrol-100",
  },
  teal: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    border: "border-petrol-200",
    text: "text-petrol-600",
    lightBg: "bg-petrol-100",
  },
  cyan: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    border: "border-petrol-200",
    text: "text-petrol-600",
    lightBg: "bg-petrol-100",
  },
};

export default function IndustriesPage() {
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
              {language === "id" ? "Industri" : "Industries"}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-stone-800">
              {language === "id"
                ? "Industri yang Kami Layani"
                : "Industries We Serve"}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-stone-600 max-w-3xl">
              {language === "id"
                ? "Fokus vertikal dengan pemahaman mendalam terhadap tantangan spesifik setiap industri."
                : "Vertical focus with deep understanding of specific challenges in each industry."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Industries */}
      {industries.map((industry, index) => {
        const colors = colorMap[industry.color as keyof typeof colorMap];

        return (
          <Section
            key={industry.id}
            id={industry.id}
            variant={index % 2 === 0 ? "default" : "light"}
            padding="xl"
          >
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={index % 2 === 0 ? "" : "lg:order-2"}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl ${colors.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <industry.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-800">
                    {industry.title[language]}
                  </h2>
                </div>

                <p className="text-sm sm:text-base md:text-lg text-stone-500 mb-6 sm:mb-8">
                  {industry.desc[language]}
                </p>

                {/* Challenges */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-stone-800 mb-3 sm:mb-4">
                    {language === "id" ? "Tantangan Industri:" : "Industry Challenges:"}
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {industry.challenges[language].map((challenge, i) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                        <span className="text-xs sm:text-sm md:text-base text-stone-500">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/contact" className="block sm:inline-block">
                  <Button variant="primary" size="lg" className="group w-full sm:w-auto justify-center">
                    {language === "id" ? "Diskusikan Kebutuhan Anda" : "Discuss Your Needs"}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>

              {/* Programs */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`${colors.bg} rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 ${index % 2 === 0 ? "" : "lg:order-1"}`}
              >
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-800 mb-4 sm:mb-6">
                  {language === "id" ? "Program Unggulan:" : "Featured Programs:"}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {industry.programs.map((program, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-2 sm:gap-3"
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg ${colors.lightBg} flex items-center justify-center flex-shrink-0`}>
                        <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
                      </div>
                      <span className="font-medium text-stone-800 text-xs sm:text-sm md:text-base">
                        {program[language]}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </Section>
        );
      })}

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
                ? "Tidak Menemukan Industri Anda?"
                : "Don't See Your Industry?"}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-stone-300 mb-6 sm:mb-8">
              {language === "id"
                ? "Framework 3P kami dapat diadaptasi untuk berbagai industri regulated. Hubungi kami untuk diskusi kebutuhan spesifik Anda."
                : "Our 3P framework can be adapted for various regulated industries. Contact us to discuss your specific needs."}
            </p>
            <Link href="/contact" className="block sm:inline-block">
              <Button variant="gold" size="xl" className="group w-full sm:w-auto justify-center">
                {language === "id" ? "Hubungi Kami" : "Contact Us"}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
