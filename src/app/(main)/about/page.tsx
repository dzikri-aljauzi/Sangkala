"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Container, PageHeader } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { Pattern } from "@/components/art/Pattern";
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

const pillarArt = [
  { variant: "orbits" as const, seed: 21 },
  { variant: "grid" as const, seed: 8 },
  { variant: "bars" as const, seed: 5 },
];

export default function AboutPage() {
  const { language } = useLanguage();
  const id = language === "id";

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/about", label: id ? "Tentang" : "About" }]}
        eyebrow={id ? "Tentang Kami" : "About Us"}
        title={id ? "Integrator Ekosistem Kinerja Berkelanjutan" : "Sustainable Performance Ecosystem Integrator"}
        art={{ variant: "rings", seed: 17 }}
        lead={
          id
            ? "Kami tidak hanya melatih atau mengaudit—kami mengintegrasikan people capability, process optimization, dan technology enablement menjadi satu ekosistem kinerja berkelanjutan yang terukur, compliant, dan adaptif."
            : "We don't just train or audit—we integrate people capability, process optimization, and technology enablement into one sustainable performance ecosystem that is measurable, compliant, and adaptive."
        }
      />

      {/* Filosofi */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <Reveal>
            <p className="type-meta mb-8 flex items-center gap-3 text-petrol-600">
              <span className="text-sogan-600">01</span> {id ? "Filosofi Kami" : "Our Philosophy"}
            </p>
            <p className="type-h1 max-w-[26ch]">
              {id
                ? "Organisasi membutuhkan lebih dari training ad-hoc atau konsultan yang hanya fokus satu dimensi."
                : "Organizations need more than ad-hoc training or one-dimensional consultants."}
            </p>
            <p className="mt-8 max-w-[60ch] text-lg leading-relaxed text-stone-700">
              {id
                ? "Di era dinamika regulasi, Lifestyle customer, era sosial finance dan transformasi digital (AI, open banking, fintech disruption), Sangkala hadir sebagai integrator ekosistem kinerja yang menyatukan ketiga pilar fundamental:"
                : "In an era of regulatory dynamics, Lifestyle customers, social finance and digital transformation (AI, open banking, fintech disruption), Sangkala serves as a performance ecosystem integrator that unifies three fundamental pillars:"}
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {pillars.map((p, n) => (
              <Reveal key={p.title} delay={n * 120}>
                <article className="group h-full overflow-hidden rounded-2xl border border-stone-200 bg-paper transition-colors hover:border-petrol-300">
                  <div className="relative aspect-[16/10] overflow-hidden bg-petrol-900">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                      <Pattern variant={pillarArt[n].variant} seed={pillarArt[n].seed} tone="dark" />
                    </div>
                    <span className="absolute bottom-4 left-5 font-serif text-[2.25rem] italic text-paper">{p.title}</span>
                  </div>
                  <p className="p-6 text-[0.9375rem] leading-relaxed text-stone-700">{p.desc[language]}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <blockquote className="mt-16 max-w-[48ch] border-l-2 border-sogan-600 pl-6 font-serif text-[1.5rem] leading-[1.6] text-ink md:text-[1.75rem]">
              {id
                ? "Kami percaya kinerja berkelanjutan hanya tercapai bila ketiga pilar ini didesain, diimplementasikan, dan dimonitor sebagai satu sistem terintegrasi."
                : "We believe sustainable performance is only achieved when these three pillars are designed, implemented, and monitored as one integrated system."}
            </blockquote>
          </Reveal>
        </Container>
      </section>

      {/* Konsep brand: Sangkala dari sengkalan */}
      <section className="relative isolate overflow-hidden bg-petrol-900 py-28 text-paper md:py-40">
        <div aria-hidden className="absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_left,black_30%,transparent_90%)]">
          <Pattern variant="rings" seed={31} tone="dark" animate />
        </div>
        <Container>
          <Reveal>
            <p className="type-meta mb-8 flex items-center gap-3 text-sogan-200">
              <span>02</span> {id ? "Nama kami" : "Our name"}
            </p>
            <h2 className="type-hero max-w-[12ch] !text-paper">
              Sangkala, <span className="italic text-sogan-200">{id ? "dari sengkalan." : "from sengkalan."}</span>
            </h2>
            <div className="mt-12 grid max-w-[60rem] gap-8 text-lg leading-relaxed text-petrol-100 md:grid-cols-2">
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
          </Reveal>
        </Container>
      </section>

      {/* Nilai */}
      <section className="bg-stone-100 py-24 md:py-32">
        <Container>
          <Reveal>
            <p className="type-meta mb-5 flex items-center gap-3 text-petrol-600">
              <span className="text-sogan-600">03</span> {id ? "Prinsip Yang Kami Pegang" : "Principles We Uphold"}
            </p>
            <h2 className="type-display mb-14">{id ? "Nilai-Nilai Kami" : "Our Values"}</h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, n) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title.en} delay={n * 100}>
                  <article className="group flex h-full flex-col rounded-2xl bg-paper p-7 transition-colors duration-300 hover:bg-petrol-900">
                    <div className="flex items-start justify-between">
                      <span className="font-serif text-[3.5rem] leading-none text-petrol-400 transition-colors group-hover:text-sogan-200">0{n + 1}</span>
                      <Icon aria-hidden className="size-6 text-petrol-600 transition-colors group-hover:text-petrol-300" />
                    </div>
                    <h3 className="mt-10 font-serif text-[1.75rem] text-ink transition-colors group-hover:text-paper">{v.title[language]}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone-700 transition-colors group-hover:text-petrol-200">{v.desc[language]}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Pembeda + kredensial */}
      <section className="bg-paper py-24 md:py-32">
        <Container className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <Reveal>
            <p className="type-meta mb-5 flex items-center gap-3 text-petrol-600">
              <span className="text-sogan-600">04</span> {id ? "Apa yang Membedakan Kami?" : "What Makes Us Different?"}
            </p>
            <p className="type-h1">
              {id ? "Bukan sekadar pelatihan—kami membangun performance DNA organisasi Anda." : "Not just training—we build your organization's performance DNA."}
            </p>
            <p className="mt-8 text-lg leading-relaxed text-stone-700">
              {id
                ? "Kompetitor umumnya menjual training terpisah atau konsultan proses atau IT implementation—Sangkala menawarkan orchestration ketiga pilar dengan framework terintegrasi. Positioning sebagai 'performance sustainability architect' bukan sekadar trainer/konsultan generik."
                : "Competitors typically sell separate training or process consulting or IT implementation—Sangkala offers orchestration of all three pillars with an integrated framework. Positioned as a 'performance sustainability architect' not just a generic trainer/consultant."}
            </p>
          </Reveal>
          <Reveal delay={150}>
            <h3 className="type-meta mb-6 text-stone-700">{id ? "Kredensial & Sertifikasi" : "Credentials & Certifications"}</h3>
            <ul className="space-y-4">
              {credentials.map((c) => (
                <li key={c.title} className="flex items-center gap-5 rounded-2xl border border-stone-200 p-5 transition-colors hover:border-petrol-300">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-petrol-600 text-petrol-600">
                    <Award aria-hidden className="size-6" />
                  </span>
                  <span>
                    <span className="block font-serif text-[1.375rem] text-ink">{c.title}</span>
                    <span className="block text-sm text-stone-700">{c.desc[language]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <ClosingCTA />
    </>
  );
}
