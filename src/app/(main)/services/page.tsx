"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Container, PageHeader } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { Pattern } from "@/components/art/Pattern";
import { Venn } from "@/components/art/Venn";
import ClosingCTA from "@/components/sections/ClosingCTA";
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

const integration = [
  { pillars: "People + Process", result: { id: "Risk Culture Program", en: "Risk Culture Program" }, desc: { id: "Budaya risiko yang tertanam di proses harian, bukan hanya di pelatihan.", en: "Risk culture embedded in daily processes, not only in training." } },
  { pillars: "Process + Technology", result: { id: "Automated Compliance Monitoring", en: "Automated Compliance Monitoring" }, desc: { id: "Kontrol kepatuhan yang berjalan otomatis dan bisa diaudit.", en: "Compliance controls that run automatically and are auditable." } },
  { pillars: "People + Technology", result: { id: "Digital Leadership Development", en: "Digital Leadership Development" }, desc: { id: "Pemimpin yang siap mengambil keputusan berbasis data.", en: "Leaders ready to make data-driven decisions." } },
];

const art = { people: { variant: "orbits", seed: 21 }, process: { variant: "grid", seed: 8 }, technology: { variant: "bars", seed: 5 } } as const;

export default function ServicesPage() {
  const { language } = useLanguage();
  const id = language === "id";
  const entries = Object.entries(services) as [keyof typeof art, (typeof services)[keyof typeof services]][];

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/services", label: id ? "Layanan" : "Services" }]}
        eyebrow={id ? "Layanan Kami" : "Our Services"}
        title="The Integrated People, Process, Technology Framework"
        art={{ variant: "waves", seed: 2 }}
        lead={
          id
            ? "Arsitektur layanan berbasis matriks People, Process, Technology untuk transformasi organisasi yang holistik dan berkelanjutan."
            : "People, Process, Technology matrix-based service architecture for holistic and sustainable organizational transformation."
        }
        aside={
          <nav aria-label={id ? "Di halaman ini" : "On this page"} className="flex flex-wrap gap-3">
            {[...entries.map(([key, s]) => ({ id: key, label: s.title[language] })), { id: "integrasi", label: id ? "Integrasi 3P" : "3P Integration" }].map((a, n) => (
              <a key={a.id} href={`#${a.id}`} className="group flex items-center gap-3 rounded-full border border-white/20 px-5 py-2.5 text-sm text-paper transition-colors hover:border-paper hover:bg-white/5">
                <span className="type-meta !tracking-normal text-sogan-200">0{n + 1}</span>
                {a.label}
              </a>
            ))}
          </nav>
        }
      />

      {entries.map(([key, service], i) => (
        <section key={key} id={key} className={`scroll-mt-20 py-24 md:py-32 ${i % 2 === 1 ? "bg-stone-100" : "bg-paper"}`}>
          <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <p className="type-meta mb-5 flex items-center gap-3 text-petrol-600">
                  <span className="text-sogan-600">0{i + 1}</span>
                  {service.title[language]}
                </p>
                <h2 className="type-h1">{service.desc[language]}</h2>
                <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-2xl bg-petrol-900">
                  <Pattern variant={art[key].variant} seed={art[key].seed} tone="dark" animate />
                  <span className="absolute bottom-5 left-6 font-serif text-[2.75rem] italic text-paper">{service.title[language].split(" ")[0]}</span>
                </div>
              </Reveal>
            </div>
            <ol className="space-y-4">
              {service.items.map((it, n) => {
                const Icon = it.icon;
                return (
                  <li key={it.title.en}>
                    <Reveal delay={n * 90}>
                    <div className="group rounded-2xl border border-stone-200 bg-paper p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-petrol-300 md:p-8">
                      <div className="flex items-start gap-5">
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-petrol-50 text-petrol-600 transition-colors duration-300 group-hover:bg-petrol-600 group-hover:text-paper">
                          <Icon aria-hidden className="size-5" />
                        </span>
                        <div>
                          <p className="type-meta mb-2 !tracking-normal text-stone-700">{String(n + 1).padStart(2, "0")}</p>
                          <h3 className="type-card">{it.title[language]}</h3>
                          <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone-700">{it.desc[language]}</p>
                        </div>
                      </div>
                    </div>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </Container>
        </section>
      ))}

      <section id="integrasi" className="scroll-mt-20 bg-petrol-900 py-24 text-paper md:py-32">
        <Container>
          <Reveal>
            <p className="type-meta mb-5 flex items-center gap-3 text-sogan-200">
              <span>04</span> {id ? "Integrasi 3P" : "3P Integration"}
            </p>
            <h2 className="type-display max-w-[20ch] !text-paper">
              {id ? "Kekuatannya ada di irisan antarpilar." : "The strength lies where the pillars meet."}
            </h2>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-petrol-200">
              {id
                ? "Kekuatan framework kami terletak pada integrasi ketiga pilar yang menciptakan sinergi dan dampak transformasi yang holistik."
                : "The strength of our framework lies in the integration of all three pillars creating synergy and holistic transformation impact."}
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {integration.map((x, n) => (
              <Reveal key={x.pillars} delay={n * 120}>
                <article className="h-full rounded-2xl border border-white/10 bg-petrol-800/50 p-8 transition-colors duration-300 hover:border-sogan-200/60">
                  <Venn className="mb-8 h-24 w-auto" />
                  <p className="type-meta text-petrol-300">{x.pillars}</p>
                  <h3 className="mt-3 font-serif text-[1.75rem] leading-tight text-paper">{x.result[language]}</h3>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-petrol-200">{x.desc[language]}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ClosingCTA />
    </>
  );
}
