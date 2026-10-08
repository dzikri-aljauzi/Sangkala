# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three distinct user groups share one Next.js codebase:

1. **Prospective & existing corporate clients** (public site visitors) — decision-makers (directors, compliance/risk heads, HR/academic leadership) at banks, BUMN, fintech, and universities evaluating or referencing Sangkala's GRC consulting and leadership training services. Evidenced by real testimonials from named directors at Bank Jateng, Bank BPD Bali, Bank Jatim, BPKH, STIE YKPN, etc.
2. **Assessment Center portal users** (`/assessment-center/*`, login required) — four roles on one multi-tenant-per-user system: **ADMIN** (Sangkala staff, full access across all assessment projects), **ASESOR** (assessors uploading evaluation reports), **KLIEN** (client-side stakeholders downloading results/progress), **STAFF_KLIEN** (client staff, narrower read-only access). Each non-admin account is bound to one assessment project.
3. **Training certificate holders** — individuals who attended Sangkala training and hold a time-bound certification (with expiry + two "refreshment" checkpoints). They receive email reminders as their certification approaches expiry, and can verify certificate authenticity via a public QR-linked page (`/verify/[id]`) with no login.

Admin/assessment-center/reminder areas are Indonesian-only by design; only the public marketing site is bilingual (ID/EN).

## Product Purpose

Sangkala is a consulting firm specializing in **GRC (Governance, Risk, Compliance)**, leadership training, and digital transformation, focused on banking, BUMN (state-owned enterprises), and fintech. The codebase serves that business three ways:

- **Company profile site** — markets Sangkala's services, methodology, and track record to prospective clients.
- **Assessment Center** — Sangkala's operated software product for running competency/risk-leadership assessments of client employees (in-tray exercises, LGD, role play, BEI interviews), through to delivering results.
- **Certification lifecycle tooling** — issues verifiable training certificates (QR-linked public verification) and now (in-progress) proactively reminds certificate holders before expiry/refreshment deadlines so they re-certify on time.

Success = prospective clients trust Sangkala enough to engage; assessment projects run to completion with each role able to do its part without friction; certificate holders stay current instead of lapsing silently.

## Positioning

Sangkala's differentiator is that it **owns the full delivery chain, not just advice**: it runs its proprietary **Assess → Design → Build → Embed → Sustain** methodology end-to-end *and* operates the software that delivers it — the Assessment Center portal (multi-role project management for competency evaluation) and the certificate issuance/verification/reminder system. A firm that only sells training or only sells consulting frameworks cannot truthfully claim the same: Sangkala's clients get the assessment methodology, the platform that runs it, and provable certificate authenticity (QR verification) as one product, evidenced by a client roster spanning 40+ major Indonesian banks, BUMN, and universities (BCA, BNI, Mandiri, BSI, Bank Jateng, Bank Jatim, BPKH, STIE YKPN, and others) with named-director testimonials citing specific delivered work (GRC blueprints, risk-management frameworks, HR blueprints).

## Operating Context

- **Public site**: bilingual ID/EN, toggled client-side (`LanguageContext`, `localStorage`), covers Home, About (People/Process/Technology philosophy), Services, Industries (Banking/BUMN/Fintech), Programs (GRC Academy, IPT Consulting, certification-prep programs referencing CGRC/CRISC/GRCP), Methodology, Insights (bilingual articles/whitepapers/webinars/case studies), Contact, and Info Pelatihan (training listings with optional paid registration).
- **Assessment Center**: per-project workspace shared via a common "AppShell" (sidebar/top bar/command palette) with admin. Lifecycle: Admin creates an Assessment → assigns users → Asesor uploads reports → Admin uploads resumes/documentation/progress → Klien/Staff Klien download and track. Resumes are categorized (Umum / Eselon / Individu) and viewed in a folder structure.
- **Certification lifecycle**: certificates are issued with an expiry date and two refreshment checkpoints; a 30-day reminder window is used to flag holders as "mendekati kadaluarsa"/"mendekati refreshment"; a cron endpoint (`/api/cron/certification-reminders`) sends the actual reminder emails (via `nodemailer`, `src/lib/email.ts`). Public certificate verification is by unique `verifyHash` (not the DB id) scanned from a QR code on the PDF certificate — "have the link" is the access model, not an account.
- **Deployment constraint**: database is SQLite (file-based via Prisma), which requires a persistent VPS — not deployable to serverless/edge platforms like Vercel (documented in `docs/09-deployment.md`).
- No specific area is currently prioritized over the others for design/product work — the public site, Assessment Center, and certificate reminder system should be treated as equally in-scope.

