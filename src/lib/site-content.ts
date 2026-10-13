import {
  Building2,
  Landmark,
  Smartphone,
  Search,
  Palette,
  Hammer,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

// Data bersama untuk beranda dan halaman Industri / Metodologi.

export const industries = [
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
  },
];

export const methodologySteps = [
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
  },
];

/**
 * Identitas pembuat untuk halaman /tentang-proyek. Isi untuk menampilkan nama
 * dan tautan profil; kosongkan untuk menyembunyikannya.
 */
export const projectAuthor: { name: string; role: string; github: string; linkedin: string; email: string } = {
  name: "",
  role: "",
  github: "",
  linkedin: "",
  email: "",
};
