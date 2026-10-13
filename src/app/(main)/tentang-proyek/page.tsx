"use client";

import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Container, PageHeader } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/motion/CountUp";
import { BrowserFrame } from "@/components/home/BrowserFrame";
import { projectAuthor } from "@/lib/site-content";

const facts = [
  { value: "32", id: "halaman (publik, portal, admin)", en: "pages (public, portal, admin)" },
  { value: "43", id: "route API", en: "API routes" },
  { value: "20", id: "model data Prisma", en: "Prisma data models" },
  { value: "4", id: "peran pengguna dengan akses berbeda", en: "user roles with distinct access" },
];

const stack = [
  { group: "Frontend", items: ["Next.js 16 (App Router)", "React 19", "TypeScript", "Tailwind CSS v4", "Framer Motion", "Canvas 2D (hero generatif)"] },
  { group: "Backend", items: ["Next.js Route Handlers", "Prisma ORM", "PostgreSQL", "NextAuth (Credentials, JWT)", "Middleware edge untuk /admin"] },
  { group: { id: "Dokumen & notifikasi", en: "Documents & notifications" } as const, items: ["pdf-lib + fontkit", "qrcode", "nodemailer", "Cron endpoint", "xlsx (impor massal)"] },
];

const features = [
  {
    id: { title: "Assessment Center multi-peran", body: "Admin, asesor, klien, dan staf klien berbagi satu ruang kerja per proyek. Setiap peran hanya melihat dan melakukan bagiannya." },
    en: { title: "Multi-role Assessment Center", body: "Admins, assessors, clients, and client staff share one workspace per project. Each role only sees and does its part." },
    href: "/assessment-center",
  },
  {
    id: { title: "Sertifikat PDF dengan verifikasi QR", body: "PDF dibuat di server, membawa kode QR menuju halaman verifikasi publik berbasis hash acak." },
    en: { title: "PDF certificates with QR verification", body: "Server-generated PDFs carry a QR code to a public verification page keyed by a random hash." },
    href: "/verify",
  },
  {
    id: { title: "Pengingat masa berlaku otomatis", body: "Status sertifikasi dihitung dari tanggal ujian, dua titik refreshment, dan masa berlaku; email dikirim lewat cron." },
    en: { title: "Automatic expiry reminders", body: "Certification status is derived from exam date, two refreshment checkpoints, and expiry; emails go out via cron." },
    href: null,
  },
  {
    id: { title: "Pendaftaran pelatihan + bukti bayar", body: "Peserta mendaftar daring, mengunggah bukti transfer untuk pelatihan berbayar, dan kuota dihitung otomatis." },
    en: { title: "Training registration + payment proof", body: "Participants register online, upload transfer proof for paid trainings, and quotas are enforced automatically." },
    href: "/info-pelatihan",
  },
  {
    id: { title: "Keamanan dan jejak audit", body: "Rute admin dijaga middleware, percobaan login dibatasi, dan aksi penting tercatat di audit log." },
    en: { title: "Security and audit trail", body: "Admin routes are guarded by middleware, login attempts are rate-limited, and key actions land in an audit log." },
    href: null,
  },
  {
    id: { title: "Situs dwibahasa yang aksesibel", body: "ID/EN, lolos WCAG 2.1 AA pada pemeriksaan otomatis, menghormati reduced motion, tetap terbaca tanpa JavaScript." },
    en: { title: "Accessible bilingual site", body: "ID/EN, passes WCAG 2.1 AA in automated checks, respects reduced motion, readable without JavaScript." },
    href: "/",
  },
];

function Architecture({ id }: { id: boolean }) {
  const box = "fill-[#083a3f] stroke-[#4f9a9f]";
  const label = "fill-[#fcfcfb] text-[13px] font-medium";
  const sub = "fill-[#85babd] text-[11px] font-mono";
  return (
    <svg viewBox="0 0 900 360" role="img" aria-label={id ? "Diagram arsitektur" : "Architecture diagram"} className="h-auto w-full">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#e2cdb0" />
        </marker>
      </defs>
      {[
        { x: 20, y: 40, w: 180, t: id ? "Browser" : "Browser", s: "publik · portal · admin" },
        { x: 260, y: 40, w: 220, t: "Next.js App Router", s: "RSC + client components" },
        { x: 540, y: 40, w: 160, t: "Route Handlers", s: "43 endpoint REST" },
        { x: 760, y: 40, w: 120, t: "Prisma", s: "20 model" },
        { x: 760, y: 200, w: 120, t: "PostgreSQL", s: "data" },
        { x: 260, y: 200, w: 220, t: "Middleware + NextAuth", s: "JWT · RBAC · rate limit" },
        { x: 540, y: 200, w: 160, t: "PDF + QR", s: "pdf-lib · qrcode" },
        { x: 540, y: 290, w: 160, t: "Cron + Email", s: "nodemailer" },
      ].map((b) => (
        <g key={b.t}>
          <rect x={b.x} y={b.y} width={b.w} height="60" rx="12" className={box} strokeWidth="1.2" />
          <text x={b.x + 16} y={b.y + 27} className={label}>{b.t}</text>
          <text x={b.x + 16} y={b.y + 45} className={sub}>{b.s}</text>
        </g>
      ))}
      {[
        [200, 70, 258, 70],
        [480, 70, 538, 70],
        [700, 70, 758, 70],
        [820, 100, 820, 198],
        [370, 100, 370, 198],
        [620, 100, 620, 198],
        [620, 260, 620, 288],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e2cdb0" strokeWidth="1.2" markerEnd="url(#arr)" />
      ))}
    </svg>
  );
}

