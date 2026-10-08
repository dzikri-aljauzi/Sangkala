"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section, SectionHeader } from "@/components/ui/section";
import {
  Users,
  Cog,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Target,
  UserCheck,
  FileCheck,
  LineChart,
  GitBranch,
  Cloud,
  Lock,
  Database,
  BarChart3,
  Brain,
} from "lucide-react";

const services = {
  people: {
    title: { id: "People Excellence", en: "People Excellence" },
    desc: {
      id: "Membangun kapabilitas dan budaya organisasi yang unggul",
      en: "Building excellent organizational capabilities and culture",
    },
    icon: Users,
    color: "blue",
    items: [
      {
        icon: GraduationCap,
        title: { id: "Program Kepemimpinan Eksekutif & Board", en: "Executive & Board Leadership Program" },
        desc: {
          id: "GRC for Directors: Business Judgment Rule, Fiduciary Duty, Risk Oversight. Strategic Decision-Making in Regulated Environment. Crisis Leadership & Stakeholder Management.",
          en: "GRC for Directors: Business Judgment Rule, Fiduciary Duty, Risk Oversight. Strategic Decision-Making in Regulated Environment. Crisis Leadership & Stakeholder Management.",
        },
      },
      {
        icon: ShieldCheck,
        title: { id: "Pengembangan Budaya Compliance & Risiko", en: "Compliance & Risk Culture Development" },
        desc: {
          id: "Embedding Risk Awareness Across Organization. Anti-Fraud & Ethics Training. Whistleblowing System & Internal Control Culture.",
          en: "Embedding Risk Awareness Across Organization. Anti-Fraud & Ethics Training. Whistleblowing System & Internal Control Culture.",
        },
      },
      {
        icon: Target,
        title: { id: "Talent Development & Change Management", en: "Talent Development & Change Management" },
        desc: {
          id: "Agile Leadership for Digital Banking. Coaching & Mentoring Programs. Change Management for Merger/Transformation.",
          en: "Agile Leadership for Digital Banking. Coaching & Mentoring Programs. Change Management for Merger/Transformation.",
        },
      },
      {
        icon: UserCheck,
        title: { id: "Risk Leadership Assessment Center", en: "Risk Leadership Assessment Center" },
        desc: {
          id: "Program asesmen terstruktur untuk memetakan dan mengembangkan kapasitas Risk Leadership di level Board, C-Level, dan key risk persons. Menggunakan kombinasi simulasi kasus, in-basket exercise, role play komite risiko, dan wawancara kompetensi berbasis framework GRC.",
          en: "Structured assessment program to map and develop Risk Leadership capacity at Board, C-Level, and key risk persons. Using case simulation, in-basket exercise, risk committee role play, and competency interviews based on GRC framework.",
        },
      },
    ],
  },
  process: {
    title: { id: "Process Optimization", en: "Process Optimization" },
    desc: {
      id: "Mengoptimalkan proses bisnis dan framework tata kelola",
      en: "Optimizing business processes and governance framework",
    },
    icon: Cog,
    color: "teal",
    items: [
      {
        icon: FileCheck,
        title: { id: "Desain & Implementasi GRC Framework", en: "GRC Framework Design & Implementation" },
        desc: {
          id: "Integrated GRC Architecture (Governance, Risk, Compliance). Business Judgment Rule Operationalization. Internal Audit & Control Optimization.",
          en: "Integrated GRC Architecture (Governance, Risk, Compliance). Business Judgment Rule Operationalization. Internal Audit & Control Optimization.",
        },
      },
      {
        icon: GitBranch,
        title: { id: "Business Process Reengineering", en: "Business Process Reengineering" },
        desc: {
          id: "Lean Six Sigma for Financial Institutions. End-to-End Process Mapping & Automation Readiness. SOP Development & Quality Assurance.",
          en: "Lean Six Sigma for Financial Institutions. End-to-End Process Mapping & Automation Readiness. SOP Development & Quality Assurance.",
        },
      },
      {
        icon: LineChart,
        title: { id: "Regulatory Compliance Advisory", en: "Regulatory Compliance Advisory" },
        desc: {
          id: "POJK Implementation Support (OJK regulations). Business Risk Strategy. Anti-Money Laundering (AML) & Fraud Awareness. KYC Process Design.",
          en: "POJK Implementation Support (OJK regulations). Business Risk Strategy. Anti-Money Laundering (AML) & Fraud Awareness. KYC Process Design.",
        },
      },
    ],
  },
  technology: {
    title: { id: "Technology Enablement", en: "Technology Enablement" },
    desc: {
      id: "Mendukung transformasi digital dan tata kelola IT",
      en: "Supporting digital transformation and IT governance",
    },
    icon: Cpu,
    color: "cyan",
    items: [
      {
        icon: Cloud,
        title: { id: "Digital Transformation Roadmap", en: "Digital Transformation Roadmap" },
        desc: {
          id: "Digital Maturity Assessment. Technology Strategy Alignment with Business Goals. Open Banking & API Strategy.",
          en: "Digital Maturity Assessment. Technology Strategy Alignment with Business Goals. Open Banking & API Strategy.",
        },
      },
      {
        icon: Lock,
        title: { id: "IT Governance & Risk Management", en: "IT Governance & Risk Management" },
        desc: {
          id: "IT GRC Framework (COBIT, ISO 27001, NIST). Cybersecurity Risk Assessment. Data Governance & Privacy (GDPR, PDP).",
          en: "IT GRC Framework (COBIT, ISO 27001, NIST). Cybersecurity Risk Assessment. Data Governance & Privacy (GDPR, PDP).",
        },
      },
      {
        icon: Database,
        title: { id: "Technology-Enabled Training & Analytics", en: "Technology-Enabled Training & Analytics" },
        desc: {
          id: "Learning Management System (LMS) Implementation. Data-Driven Performance Dashboard. AI/ML for Risk Prediction & Compliance Monitoring.",
          en: "Learning Management System (LMS) Implementation. Data-Driven Performance Dashboard. AI/ML for Risk Prediction & Compliance Monitoring.",
        },
      },
    ],
  },
};

