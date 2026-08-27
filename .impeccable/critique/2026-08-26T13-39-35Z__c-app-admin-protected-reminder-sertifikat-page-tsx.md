---
target: reminder-sertifikat admin feature (/admin/reminder-sertifikat)
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
timestamp: 2026-08-26T13-39-35Z
slug: c-app-admin-protected-reminder-sertifikat-page-tsx
---
Method: dual-agent (A: ac5394ea62efc44c2 · B: aa425e944e8e53218)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Every mutation gets a toast *except* `toggleCheckpoint`'s success path (`page.tsx:256-276`) — the single most-repeated, highest-stakes action in the tool gives zero confirmation. Initial-fetch failure only logs to console (`page.tsx:119-121`); user sees the same empty state as a truly empty table. Loading/importing states have no `role="status"`/`aria-live` (confirmed by detector pass: `page.tsx:306-312`, `498`). |
| 2 | Match Between System and Real World | 3 | Strong domain vocabulary in field labels (ID BSMR, Jenjang, Refreshment Thn 1/2) and status names, but the primary CTA "Tambah User" and modal title "Edit Data" are generic-CRUD, off-domain from the API's own language ("pemegang sertifikasi"). |
| 3 | User Control and Freedom | 2 | Dialogs close on Esc/outside-click. No undo after delete or bulk import. Level filter can shrink to a state with no visible way to restore hidden options (see Priority Issues). |
| 4 | Consistency and Standards | 2 | Follows the newer shadcn/sonner pattern (correct lineage vs. the older `sertifikat` page). But deviates from its own file's conventions: Edit/Delete icon buttons use `title` only where `Dialog`'s own close button uses `sr-only` text (`dialog.tsx:70-77`); delete uses native `confirm()` while Add/Edit already use the app's own `Dialog`; status badges bypass `Badge`'s token-based `variant` system for literal Tailwind colors. |
| 5 | Error Prevention | 2 | Good: required-field validation, strict Excel header matching with named missing-column errors, smart date defaulting on Create. Bad: bulk import commits instantly on drop with no preview/confirm before an upsert-by-`bsmrId` that can silently overwrite live records. |
| 6 | Recognition Rather Than Recall | 3 | Status uses color *and* text label together — never color-only, a real plus for scanability and colorblind users. Docked for the level-filter memory trap and no legend explaining what "Mendekati Refreshment" or the 30-day window actually means. |
| 7 | Flexibility and Efficiency of Use | 1 | No bulk actions beyond whole-file import (no multi-select complete/delete). No sortable columns. No CSV export (present one page over in `pelatihan`). Email isn't a `mailto:` link. Every checkpoint completion is one row, one click, one full refetch. |
| 8 | Aesthetic and Minimalist Design | 2 | Layout is visually clean, but flat: all 11 columns carry equal weight, so status — the entire reason this tool exists — has no visual priority over, say, the Email column next to it. |
| 9 | Help Users Recognize, Diagnose, Recover from Errors | 1 | Mutation failures do surface the server's Indonesian error message via toast — a genuine positive. But bulk-import per-row failures (`{row, reason}`, computed carefully server-side) are discarded to `console.warn` (`page.tsx:242`) and never shown in the UI. |
| 10 | Help and Documentation | 1 | Only one line of hint text under the date fields exists as contextual help, and it's actively wrong in Edit mode (see Priority Issues). No legend for status meanings or the 30-day window. |
| **Total** | | **20/40** | **Acceptable (bottom of band)** |

## Design Specificity Verdict

**Mixed — real domain logic underneath, generic CRUD presentation on top.** The data model and defaulting logic are genuinely authored for BSMR's 3-year certification / 1-year+2-year refreshment cadence (`addYears(examDate, 3/1/2)` in `route.ts:95-97`), the status ladder maps directly to compliance-risk escalation, and the Excel import uses a strict 10-column header contract matched to the real BSMR template rather than a generic fuzzy importer. That's genuine task-specific thinking, not boilerplate.

But the presentation layer doesn't carry it through. Structurally this is an 11-column flat table + two modals + a drag-drop importer — the same shape any admin CRUD screen takes for any entity. The one place that should visibly carry the domain's stakes — the status signal — is the least visually distinguished thing in the row. Nothing in the composition stops this from reading as a generic "person tracker" with different column labels.

**Deterministic scan**: `detect.mjs` returned exactly one finding — `border-accent-on-rounded` on `page.tsx:309` (`border-b-2` on the loading spinner). Verified as a **false positive**: this is the standard Tailwind spinner idiom (`rounded-full` + single-side `border-b-2` + `animate-spin`), not a decorative accent border clashing with a rounded card. No other rules fired; the detector reports the two files otherwise clean, which is consistent with the LLM read — no repeated implementation shortcuts, no misleading content, no interchangeable-with-unrelated-product structure. The gap between the two assessments isn't in what the detector caught, it's in what only static evidence caught that the design review didn't emphasize: zero `aria-`/`role=` attributes in either file, a keyboard-inaccessible drop zone (`CertificationBulkUploadCard.tsx:132-142` — plain `<div onClick>`, no `role="button"`, no `tabIndex`, no `onKeyDown`), and a back-navigation link with literally no accessible name (`page.tsx:323-328` — `<Link>` wrapping only an icon, no `aria-label`/`sr-only` text). Those are folded into Priority Issues below as their own item since they were undercounted in the holistic read.

