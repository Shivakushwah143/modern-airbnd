# Modern Airbnd — Phase 1

A mobile-first property portfolio, date-based availability service and owner-only property management workspace. Visitors browse by location, inspect properties and enquire on WhatsApp. There is no booking engine, payment processing or OTA synchronization.

**Handover status:** updated mobile calendar and recovery actions, property trust information, local context, guided admin setup, private preview and explicit room/whole-property inventory. TypeScript and lint passed; the production build produced its build ID. Public mobile browser flows passed; the complete admin browser flow remains unverified. Live Cloudinary, Docker deployment, backup restoration and production infrastructure need operator testing. See `docs/VERIFICATION.md`.

This ZIP contains the current UX/inventory remediation. Expanded owner acquisition, saved guest enquiries, manual reservations, guest records, housekeeping and maintenance modules are not implemented in this version.

## Stack and repository

- `apps/web`: Next.js 16.3.8, React, TypeScript, Manrope/Fraunces, responsive CSS tokens.
- `apps/api`: Node.js 24, Express 5, Prisma 6, PostgreSQL, Argon2id and PostgreSQL-backed sessions.
- `packages/contracts`: shared public types; runtime request validation lives in the API.
- `infra`: Caddy, environment loader, password hash utility, daily/weekly backup script.
- `apps/api/prisma`: schema, initial migration, safe seed.
- `apps/api/tests`: domain, real-database API, inventory and migration tests.
- `tests`: Playwright mobile discovery, recovery and admin inventory flows.
- `docs`: verification status and operating guide.

## Local setup

Prerequisites: Node 24 LTS, npm, Docker Compose v2 (or an existing PostgreSQL server).

```bash
npm ci
cp .env.example .env
npm run admin:hash
```

Enter a unique password of at least 14 characters. The utility prints its Argon2id hash; paste the hash into `ADMIN_PASSWORD_HASH` in `.env`, enclosed in single quotes. The password itself must not be committed. The prompt input is visible; use a private terminal.

Generate independent random values for `POSTGRES_PASSWORD` and `SESSION_SECRET`:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Set the matching database password in `DATABASE_URL`. Use a hexadecimal password or URI-encode it. Keep `APP_ORIGIN`, `NEXT_PUBLIC_SITE_URL` and `WEB_PORT` consistent. `APP_ORIGIN` must match the address used by the browser exactly; `localhost` and `127.0.0.1` are different origins.

```bash
docker compose up -d postgres
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`, then `/admin` using your chosen password. API defaults to port 4000. The web app proxies `/api/*` to the API so authentication stays same-origin. Root scripts read `.env` automatically.

The ordinary seed creates locations, amenities and empty business settings. It does **not** invent real listings, photos, reviews, contacts or credentials. To explore fictional inventory locally, set `SEED_DEMO=true`, run `npm run db:seed`, then reset it to false. Demo records are visibly labeled, cannot send WhatsApp enquiries, and cannot be edited into real listings. Archive them before launch. Demo seeding is prohibited when `NODE_ENV=production`.

## First real property

1. Sign in at `/admin`.
2. Under **Business & contact**, add the approved WhatsApp number in international format, contact details, operator identity and legal copy.
3. Add locations/amenities as needed.
4. Add a property and save its draft. Supply description, location, facts, amenities, rules and optional property-specific WhatsApp contact.
5. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` on the API, then restart it.
6. Upload real photographs: JPEG/PNG/WebP, maximum 10 MB. Supply descriptive alt text. Select the cover and gallery order.
7. Choose entire-property or individual-room inventory. For rooms, add each independently available room. Changes require an unpublished property; legacy inventory may require explicit review.
8. Block unavailable date ranges per unit. End date is exclusive. Overlapping manual blocks are retained with a warning.
9. Publish. The API requires useful content, an active location, an active unit, media and a valid contact destination.
10. Verify the public listing and its WhatsApp link before sharing it.

## Commands

```bash
npm run dev
npm run dev:api
npm run dev:web
npm run lint
npm run typecheck
npm test
npm run build
npm run start:web
```

`npm run start:web` starts the built Next.js web app; start the API separately with `npm run dev:api` for local review, or use the production containers for deployment. The API dev launcher uses tsx without automatic watch; restart it after API edits. The Next.js dev server has hot reload.

### Database-backed tests

Create a separate disposable test database:

```bash
docker compose exec postgres createdb -U modern_airbnd modern_airbnd_test
```

Set `TEST_DATABASE_URL` in `.env` to that database. Its name must end in `_test`. The API integration suite applies migrations and **truncates that test database**, generates an ephemeral admin credential, and stubs Cloudinary. Never point it at production.

```bash
npm test
```

### Browser checks

Configure the disposable `TEST_DATABASE_URL`, then run:

```bash
npx playwright install chromium
npm run test:e2e
```

The harness starts its own API and web server on ports 3401/3400 and resets the disposable test database. Set `PLAYWRIGHT_EXECUTABLE_PATH` to use an existing compatible Chromium binary. Two public mobile flows passed; the admin flow timed out on a test label selector. That selector has been corrected but the full flow has not been rerun.

## Production deployment

See `docs/OPERATIONS.md`. Only Caddy exposes public ports; PostgreSQL and the API are internal. Production uses Secure/HttpOnly/SameSite=Strict cookies, origin validation, Argon2id verification, session regeneration and rate limits. Cloudinary remains external. Media uploads go directly from the authenticated browser to Cloudinary with signed parameters; the API independently fetches the resulting asset metadata before saving it.

### GitHub Actions CD

Production deployment runs after the CI workflow succeeds on `main`. Required GitHub Secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_SSH_KEY`
- `VPS_SSH_KNOWN_HOSTS`
- `VPS_APP_PATH`

Expected VPS app directory: the existing checked-out repository path from `VPS_APP_PATH`. Keep production `.env` on the VPS beside `docker-compose.prod.yml`; it is not created or overwritten by CI/CD.

First-time VPS prerequisites: install Git and Docker Compose v2, clone this repository at `VPS_APP_PATH`, create the production `.env`, add the GitHub deploy key to the server, add the server host key to `VPS_SSH_KNOWN_HOSTS`, and confirm `docker compose -f docker-compose.prod.yml up -d` works once manually.

## Source reconciliation

The four supplied property specifications were used. The supplied `VoiceOps_PRD_v1.0.md` describes a different voice AI product and was excluded. A Modern Airbnd PRD was not supplied. The locked name is **Modern Airbnd**, and the locked backend is **Node.js + Express + TypeScript**.

Real property photographs, business information, WhatsApp destinations, legal policies, Cloudinary credentials, domain and VPS access must be supplied by the operator. This repository contains no client secrets and makes no invented property/review claims.