## Capabilities and Constraints

- Full-stack Next.js 16 (App Router) app; NextAuth.js (Credentials provider, JWT sessions — required because middleware runs on the Edge runtime, which can't use `getServerSession()`).
- `/admin/*` is middleware-gated server-side; `/assessment-center/*` is currently guarded client-side per-layout (not yet covered by middleware — known gap, not a bug).
- PDF certificate generation (`pdf-lib` + `fontkit`) with embedded QR codes (`qrcode`).
- No automated tests exist in this codebase (no test runner, no test files) — QA is manual.
- Known technical debt: `AdminDashboard.tsx` (~3100 lines) bundles multiple unrelated business entities and is deliberately not yet split due to regression risk in a live feature — treat as a constraint when touching admin assessment-center work, not an invitation to refactor incidentally.
- `TrainingRegistrant.paymentStatus` is a snapshot at registration time, not a live derivation — do not assume it reflects current `Training.requiresPayment`.
- Full architecture, data model, routing, and auth details live in `docs/DESIGN.md` (kept current separately from this file) and the `docs/0X-*.md` reference set.

## Brand Commitments

- Company name: **Sangkala**, abbreviated **Sangkala** throughout the product (nav, footer, program names like "GRC Academy"). Logo assets exist at `public/logo-lna.png` / `public/logo-lna-transparent.png`.
- Real client identity is load-bearing content, not placeholder: the public testimonials and client-logo carousel (`src/components/sections/Testimonials.tsx`) use actual named directors, real photos, and real institution logos (banks, BUMN, universities). Future work must not fabricate or genericize testimonials, client names, or metrics — only real, sourced content belongs there.

## Evidence on Hand

- Real client testimonials with named authors, titles, companies, and photos (`src/components/sections/Testimonials.tsx`, images in `public/testi/`).
- Real client/partner logo set (40+ institutions) in `public/client/`.
- Existing bilingual content in `src/lib/translations.ts` and per-page copy under `src/app/(main)/`.
- No quantified public metrics (e.g., "N clients served," "N years in business," specific revenue/growth numbers) were found in the codebase — do not invent these; treat any such figure as needing a real source before it ships.

## Product Principles

1. **Own the chain, prove it with names, not slogans.** Positioning rests on Sangkala operating methodology + software + verifiable certificates together — back claims with the real client/testimonial evidence already in the codebase rather than generic consulting language.
2. **Three audiences, three postures.** Public site = persuade (bilingual, marketing-grade); Assessment Center = operate (Indonesian-only, dense, role-correct, scanable); certificate verification = minimal-trust public utility (no login, QR-hash access).
3. **Don't casually touch load-bearing debt.** `AdminDashboard.tsx`'s size and the client-side-only guard on `/assessment-center/*` are known, deliberate, and documented — changes there need to be scoped work, not incidental cleanup.
4. **SQLite is a real deployment constraint, not an implementation detail.** Any infra or scaling suggestion must account for the VPS requirement.
5. **Certification lifecycle correctness matters more than polish.** Expiry/refreshment reminder logic (`src/lib/certification-status.ts`) encodes real compliance deadlines for real people — treat date/status logic changes with the same care as the auth system.
