"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section, SectionHeader } from "@/components/ui/section";
import { Users, Cog, Cpu, Target, Award, Shield, CheckCircle } from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "People",
    desc: {
      id: "Leadership, risk culture, compliance mindset, agile workforce",
      en: "Leadership, risk culture, compliance mindset, agile workforce",
    },
    color: "bg-petrol-500",
  },
  {
    icon: Cog,
    title: "Process",
    desc: {
      id: "GRC framework, business process reengineering, operational efficiency",
      en: "GRC framework, business process reengineering, operational efficiency",
    },
    color: "bg-petrol-500",
  },
  {
    icon: Cpu,
    title: "Technology",
    desc: {
      id: "Digital transformation roadmap, data governance, IT risk management",
      en: "Digital transformation roadmap, data governance, IT risk management",
    },
    color: "bg-petrol-500",
  },
];

const values = [
  {
    icon: Target,
    title: { id: "Integrated", en: "Integrated" },
    desc: {
      id: "Kami satukan People, Process, Technology—bukan silo",
      en: "We unite People, Process, Technology—not silos",
    },
  },
  {
    icon: Shield,
    title: { id: "Sustainable", en: "Sustainable" },
    desc: {
      id: "Fokus long-term performance, bukan quick fix",
      en: "Focus on long-term performance, not quick fixes",
    },
  },
  {
    icon: Award,
    title: { id: "Relevant", en: "Relevant" },
    desc: {
      id: "Deep understanding sektor regulated (banking, BUMN, finance)",
      en: "Deep understanding of regulated sectors (banking, SOE, finance)",
    },
  },
  {
    icon: CheckCircle,
    title: { id: "Proven", en: "Proven" },
    desc: {
      id: "Data-driven, measurable outcomes, certified expertise",
      en: "Data-driven, measurable outcomes, certified expertise",
    },
  },
];

export default function AboutPage() {
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
              {language === "id" ? "Tentang Kami" : "About Us"}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-stone-800">
              {language === "id"
                ? "Integrator Ekosistem Kinerja Berkelanjutan"
                : "Sustainable Performance Ecosystem Integrator"}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-stone-600 max-w-3xl">
              {language === "id"
                ? "Kami tidak hanya melatih atau mengaudit—kami mengintegrasikan people capability, process optimization, dan technology enablement menjadi satu ekosistem kinerja berkelanjutan yang terukur, compliant, dan adaptif."
                : "We don't just train or audit—we integrate people capability, process optimization, and technology enablement into one sustainable performance ecosystem that is measurable, compliant, and adaptive."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <Section variant="default" padding="xl">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 mb-4 sm:mb-6">
              {language === "id" ? "Filosofi Kami" : "Our Philosophy"}
            </h2>
            <div className="prose prose-lg max-w-none text-stone-500">
              <p>
                {language === "id"
                  ? "Di era dinamika regulasi, Lifestyle customer, era sosial finance dan transformasi digital (AI, open banking, fintech disruption), organisasi membutuhkan lebih dari sekadar training ad-hoc atau konsultan yang hanya fokus satu dimensi."
                  : "In an era of regulatory dynamics, Lifestyle customers, the era of social finance and digital transformation (AI, open banking, fintech disruption), organizations need more than just ad-hoc training or one-dimensional consultants."}
              </p>
              <p className="mt-4">
                {language === "id"
                  ? "Sangkala hadir sebagai integrator ekosistem kinerja yang menyatukan ketiga pilar fundamental:"
                  : "Sangkala serves as a performance ecosystem integrator that unifies three fundamental pillars:"}
              </p>
            </div>
          </motion.div>

          {/* 3P Pillars */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-stone-100 hover:shadow-xl transition-shadow"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl ${pillar.color} flex items-center justify-center mb-3 sm:mb-4`}
                >
                  <pillar.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-800 mb-1 sm:mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm sm:text-base text-stone-500">{pillar.desc[language]}</p>
              </motion.div>
            ))}
          </div>

          {/* Belief Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 p-8 bg-[#f2f3f1] rounded-2xl"
          >
            <p className="text-lg text-stone-500">
              {language === "id"
                ? "Kami percaya kinerja berkelanjutan hanya tercapai bila ketiga pilar ini didesain, diimplementasikan, dan dimonitor sebagai satu sistem terintegrasi."
                : "We believe sustainable performance is only achieved when these three pillars are designed, implemented, and monitored as one integrated system."}
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Values Section */}
      <Section variant="light" padding="xl">
        <SectionHeader
          title={language === "id" ? "Nilai-Nilai Kami" : "Our Values"}
          subtitle={language === "id" ? "Prinsip Yang Kami Pegang" : "Principles We Uphold"}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title.en}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto rounded-lg sm:rounded-xl bg-petrol-500 flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                <value.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-stone-800 mb-1 sm:mb-2">
                {value.title[language]}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">{value.desc[language]}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Differentiator Section */}
      <Section variant="dark" padding="xl">
        <div className="max-w-4xl mx-auto text-center px-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              {language === "id" ? "Apa yang Membedakan Kami?" : "What Makes Us Different?"}
            </h2>
            <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-petrol-400 italic mb-6 sm:mb-8">
              "{language === "id"
                ? "Bukan sekadar pelatihan—kami membangun performance DNA organisasi Anda."
                : "Not just training—we build your organization's performance DNA."}"
            </blockquote>
            <p className="text-sm sm:text-base md:text-lg text-stone-300">
              {language === "id"
                ? "Kompetitor umumnya menjual training terpisah atau konsultan proses atau IT implementation—Sangkala menawarkan orchestration ketiga pilar dengan framework terintegrasi. Positioning sebagai 'performance sustainability architect' bukan sekadar trainer/konsultan generik."
                : "Competitors typically sell separate training or process consulting or IT implementation—Sangkala offers orchestration of all three pillars with an integrated framework. Positioned as a 'performance sustainability architect' not just a generic trainer/consultant."}
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Credentials Section */}
      <Section variant="default" padding="xl">
        <SectionHeader
          title={language === "id" ? "Kredensial & Sertifikasi" : "Credentials & Certifications"}
          subtitle={language === "id" ? "Standar Kualitas Kami" : "Our Quality Standards"}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          {[
            {
              title: "ISO 9001",
              desc: language === "id" ? "Sistem Manajemen Mutu" : "Quality Management System",
            },
            {
              title: "Certified Instructors",
              desc: language === "id" ? "Instruktur Bersertifikat" : "Certified Instructors",
            },
            {
              title: "BNSP Accredited",
              desc: language === "id" ? "Terakreditasi BNSP" : "BNSP Accredited",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#f2f3f1] rounded-lg sm:rounded-xl p-4 sm:p-6 text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full bg-[#8a5a2b] flex items-center justify-center mb-3 sm:mb-4">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-800 mb-1 sm:mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm md:text-base text-stone-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
