"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Band, PageHeader } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { IndexList } from "@/components/ui/index-list";
import { Reveal } from "@/components/ui/reveal";
import ClosingCTA from "@/components/sections/ClosingCTA";
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

const credentials = [
  { title: "ISO 9001", desc: { id: "Sistem Manajemen Mutu", en: "Quality Management System" } },
  { title: "Certified Instructors", desc: { id: "Instruktur Bersertifikat", en: "Certified Instructors" } },
  { title: "BNSP Accredited", desc: { id: "Terakreditasi BNSP", en: "BNSP Accredited" } },
];

export default function AboutPage() {
  const { language } = useLanguage();
  const id = language === "id";

  return (
    <>
      <PageHeader
        eyebrow={id ? "Tentang Kami" : "About Us"}
        title={id ? "Integrator Ekosistem Kinerja Berkelanjutan" : "Sustainable Performance Ecosystem Integrator"}
        lead={
          id
            ? "Kami tidak hanya melatih atau mengaudit—kami mengintegrasikan people capability, process optimization, dan technology enablement menjadi satu ekosistem kinerja berkelanjutan yang terukur, compliant, dan adaptif."
            : "We don't just train or audit—we integrate people capability, process optimization, and technology enablement into one sustainable performance ecosystem that is measurable, compliant, and adaptive."
        }
      />

      <Band>
        <Reveal>
          <SectionIntro
            number="01"
            eyebrow={id ? "Filosofi" : "Philosophy"}
            title={id ? "Filosofi Kami" : "Our Philosophy"}
            lead={
              id
                ? "Di era dinamika regulasi, Lifestyle customer, era sosial finance dan transformasi digital (AI, open banking, fintech disruption), organisasi membutuhkan lebih dari sekadar training ad-hoc atau konsultan yang hanya fokus satu dimensi."
                : "In an era of regulatory dynamics, Lifestyle customers, the era of social finance and digital transformation (AI, open banking, fintech disruption), organizations need more than just ad-hoc training or one-dimensional consultants."
            }
          />
          <p className="prose-width mb-8 text-lg text-stone-700">
            {id
              ? "Sangkala hadir sebagai integrator ekosistem kinerja yang menyatukan ketiga pilar fundamental:"
              : "Sangkala serves as a performance ecosystem integrator that unifies three fundamental pillars:"}
          </p>
          <div className="grid gap-10 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="border-t border-ink pt-5">
                <h3 className="type-card mb-2">{p.title}</h3>
                <p className="text-[0.9375rem] leading-relaxed text-stone-700">{p.desc[language]}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 max-w-[68ch] border-l-2 border-sogan-600 pl-5 font-serif text-[1.25rem] leading-[1.7] text-ink">
            {id
              ? "Kami percaya kinerja berkelanjutan hanya tercapai bila ketiga pilar ini didesain, diimplementasikan, dan dimonitor sebagai satu sistem terintegrasi."
              : "We believe sustainable performance is only achieved when these three pillars are designed, implemented, and monitored as one integrated system."}
          </p>
        </Reveal>
      </Band>

      {/* Konsep brand: satu-satunya tempat sogan tampil lebih dari detail kecil (BRAND.md) */}
      <Band tone="stone">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <SectionIntro
              className="!mb-0"
              number="02"
              eyebrow={id ? "Nama kami" : "Our name"}
              title={id ? "Sangkala, dari sengkalan" : "Sangkala, from sengkalan"}
            />
            <div className="space-y-5 text-lg leading-relaxed text-stone-700">
              <p>
                {id
                  ? "Sengkalan adalah rangkaian kata penanda tahun dalam tradisi Jawa: waktu yang dicatat dengan hati-hati, dalam bentuk yang bisa dibaca dan diperiksa ulang."
                  : "A sengkalan is a phrase that marks a year in Javanese tradition: time recorded with care, in a form that can be read and checked again."}
              </p>
              <p>
                {id
                  ? "Itu juga pekerjaan kami. Kami mengurus masa berlaku, penanda waktu, dan bukti yang bisa diverifikasi, dari sertifikat pelatihan sampai hasil asesmen."
                  : "That is our work too. We look after validity periods, time markers, and verifiable evidence, from training certificates to assessment results."}
              </p>
            </div>
          </div>
        </Reveal>
      </Band>

      <Band>
        <Reveal>
          <SectionIntro
            number="03"
            eyebrow={id ? "Prinsip Yang Kami Pegang" : "Principles We Uphold"}
            title={id ? "Nilai-Nilai Kami" : "Our Values"}
          />
          <IndexList
            columns={1}
            items={values.map((v) => ({ title: v.title[language], description: v.desc[language] }))}
          />
        </Reveal>
      </Band>

      <Band tone="stone">
        <Reveal>
          <SectionIntro
            number="04"
            eyebrow={id ? "Standar Kualitas Kami" : "Our Quality Standards"}
            title={id ? "Apa yang Membedakan Kami?" : "What Makes Us Different?"}
            lead={
              id
                ? "Bukan sekadar pelatihan—kami membangun performance DNA organisasi Anda."
                : "Not just training—we build your organization's performance DNA."
            }
          />
          <p className="prose-width mb-12 text-lg leading-relaxed text-stone-700">
            {id
              ? "Kompetitor umumnya menjual training terpisah atau konsultan proses atau IT implementation—Sangkala menawarkan orchestration ketiga pilar dengan framework terintegrasi. Positioning sebagai 'performance sustainability architect' bukan sekadar trainer/konsultan generik."
              : "Competitors typically sell separate training or process consulting or IT implementation—Sangkala offers orchestration of all three pillars with an integrated framework. Positioned as a 'performance sustainability architect' not just a generic trainer/consultant."}
          </p>
          <h3 className="type-meta mb-4 text-stone-700">
            {id ? "Kredensial & Sertifikasi" : "Credentials & Certifications"}
          </h3>
          <IndexList
            columns={1}
            items={credentials.map((c) => ({ title: c.title, description: c.desc[language] }))}
          />
        </Reveal>
      </Band>

      <ClosingCTA />
    </>
  );
}