**Visual overlays**: not available — no browser automation tool was exposed this session, and the live page requires admin login credentials this run didn't have. No overlay claim is made; all findings above are source-derived and file:line cited.

## Overall Impression

The backend and data model take this feature seriously — real BSMR cadence rules, careful upsert semantics on import, a reminder-eligibility function that won't burn a holder's one-time email if SMTP hiccups. The UI doesn't yet match that seriousness. It's a competent, clean admin CRUD screen bolted onto a genuinely domain-aware backend, and the biggest opportunity is making the screen itself act like a triage tool for real compliance deadlines rather than a flat records table — starting with the fact that one of the tool's three core actions (recertification) has no button at all.

## What's Working

1. **Domain-correct defaulting logic.** `addYears(examDate, 3/1/2)` (`route.ts:95-97`) encodes the actual BSMR cadence so staff don't hand-calculate three dates per holder — genuine task-specific scaffolding.
2. **Checkpoint cell co-location.** `renderCheckpointCell` (`page.tsx:278-304`) puts each refreshment date and its "mark complete" action in the same cell instead of a separate action column — a deliberately good chunking decision.
3. **Status conveyed by color + text, never color alone** (`STATUS_BADGE`/`STATUS_LABEL`, `page.tsx:59-71`) — consistent across all four states, and correct where a lot of dashboards get this wrong.

## Priority Issues

**[P1] The "recert" checkpoint has zero UI affordance — a KADALUARSA holder can never be resolved through this tool.**
- **Why it matters**: `certification-status.ts:18-22` gates both `KADALUARSA` and `MENDEKATI_KADALUARSA` on `!holder.recertCompletedAt`. The checkpoint type (`"refreshment1" | "refreshment2" | "recert"`), the complete API (`complete/route.ts:9-13`), and the email layer (`RecertificationReminderParams`) all treat recert-completion as first-class. `page.tsx` never references `"recert"` anywhere. An admin whose holder actually recertifies has no button to press.
- **Fix**: Add a third checkpoint control (mirroring `renderCheckpointCell`) to the "Masa Berakhir" column, wired to `POST .../complete` with `checkpoint: "recert"`.
- **Suggested command**: `/impeccable shape` (this needs an interaction decision — dedicated control vs. inline toggle — before code)

**[P1] Status — the tool's entire reason to exist — is the row's least visually prominent element, with no summary view.**
- **Why it matters**: The badge sits at column 9 of 11 with no row-level tint or leading position, and there's no KPI strip ("X mendekati refreshment, Y kadaluarsa") despite that exact pattern already existing one page over in `sertifikat/CertificateTable.tsx:73-103`. An admin has to read every row to find who needs action.
- **Fix**: Pull status to a leading column or add a colored left-border/row-tint keyed to status; add a summary strip above the table; state the default sort (soonest-expiry) explicitly.
- **Suggested command**: `/impeccable layout`

**[P1] Bulk Excel import commits instantly with no preview, and per-row failure reasons are discarded before reaching the user.**
- **Why it matters**: Dropping a file immediately triggers an upsert-by-`bsmrId` against live records (`import/route.ts:125-150`) with no confirm step — a wrong or stale file silently overwrites existing holders' dates. Separately, the API computes structured per-row errors (`{row, reason}`) that `page.tsx:242` routes to `console.warn` only; the toast shows just a count.
- **Fix**: Add a preview/diff step before committing (N new, M updates); render the per-row error list in the UI instead of the console.
- **Suggested command**: `/impeccable harden`

**[P1] Zero accessible names on two structurally important controls, and a keyboard-unreachable import path.**
- **Why it matters**: The back-navigation link (`page.tsx:323-328`) wraps only an icon with no `aria-label`/`sr-only` text — a screen reader announces "link" with no destination. The Excel drop-zone (`CertificationBulkUploadCard.tsx:132-142`) is a plain `<div onClick>` with no `role="button"`, `tabIndex`, or `onKeyDown` — keyboard-only users cannot trigger it at all (the hidden `<input type="file">` it proxies to has no independent focusable trigger). This is the one place the deterministic evidence pass caught something the holistic read under-weighted: grep confirms zero `aria-`/`role=` attributes in either file.
- **Fix**: Add `aria-label="Kembali ke Admin"` to the back link; add `role="button" tabIndex={0}` plus an `onKeyDown` (Enter/Space → open file picker) to the drop zone, or swap it for a `<button>` wrapping the visual drop-zone styling.
- **Suggested command**: `/impeccable harden`

