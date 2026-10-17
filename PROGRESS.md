# Modern Stayz — Execution Progress

Date: 2026-10-17 · Branch: `main` · Mode: coding-only (no infra, no deploys)

## Feature groups completed

### FG1 — Route-aware navigation + shared mobile design system
- `apps/web/lib/nav.ts` — `navMode()` shells (admin / owner / guest / neutral), `NAV_LINKS`, `BOTTOM_LINKS`, `isNavActive`, `headerCta`.
- `apps/web/components/PublicBottomNav.tsx` — mobile bottom bar, admin-hidden, PDP-aware.
- Shared CSS tokens/mobile-first breakpoints in `apps/web/app/globals.css`.

### FG2 — Guest listing + booking enquiry
- Routes: `/stays`, `/stays/[city]`, `/stays/[city]/[slug]`, `/stays/[city]/[slug]/enquire`, `/enquiry/[reference]`.
- Canonical city redirects, date-aware availability search, enquiry create + status page.
- Reuses existing public API (`/properties`, `/owner-leads`, enquiry endpoints).

### FG3 — Owner portfolio
- **Schema (additive, no existing statements modified):**
  - `Property.guestEnabled`, `Property.portfolioEnabled` (default `true`).
  - New models: `TeamMember`, `PortfolioCaseStudy`, `MediaTestimonial`.
  - Migration: `apps/api/prisma/migrations/20261017000000_owner_portfolio/migration.sql`.
- **API (`apps/api/src/modules/portfolio.ts`):**
  - Public: `GET /portfolio` (published team/testimonials/case studies + city-wise managed counts), `GET /portfolio/cities/:slug`.
  - Admin (session + origin guarded): CRUD for `/admin/portfolio/team|testimonials|cases`,
    `PATCH /admin/portfolio/properties/:id` (visibility), `POST /admin/portfolio/signature`
    (Cloudinary signed uploads, image/video, slot-scoped, format-whitelisted).
  - `publicProperties` now filters `guestEnabled: true`.
- **Web:** `/portfolio`, `/portfolio/cities/[city]`, `/portfolio/team`,
  `/portfolio/testimonials`, `/services`, shared cards in
  `apps/web/components/PortfolioCards.tsx`, FG3 CSS block in `globals.css`.
- **Contracts:** `PortfolioBundle`, `PortfolioCityBundle`, `TeamMember`,
  `Testimonial`, `PortfolioCaseStudy`, `ManagedProperty`, `PortfolioCity`.

### FG4 — Admin four workspaces
- Monolith `app/admin/page.tsx` refactored into `app/admin/AdminShell.tsx`:
  `AdminShell({ tabs, defaultTab })` renders any subset of tabs; behaviour at
  `/admin` unchanged (all tabs, `defaultTab="dashboard"`), plus workspace
  quick-nav cards on the dashboard.
- New routes:
  - `/admin/listings` — properties + locations.
  - `/admin/portfolio` — `PortfolioPanel` (team / testimonials / case-study CRUD,
    signed uploads, guest+portfolio visibility toggles).
  - `/admin/pms` — enquiries, reservations, guests, owners, owner leads,
    housekeeping, maintenance.
  - `/admin/cms` — content pages + business/contact settings.
- Admin nav labels added for the new tabs (`Content pages`, `Portfolio`).

### FG5 — CMS + validation/security + tests
- **Schema/API:** `CmsPage` model + additive migration
  `20261017000100_cms_pages/migration.sql`; `apps/api/src/modules/cms.ts`
  (public `GET /cms/pages`, `GET /cms/pages/:slug` published-only; admin CRUD).
- **Web:** generic public renderer `app/[slug]/page.tsx` (published only,
  paragraphised plain text — React-escaped, no HTML injection), `CmsPanel`
  admin component, sitemap entries for CMS pages.
- **Validation/security pass:**
  - All admin routes behind session auth + origin check + global rate limit
    + helmet + `no-store`, inherited from `app.ts`.
  - Zod validation on every new input (strict signature schema, enums, UUIDs,
    length caps, `http(s)`-only media URLs — blocks `javascript:` vectors).
  - Public reads return published rows with explicit field selects; slugs are
    parameterized and pattern-guarded; Prisma P2002/P2025 map to 409/404.
  - Uploads: server-signed Cloudinary params, format whitelist per kind,
    slot-scoped folders; client checks MIME type and size.

## Tests performed

| Check | Command | Result |
| --- | --- | --- |
| ESLint (repo) | `npm run lint` | ✅ 0 problems |
| Typecheck (api + web) | `npm run typecheck` | ✅ 0 errors |
| Unit tests (DB-free) | `npm test` | ✅ 41 passed, incl. 12 new portfolio/CMS validation tests (`apps/api/tests/portfolio-cms.test.ts`) |
| Prisma | `npx prisma validate`, `npx prisma generate` (schema | 
✅ valid, client regenerated |
| Production web build | `node infra/scripts/run.mjs web:build` | ✅ compiled; all routes registered (`/admin/{listings,portfolio,pms,cms}`, `/portfolio/**`, `/services`, `/{slug}`) |

## Blockers

1. **PostgreSQL unreachable at `127.0.0.1:5432`** (per task rules, no DB
   service setup/troubleshooting performed). Consequences:
   - `apps/api/tests/api.test.ts` and `apps/api/tests/migration.test.ts`
     fail with `P1001` / `ECONNREFUSED` (30 tests skipped) — environmental,
     not code failures.
   - The two additive migrations have not been applied to a database
     (`prisma migrate deploy` requires a reachable DB). They are written
     to run on next deploy: `npm run db:migrate`.
2. **BRD/FRD/execution-plan documents are not present in the repository**
   (`MODERN_STAYZ_CODEX_EXECUTION_PLAN_v1.md` not found); scope was taken
   from the task brief. No fabricated pricing, testimonials, team identities
   or customer data were added — all portfolio content is admin-entered.
3. **Cloudinary credentials** must be set in `.env` for photo/video uploads
   (`CLOUDINARY_*`, already documented in `.env.example`); without them the
   upload signature endpoint returns `503 MEDIA_NOT_CONFIGURED` and admins
   can paste URLs instead.

## Next coding task

- Run `npm run db:migrate` + `npm run db:seed` once a database is reachable,
  then the DB-backed suites (`npm test`) will execute in full.
- Optional polish: photo crops for team avatars and testimonial lightbox
  (`.media-lightbox` styles already exist in `globals.css`).