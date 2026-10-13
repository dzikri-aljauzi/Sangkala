"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Container, PageHeader } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { IndexList } from "@/components/ui/index-list";
import { RailNav } from "@/components/ui/rail-nav";
import { Reveal } from "@/components/ui/reveal";
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
  { pillars: "People + Process", result: { id: "Risk Culture Program", en: "Risk Culture Program" } },
  { pillars: "Process + Technology", result: { id: "Automated Compliance Monitoring", en: "Automated Compliance Monitoring" } },
  { pillars: "People + Technology", result: { id: "Digital Leadership Development", en: "Digital Leadership Development" } },
];

export default function ServicesPage() {
  const { language } = useLanguage();
  const id = language === "id";
  const entries = Object.entries(services);

  return (
    <>
      <PageHeader
        eyebrow={id ? "Layanan Kami" : "Our Services"}
        title="The Integrated People, Process, Technology Framework"
        lead={
          id
            ? "Arsitektur layanan berbasis matriks People, Process, Technology untuk transformasi organisasi yang holistik dan berkelanjutan."
            : "People, Process, Technology matrix-based service architecture for holistic and sustainable organizational transformation."
        }
      />

      <Container className="py-[72px] lg:grid lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-[112px]">
        <RailNav
          className="mb-10 lg:mb-0"
          items={[
            ...entries.map(([key, s]) => ({ id: key, label: s.title[language] })),
            { id: "integrasi", label: id ? "Integrasi 3P" : "3P Integration" },
          ]}
        />
        <div className="min-w-0 space-y-24">
          {entries.map(([key, service], i) => (
            <Reveal key={key}>
              <section id={key} className="scroll-mt-28">
                <SectionIntro
                  number={String(i + 1).padStart(2, "0")}
                  eyebrow={service.title[language]}
                  title={service.desc[language]}
                />
                <IndexList
                  columns={1}
                  items={service.items.map((it) => ({
                    title: it.title[language],
                    description: it.desc[language],
                  }))}
                />
              </section>
            </Reveal>
          ))}

          <Reveal>
            <section id="integrasi" className="scroll-mt-28 bg-petrol-900 p-8 text-paper md:p-12">
              <SectionIntro
                onDark
                number="04"
                eyebrow={id ? "Integrasi 3P" : "3P Integration"}
                title={
                  id
                    ? "Kekuatan framework kami ada pada integrasi ketiga pilar"
                    : "The strength of our framework is the integration of all three pillars"
                }
                lead={
                  id
                    ? "Sinergi antarpilar menghasilkan dampak transformasi yang tidak bisa dicapai satu pilar sendirian."
                    : "Synergy across pillars delivers transformation impact no single pillar can reach alone."
                }
              />
              <IndexList
                onDark
                columns={1}
                items={integration.map((x) => ({ title: x.result[language], meta: x.pillars }))}
              />
            </section>
          </Reveal>
        </div>
      </Container>

      <ClosingCTA />
    </>
  );
}