**[P2] The Jenjang (level) filter's option list is derived from already-filtered results, so it can shrink or vanish entirely.**
- **Why it matters**: `levelOptions` (`page.tsx:132-135`) is computed via `useMemo` over `holders`, but `holders` is the server response *after* the current filters are applied. Selecting level "1" collapses the dropdown to just "Semua Jenjang" + "Jenjang 1" — other levels become unreachable until reset. If a search also returns zero rows, the whole filter control disappears (`page.tsx:377`) while a level filter may still be silently active with no visible way to clear it.
- **Fix**: Derive `levelOptions` from an unfiltered distinct-levels source, not the currently-filtered result set.
- **Suggested command**: `/impeccable harden`

**[P2] The Edit modal's date auto-calculation hint is factually wrong for Edit, and will produce a rejected submission.**
- **Why it matters**: The hint "Kosongkan Masa Berakhir/Refreshment untuk otomatis dihitung..." (`page.tsx:584-586`) renders unconditionally in a field block shared by both Add and Edit. True for Add (`route.ts:95-97` falls back to `addYears`); false for Edit — `[id]/route.ts:32-37` rejects any blank field outright. A user clearing a date in Edit, trusting the hint, gets a generic validation error instead.
- **Fix**: Make the hint conditional on the Add flow only, or implement the same fallback on PUT.
- **Suggested command**: `/impeccable clarify`

## Persona Red Flags

**Alex (Power User — staff managing this list daily)**: Just ran a refreshment session for 25 people; marking all complete is 25 individual clicks on "Tandai Selesai," each a full `fetchHolders()` round-trip, with zero success feedback per click (the one action with no toast in the whole file). Wants to email management a list of everyone expiring this month — no CSV export here, though the exact pattern exists in `pelatihan/[id]/page.tsx:495`. Table headers aren't sortable, so Alex can't reorder to batch-process the worst cases beyond the server's unlabeled default sort. High workaround/abandonment risk for a repeat user at real volume.

**Sam (Accessibility-Dependent User)**: Tabbing through the "Aksi" column, Edit/Delete buttons announce via `title` only (no `aria-label`) — weaker and inconsistent with the app's own `Dialog` close button, which uses `sr-only` text. The back button (icon-only `Link`) announces as unlabeled. The Excel-import drop-zone is entirely unreachable by keyboard — Sam cannot bulk-import at all, only add holders one at a time through the manual form. Status *is* screen-reader-legible (text label, not color-only) — a genuine plus that keeps the core status signal accessible even where other controls aren't.

**Jordan (First-Timer — new admin staff)**: Searches for a name not yet in the system and sees "Belum ada data. Klik 'Tambah User' untuk mulai." — identical copy to a genuinely empty database. Jordan may re-add an existing holder (hitting a duplicate-ID error) or assume the system is broken. A failed fetch shows the same message with zero indication anything went wrong. If Jordan clears "Masa Berakhir" in Edit trusting the hint text, the rejected submission doesn't explain that the hint doesn't apply there — actively eroding trust in the tool on a first encounter.

## Minor Observations

- Icon-only Edit/Delete buttons have no padding on the `<button>` itself — rendered hit area is ≈16×16px (icon size only), below the WCAG 2.2 AA 24×24px minimum target size; the app's own `Dialog` close button (`p-1.5` around the same icon size) is ≈28×28px by comparison.
- Delete uses native `confirm()` (consistent with the `sertifikat` page, and actually fine for screen readers) but the copy is just "Hapus data {name}?" with no mention that this also stops future reminder emails for that person.
- Email column is plain text, not a `mailto:` link, despite being the exact channel the cron job uses.
- Neither file uses any `sm:`/`md:`/`lg:` responsive variants beyond the outer page container and header row: Select filters have fixed widths (`w-48`, `w-32`), the Add/Edit form's `grid-cols-2` blocks don't collapse to one column on narrow viewports, and `CertificationBulkUploadCard.tsx` has zero breakpoint classes anywhere.
- Status badges and most literal colors (`text-blue-600`, `text-slate-400`, etc.) bypass the token system the shared primitives already use (`bg-popover`, `text-muted-foreground`, `border-input` throughout `dialog.tsx`/`select.tsx`/`input.tsx`) — including `Badge`'s own token-based `variant` prop, which `STATUS_BADGE` ignores in favor of literal classes.
- The table itself scrolls correctly on narrow viewports (shadcn's `Table` already wraps in `overflow-x-auto`; the page's outer `overflow-hidden` only clips corners, doesn't conflict) — flagged here only because it's easy to mistake for a bug at a glance; it isn't one.

## Questions to Consider

- Given "recert" is fully wired through the type system, API, and email layer but has no UI control at all — was it cut for time, or is there an intended workflow (e.g., "editing the exam date IS how you recertify") the UI just doesn't explain?
- This table gives all 11 columns equal visual weight in service of "show all the data" — but the job is triage. What would the screen look like designed backward from "what does an admin need to see in the first 3 seconds," instead of forward from the schema?
- A bad bulk import can mean a real person's certification lapses without anyone knowing why. Does that deserve the same confirm-before-commit weight as delete — or more?