const colorMap = {
  blue: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    border: "border-petrol-200",
    text: "text-petrol-600",
    iconBg: "bg-petrol-100",
  },
  teal: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    border: "border-petrol-200",
    text: "text-petrol-600",
    iconBg: "bg-petrol-100",
  },
  cyan: {
    gradient: "bg-petrol-500",
    bg: "bg-petrol-50",
    border: "border-petrol-200",
    text: "text-petrol-600",
    iconBg: "bg-petrol-100",
  },
};

export default function ServicesPage() {
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
              {language === "id" ? "Layanan Kami" : "Our Services"}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-stone-800">
              The Integrated People, Process, Technology Framework
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-stone-600 max-w-3xl">
              {language === "id"
                ? "Arsitektur layanan berbasis matriks People, Process, Technology untuk transformasi organisasi yang holistik dan berkelanjutan."
                : "People, Process, Technology matrix-based service architecture for holistic and sustainable organizational transformation."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Sections */}
      {Object.entries(services).map(([key, service], sectionIndex) => {
        const colors = colorMap[service.color as keyof typeof colorMap];

        return (
          <Section
            key={key}
            id={key}
            variant={sectionIndex % 2 === 0 ? "default" : "light"}
            padding="xl"
          >
            {/* Service Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl ${colors.gradient} flex items-center justify-center flex-shrink-0`}
              >
                <service.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-800">
                  {service.title[language]}
                </h2>
                <p className="text-sm sm:text-base text-stone-500">{service.desc[language]}</p>
              </div>
            </motion.div>

            {/* Service Items */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {service.items.map((item, index) => (
                <motion.div
                  key={item.title.en}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border ${colors.border} hover:shadow-xl transition-shadow`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0`}
                    >
                      <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-800 mb-1 sm:mb-2">
                        {item.title[language]}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-stone-500">{item.desc[language]}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        );
      })}

      {/* Integration Section */}
      <Section variant="dark" padding="xl">
        <div className="max-w-4xl mx-auto text-center px-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              {language === "id" ? "Integrasi 3P" : "3P Integration"}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-stone-300 mb-8 sm:mb-10 md:mb-12">
              {language === "id"
                ? "Kekuatan framework kami terletak pada integrasi ketiga pilar yang menciptakan sinergi dan dampak transformasi yang holistik."
                : "The strength of our framework lies in the integration of all three pillars creating synergy and holistic transformation impact."}
            </p>

            {/* Integration Examples */}
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {[
                {
                  pillars: "People + Process",
                  result: { id: "Risk Culture Program", en: "Risk Culture Program" },
                },
                {
                  pillars: "Process + Technology",
                  result: { id: "Automated Compliance Monitoring", en: "Automated Compliance Monitoring" },
                },
                {
                  pillars: "People + Technology",
                  result: { id: "Digital Leadership Development", en: "Digital Leadership Development" },
                },
              ].map((item, index) => (
                <motion.div
                  key={item.pillars}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10"
                >
                  <div className="text-petrol-400 font-semibold text-sm sm:text-base mb-1 sm:mb-2">{item.pillars}</div>
                  <div className="text-white text-sm sm:text-base md:text-lg">{item.result[language]}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
