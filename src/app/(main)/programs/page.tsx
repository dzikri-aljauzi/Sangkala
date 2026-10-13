"use client";

import { Check, Clock, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Container, PageHeader } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Pattern } from "@/components/art/Pattern";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { cn } from "@/lib/utils";

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

const covers = ["orbits", "grid", "waves", "bars", "arcs", "rings"] as const;

export default function ProgramsPage() {
  const { language } = useLanguage();
  const id = language === "id";

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/programs", label: id ? "Program" : "Programs" }]}
        eyebrow={id ? "Program Unggulan" : "Flagship Programs"}
        title={id ? "Program Unggulan Kami" : "Our Flagship Programs"}
        art={{ variant: "grid", seed: 19 }}
        lead={
          id
            ? "Program signature dengan dampak terukur untuk transformasi organisasi Anda."
            : "Signature programs with measurable impact for your organizational transformation."
        }
      >
        <Button href="/info-pelatihan" size="lg" className="bg-paper text-petrol-900 hover:bg-petrol-50">
          {id ? "Lihat jadwal pelatihan" : "See training schedule"}
        </Button>
      </PageHeader>

      {programs.map((program, i) => (
        <section key={program.id} id={program.id} className={cn("scroll-mt-20 py-20 md:py-28", i % 2 === 1 ? "bg-stone-100" : "bg-paper")}>
          <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal className={cn(i % 2 === 1 && "lg:order-2")}>
              <div className="group relative aspect-[5/4] overflow-hidden rounded-3xl bg-petrol-900">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <Pattern variant={covers[i % covers.length]} seed={30 + i} tone="dark" animate />
                </div>
                <span className="absolute left-6 top-6 font-serif text-[5rem] leading-none text-transparent [-webkit-text-stroke:1px_#e2cdb0]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="absolute inset-x-6 bottom-6 flex flex-wrap gap-2">
                  {program.highlights.map((h) => (
                    <span key={h.en} className="rounded-full bg-paper/95 px-3 py-1.5 text-xs font-medium text-petrol-900">
                      {h[language]}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="type-h1">{program.title[language]}</h2>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-stone-700">
                <span className="flex items-center gap-2">
                  <Clock aria-hidden className="size-4 text-petrol-600" />
                  {program.duration[language]}
                </span>
                <span className="flex items-center gap-2">
                  <Users aria-hidden className="size-4 text-petrol-600" />
                  {program.audience[language]}
                </span>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-stone-700">{program.desc[language]}</p>
              <h3 className="type-meta mb-4 mt-10 text-stone-700">{id ? "Yang akan Anda dapatkan" : "What you'll get"}</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {program.features[language].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[0.9375rem] text-ink">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-petrol-600 text-paper">
                      <Check aria-hidden className="size-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button href="/contact" variant="secondary" size="lg" className="mt-10">
                {id ? "Daftar Sekarang" : "Register Now"}
              </Button>
            </Reveal>
          </Container>
        </section>
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
