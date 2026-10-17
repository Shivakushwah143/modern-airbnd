# Modern Stayz — QA Remediation Execution Plan v1.0

**Source:** `Modern_Stayz_Independent_QA_Audit_2026-10-17.md`, inspected `modern-airbnd-main (3).zip`, Modern Stayz BRD/FRD.
**Execution:** Codex = application code + code tests only. Human = Neon backup/migration approval, real proof/media, browser UAT, deployment. No automatic migrations against production Neon; no demo pricing, fake testimonials or fabricated owner outcomes.

## Non-negotiable constraints

1. **Preserve the existing project.** Use current Next.js frontend, Express API, Prisma schema, property IDs and route structure; no rewrite. Take a Git commit/snapshot before edits.
2. **No data loss.** Do not edit previously applied migration files, reset databases, seed production or assume local PostgreSQL exists. If schema changes are needed, generate a NEW additive Prisma migration and report it for human review; do not apply to Neon automatically.
3. **P0 first:** QA-001 to QA-005 contain visibility/privacy/consent/data correctness defects. Do not mix in cosmetic refactors.
4. **Test requirements:** targeted tests for each defect (including negative/bypass cases), then `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. If database suites are blocked, report SKIPPED explicitly—never fabricate PASS.
5. **Static audit limitations:** validate actual current source before changing code. Do not assume historical line numbers remain exact.
6. **One batch at a time:** patch + targeted tests + concise report of changed files, pass/fail/skipped, blockers. Stop before next batch for review if a migration or business decision is required.

## Batch 1 — P0 security, visibility and media publication (QA-001..005)

- **QA-001:** `apps/api/src/modules/portfolio.ts`: portfolio visibility = `status=PUBLISHED`, `portfolioEnabled=true`, `isDemo=false`, active location. DO NOT require `guestEnabled=true`. Case studies associated with properties must obey the same portfolio eligibility; decide handling of independent owner stories with no property link.
- **QA-002:** new Property records must opt-in to portfolio (`portfolioEnabled @default(false)`). Because original `20261017000000_owner_portfolio` may already be applied, do NOT edit it. Create new additive migration to change DB default; explicitly exclude demo records from all public managed counts/lists. Do not silently mass-disable real published portfolio properties—record legacy opt-in review as a human data step.
- **QA-003:** `apps/api/src/modules/properties.ts`: replace Prisma broad object-spread response with explicit public DTO allowlist, including nested fields. Never return `propertyNotes`, internal owner IDs, WhatsApp internals, operational notes, or unverified external listings. Add a regression test proving private marker strings do not appear in JSON.
- **QA-004:** `apps/api/src/modules/portfolio.ts` + schema/admin: server must refuse publishing IMAGE/VIDEO testimonials with missing media or absent explicit owner consent. Add `consentConfirmed`, `consentRecordedAt`, `consentSource` or equivalent auditable fields via additive migration; preserve existing drafts as unpublished until reviewed. Screenshots must support privacy-redaction workflow. Never auto-publish existing content.
- **QA-005:** `apps/api/src/modules/enquiries.ts`: enforce `guestEnabled=true`, `isDemo=false`, `status=PUBLISHED`, active location for PUBLIC enquiry creation on the server. Do not unintentionally prevent privileged internal manual reservations unless approved. Test bypass via direct POST for a hidden/demo property; no row should be created.
- **Done when:** portfolio-only real property appears in owner portfolio but not stays; demo excluded from managed count; public JSON contains no internal note; invalid testimonial publishing returns validation error; POST hidden/demo enquiry rejected; existing guest-visible real property continues to work.

## Batch 2 — Guest discovery and route integrity (QA-007,008,009,012,018,019)

- Preserve `/stays` journey: city selection → city list → property detail → enquiry/acknowledgement. Guest search must navigate to `/stays/[city]`, retain dates and guest count, and filter capacity server-side; make zero-city handling explicit.
- City selector must render approved icon/illustration rather than substituting property cover images. Maintain accessible labels and 2–3 column mobile layout.
- Route-aware header: guest = Book a Stay + searchable city action + contextual Book Now; portfolio = Portfolio, Services, List Your Property; home = both. Cross-journey switching remains accessible on mobile.
- Enquiry success cannot assert that a random UUID is a valid saved enquiry. Verify securely or use non-assertive fallback without leaking PII.
- Record consent/privacy notice for guest and owner contact forms (including server validation and timestamps, with business-approved copy placeholder rather than fabricated legal terms).
- **Done when:** 12 guests excludes 2-capacity property, date/guest parameters persist, guest mode never routes to legacy `/properties` unintentionally, invalid acknowledgement does not claim success.

## Batch 3 — Owner portfolio and media UX (QA-010,011,013,017,024)

- Portfolio cards lead to a NEW owner-facing case-study/property detail route; no booking prices, inventory search or guest booking CTA.
- Build owner case study with gallery, management scope, verifiable outcomes only, related team/testimonials, clear List Your Property lead CTA.
- Homepage becomes portfolio-led with immediate *both* owner and guest CTAs; management services, real team/media preview, cities, conversion. No fabricated company stats/reviews.
- Media testimonial gallery: mixed screenshot/video cards, filter, original image lightbox (text legible, no `object-fit: cover` on expanded screenshot), keyboard/touch accessible, explicit-play video with poster and captions/transcript support.
- Empty content = honest empty state; business supplies actual team photos, owner-approved video/screenshot evidence and Cloudinary configuration.
- **Done when:** portfolio-only property detail works, owner never routed into booking when reading case study, image can enlarge, video captions work, and 375px navigation is usable.

## Batch 4 — Commercial guest + PMS correctness (QA-006,015,016,020)

- **Business configuration required BEFORE final price UI:** define rates, tax/fees, seasonal logic, deposits, cancellation, commissions and whether enquiries/quotes are assisted or immediately bookable. Never invent a numeric price. Until real rate exists, render `Request quote`, not a fake amount.
- Introduce rate plans and quote snapshots (integer minor currency units/decimal money); display itemized stay quote. Preserve separate enquiry versus confirmed reservation semantics.
- Implement financial ledger: verified receipts, refundable adjustments, due balances, management commission, owner settlement. Do not treat screenshots/UTRs as payment verification.
- Add PMS unit readiness: checked-out → dirty/turnover task → cleaning → inspection → ready; staff assignment and audit.
- Add named users + least-privilege RBAC and audit trail; migrate existing shared admin safely without locking out authorized users.
- Test race conditions on a disposable database: two simultaneous confirmations for same unit/date → max one succeeds and other receives conflict; idempotency and serialization retry documented. Do not run destructive suites on production Neon.
- **Done when:** truthful quote, immutable financial facts, successful payment reconciliation, no double confirmed inventory, room-ready lifecycle and staff permissions are verified.

## Batch 5 — CMS, SEO, maintainability and regression (QA-014,021,022,023,025)

- CMS edits structured home hero, sections/order, city icons, navigation labels, team/media placements, legal page content, SEO, mobile crop focal points; role-restricted preview/publish/revert.
- Keep `/{slug}` CMS catchall from colliding with reserved application routes. Sitemap points to canonical published guest/portfolio URLs, excludes demo/private content.
- Gradually modularize oversized `admin/AdminShell.tsx` by workspace without UI regression or rewrite.
- Write automated browser UAT for public guest, owner, testimonial screenshot/video, CMS publish, admin roles and 320/375/390/430/768/1280px layout; verify no clipped buttons/scrollbars, keyboard traps, autoplay audio or upload failures.
- **Done when:** release P0 UAT tests pass, no known privacy breach or booking corruption, skipped DB/browser suites are run in approved test environment; production deploy remains separately approved.

## Required report after EACH batch (keep to ~15 lines)

```
Batch: N
Defects addressed: QA-...
Changed files: ...
Behavior confirmed: ...
Targeted tests: PASS / FAIL (names)
Lint / typecheck / test / build: PASS / FAIL / SKIPPED
Migrations created (NOT applied): ...
Environment blockers: ...
Remaining open: ...
Next suggested batch: ...
```

## Do not confuse 'code complete' with 'release ready'

A server starting, file present, Prisma validation passing or successful Next.js build proves only those narrow checks. Live Neon migration status, actual verified media, real rate configuration, Playwright mobile flows and UAT must be explicitly established before signoff.
