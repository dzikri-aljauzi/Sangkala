"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Band, PageHeader } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import ClosingCTA from "@/components/sections/ClosingCTA";

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

export default function ProgramsPage() {
  const { language } = useLanguage();
  const id = language === "id";

  return (
    <>
      <PageHeader
        eyebrow={id ? "Program Unggulan" : "Flagship Programs"}
        title={id ? "Program Unggulan Kami" : "Our Flagship Programs"}
        lead={
          id
            ? "Program signature dengan dampak terukur untuk transformasi organisasi Anda."
            : "Signature programs with measurable impact for your organizational transformation."
        }
      >
        <Button href="/info-pelatihan" variant="text">{id ? "Lihat jadwal pelatihan →" : "See training schedule →"}</Button>
      </PageHeader>

      {programs.map((program, i) => (
        <Band key={program.id} id={program.id} tone={i % 2 === 0 ? "paper" : "stone"}>
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
              <div>
                <p className="type-meta mb-4 flex items-center gap-3">
                  <span className="text-sogan-600">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-petrol-600">{program.duration[language]}</span>
                </p>
                <h2 className="type-h2">{program.title[language]}</h2>
                <p className="mt-5 text-[1.0625rem] leading-relaxed text-stone-700">{program.desc[language]}</p>

                <dl className="mt-8 space-y-4 border-t border-ink pt-5 text-[0.9375rem]">
                  <div className="flex gap-4">
                    <dt className="type-meta w-28 shrink-0 pt-0.5 text-stone-700">{id ? "Peserta" : "Audience"}</dt>
                    <dd className="text-ink">{program.audience[language]}</dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="type-meta w-28 shrink-0 pt-0.5 text-stone-700">{id ? "Sorotan" : "Highlights"}</dt>
                    <dd className="text-ink">{program.highlights.map((h) => h[language]).join(" · ")}</dd>
                  </div>
                </dl>

                <Button href="/contact" variant="secondary" size="lg" className="mt-8 inline-block">
                    {id ? "Daftar Sekarang" : "Register Now"}
                  </Button>
              </div>

              <div>
                <h3 className="type-meta mb-4 text-stone-700">{id ? "Yang akan Anda dapatkan" : "What you'll get"}</h3>
                <ul className="border-t border-ink">
                  {program.features[language].map((f, n) => (
                    <li key={f} className="flex gap-4 border-b border-stone-200 py-4 text-[0.9375rem] text-ink">
                      <span className="type-meta w-8 shrink-0 pt-0.5 !tracking-normal text-stone-700">
                        {String(n + 1).padStart(2, "0")}
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </Band>
      ))}

      <ClosingCTA
        title={id ? "Butuh program khusus?" : "Need a custom program?"}
        lead={
          id
            ? "Kami dapat merancang program yang disesuaikan dengan kebutuhan spesifik organisasi Anda."
            : "We can design programs tailored to your organization's specific needs."
        }
      />
    </>
  );
}