export default function ProjectPage() {
  const { language } = useLanguage();
  const id = language === "id";
  const a = projectAuthor;

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/tentang-proyek", label: id ? "Tentang proyek" : "About the project" }]}
        eyebrow={id ? "Studi kasus" : "Case study"}
        title={id ? "Satu codebase untuk situs, portal asesmen, dan sistem sertifikasi." : "One codebase for the site, the assessment portal, and the certification system."}
        art={{ variant: "grid", seed: 52 }}
        lead={
          id
            ? "Sangkala adalah perusahaan fiktif. Situs ini adalah proyek portofolio full-stack: dari company profile dwibahasa sampai aplikasi multi-peran yang benar-benar berjalan."
            : "Sangkala is a fictional company. This site is a full-stack portfolio project: from a bilingual company profile to a multi-role application that actually runs."
        }
      >
        {a.github && (
          <Button href={a.github} size="lg" className="bg-paper text-petrol-900 hover:bg-petrol-50">
            <Github aria-hidden className="size-5" /> GitHub
          </Button>
        )}
        {a.linkedin && (
          <Button href={a.linkedin} variant="secondary" size="lg" className="border-paper/50 text-paper hover:bg-paper/10">
            <Linkedin aria-hidden className="size-5" /> LinkedIn
          </Button>
        )}
      </PageHeader>

      <section className="bg-paper py-20 md:py-28">
        <Container>
          <dl className="grid grid-cols-2 border-t border-ink lg:grid-cols-4">
            {facts.map((f, i) => (
              <div key={f.value + f.en} className={`border-b border-stone-200 py-8 pr-6 lg:border-b-0 ${i > 0 ? "lg:border-l lg:pl-8" : ""} ${i % 2 === 1 ? "border-l pl-6" : ""}`}>
                <dd className="font-serif text-[3rem] leading-none text-ink md:text-[4.5rem]">
                  <CountUp value={f.value} />
                </dd>
                <dt className="mt-3 text-[0.9375rem] text-stone-700">{f[language]}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-stone-100 py-24 md:py-32">
        <Container>
          <Reveal>
            <p className="type-meta mb-5 text-petrol-600">{id ? "Fitur yang dibangun" : "Features built"}</p>
            <h2 className="type-display mb-14 max-w-[18ch]">{id ? "Bukan mockup. Semuanya berjalan." : "Not a mockup. It all runs."}</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, n) => (
              <Reveal key={f.en.title} delay={(n % 3) * 100}>
                {(() => {
                  const Tag = f.href ? "a" : "div";
                  return (
                <Tag {...(f.href ? { href: f.href } : {})} className="group flex h-full flex-col rounded-2xl bg-paper p-7 transition-colors duration-300 hover:bg-petrol-900">
                  <span className="flex items-start justify-between">
                    <span className="font-serif text-[2.5rem] leading-none text-petrol-400 transition-colors group-hover:text-sogan-200">0{n + 1}</span>
                    {f.href && <ArrowUpRight aria-hidden className="size-5 text-stone-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper" />}
                  </span>
                  <h3 className="mt-8 font-serif text-[1.5rem] leading-tight text-ink transition-colors group-hover:text-paper">{f[language].title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone-700 transition-colors group-hover:text-petrol-200">{f[language].body}</p>
                </Tag>
                  );
                })()}
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-petrol-900 py-24 text-paper md:py-32">
        <Container className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="type-meta mb-5 text-sogan-200">{id ? "Arsitektur" : "Architecture"}</p>
            <h2 className="type-h1 !text-paper">{id ? "Satu aplikasi Next.js, tiga permukaan." : "One Next.js app, three surfaces."}</h2>
            <p className="mt-6 text-lg leading-relaxed text-petrol-200">
              {id
                ? "Situs publik, portal Assessment Center, dan panel admin berbagi komponen, autentikasi, dan basis data yang sama. Rute admin dijaga di edge sebelum halaman dikirim."
                : "The public site, the Assessment Center portal, and the admin panel share components, authentication, and one database. Admin routes are guarded at the edge before a page is sent."}
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="rounded-2xl border border-white/10 bg-petrol-800/40 p-6 md:p-8">
              <Architecture id={id} />
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-paper py-24 md:py-32">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <Reveal>
            <p className="type-meta mb-5 text-petrol-600">Stack</p>
            <div className="space-y-10">
              {stack.map((g) => (
                <div key={typeof g.group === "string" ? g.group : g.group.en}>
                  <h3 className="type-card mb-4">{typeof g.group === "string" ? g.group : g.group[language]}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {g.items.map((it) => (
                      <li key={it} className="rounded-full border border-stone-200 px-4 py-2 text-sm text-ink transition-colors hover:border-petrol-600 hover:bg-petrol-50">
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <BrowserFrame src="/showcase/reminder.webp" url="sangkala.example/admin/reminder-sertifikat" alt={id ? "Panel admin pengingat sertifikasi" : "Certification reminder admin panel"} />
          </Reveal>
        </Container>
      </section>

      {(a.name || a.email) && (
        <section className="bg-petrol-600 py-20 text-paper">
          <Container className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="type-meta mb-3 text-petrol-100">{id ? "Dibuat oleh" : "Built by"}</p>
              <p className="type-h1 !text-paper">{a.name}</p>
              {a.role && <p className="mt-2 text-lg text-petrol-100">{a.role}</p>}
            </div>
            {a.email && (
              <Button href={`mailto:${a.email}`} size="xl" className="bg-paper text-petrol-900 hover:bg-petrol-50">
                <Mail aria-hidden className="size-5" /> {a.email}
              </Button>
            )}
          </Container>
        </section>
      )}
    </>
  );
}
