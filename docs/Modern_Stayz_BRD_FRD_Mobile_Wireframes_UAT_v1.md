Developer-ready baseline • Version 1.0 • 16 October 2026

Product intent: 70% management portfolio / 30% guest booking emphasis in public positioning; one operational PMS and CMS behind both journeys.

# Document control

| Field              | Value                                                                            |
|--------------------|----------------------------------------------------------------------------------|
| Owner              | Modern Stayz business stakeholders (to assign)                                   |
| Prepared as        | BA / Product Management development baseline                                     |
| Status             | Proposed for stakeholder approval; not a claim of completed delivery             |
| Source             | Uploaded modern-airbnd-main ZIP + agreed workflow decisions                      |
| Release strategy   | Phased: foundational architecture, public journeys, PMS, CMS, hardening          |
| Decision authority | Business owner approves pricing, legal language, roles, evidence, booking policy |

# How to use this document

Every requirement has an identifier, expected behavior and acceptance condition. Developers should implement to these requirements, engineers should link tests to identifiers, and the business owner should sign off open decisions before production rollout. Current-vs-target tags prevent accidental assumptions.

# Contents

A. BRD — strategy, users, scope, business rules

B. FRD — functional modules, validations and user stories

C. Information architecture, journeys, state machines and data model

D. Mobile-first wireframes — public and admin page templates

E. Non-functional requirements, security and analytics

F. UAT scenarios, test data, go/no-go and sign-off

G. Delivery roadmap, traceability and decisions

# A. BUSINESS REQUIREMENTS DOCUMENT (BRD)

## A1. Business problem and opportunity

Modern Stayz needs to attract property owners seeking credible management services while converting guests into confirmed stays, without operating two inconsistent property databases. Current codebase supports curated listing discovery and assisted reservations; the desired solution adds a distinct owner-first portfolio experience and a more complete operational management workspace.

## A2. Product positioning and boundaries

- Portfolio (70% public brand emphasis): services, geographic coverage, verified case studies, genuine team profiles, owner media testimonials, owner enquiry capture.

- Guest booking (30% public brand emphasis): city icon browsing, rich listing facts, rates, guest/date selection, availability, enquiry-first assisted booking.

- Admin (internal, not subject to the 70:30 split): Overview + Listings, Portfolio, PMS and CMS workspaces operating on shared data.

- The 70:30 ratio is a content/positioning target, not a fixed homepage pixel count or engineering effort budget.

## A3. Stakeholders and personas

| Persona          | Goal                                              | Success                                   |
|------------------|---------------------------------------------------|-------------------------------------------|
| Guest            | Find a suitable property and understand stay cost | Qualified enquiry / confirmed reservation |
| Property owner   | Verify expertise and request management services  | Qualified lead → agreement                |
| Super admin      | Govern all properties, people and content         | Auditable operations                      |
| Booking manager  | Convert enquiries; control reservations           | Zero conflicting confirmed bookings       |
| Operations staff | Prepare rooms and resolve issues                  | On-time turnover and issue closure        |
| Content editor   | Publish accurate website content                  | Fast updates without code changes         |

## A4. Business outcomes and indicative KPIs

| ID    | Outcome                     | Measurement                                                |
|-------|-----------------------------|------------------------------------------------------------|
| BR-01 | Owner trust and acquisition | Owner leads, qualified leads, agreement conversion         |
| BR-02 | Guest booking growth        | Property-view → enquiry → confirmed-stay conversion        |
| BR-03 | Accurate inventory          | Confirmed booking conflicts = 0                            |
| BR-04 | Property readiness          | Turnover SLA and ready-before-arrival rate                 |
| BR-05 | Revenue visibility          | Net booking value, collections, commissions, owner payable |
| BR-06 | Content independence        | Proportion of content edits completed in CMS               |
| BR-07 | Mobile usability            | Mobile task-completion rate, Core Web Vitals               |

## A5. In-scope and out-of-scope

| In scope v1 target                                    | Deferred / explicitly excluded until approved           |
|-------------------------------------------------------|---------------------------------------------------------|
| City-based guest and portfolio discovery              | Full multi-sided OTA marketplace                        |
| Assisted booking and reservation management           | Instant automatic booking unless authorized             |
| CMS media, team, case studies and testimonials        | Fabricated reviews or performance data                  |
| Payments ledger, manual reconciliation and statements | Payment gateway until provider/policy selected          |
| Staff authentication, permissions and audit log       | Complex enterprise HR/payroll suite                     |
| Availability and turnover operations                  | Two-way OTA synchronization until supported integration |

## A6. Business rules

- BRULE-01: A property has one canonical record and optional independent guest-facing and portfolio-facing presentation records.

- BRULE-02: Guest pricing is displayed only when reliable rates and fees are configured; portfolio pages never show booking prices.

- BRULE-03: Portfolio publication requires management rights/owner consent for media and claims; testimonial publication additionally requires explicit consent.

- BRULE-04: Enquiry creation does not reserve inventory. Confirmation must revalidate unit availability atomically.

- BRULE-05: Dates use local property calendar timezone; checkout is exclusive for overlap calculations.

- BRULE-06: A room/property must not have overlapping active confirmed reservations.

- BRULE-07: Cancelled/expired reservations release blocking inventory according to policy; settled money stays in an immutable transaction ledger.

- BRULE-08: The PMS is source of truth for occupancy, bookings, payment facts and room readiness.

- BRULE-09: Staff access is least privilege. Only authorized users can see guest PII, financial data and unpublished owner information.

- BRULE-10: No hardcoded or simulated testimonials, team biographies, review counts, prices or success metrics in production.

- BRULE-11: Public publishing and unpublishing must preserve existing guest reservations and audit history.

- BRULE-12: Each public route has context navigation, but all journeys remain discoverable within two taps.

# B. FUNCTIONAL REQUIREMENTS DOCUMENT (FRD)

Priority legend: P0 essential launch control, P1 core value, P2 optimization. Acceptance criteria are testable business-level statements; implementation detail can vary unless identified as a hard contract.

## F01 — Shared foundation / route-aware UX

| ID     | Priority | Requirement / minimum acceptance behavior                                                                                                                       |
|--------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| FR-001 | P0       | One canonical property ID across guest listing, portfolio case study and PMS; no duplicate master record.                                                       |
| FR-002 | P0       | Responsive route-aware header: /stays uses Book a Stay, city search and Book Now; /portfolio uses Portfolio, Services and List Your Property; home offers both. |
| FR-003 | P0       | Cross-journey link remains accessible in mobile menu and desktop header.                                                                                        |
| FR-004 | P0       | All public content uses publish states; unpublished records are not discoverable through public APIs.                                                           |
| FR-005 | P1       | City directory uses approved distinctive icon/illustration, active status, canonical slug and optional descriptive copy.                                        |

## F02 — Guest listing and discovery

| ID     | Priority | Requirement / minimum acceptance behavior                                                                                            |
|--------|----------|--------------------------------------------------------------------------------------------------------------------------------------|
| FR-010 | P0       | Browse active cities; selecting one filters only published guest-enabled properties.                                                 |
| FR-011 | P0       | Property card exposes real cover image, title, locality, capacity, amenities summary and genuine starting price when configured.     |
| FR-012 | P0       | Search supports city, date range, guest count; filters exclude genuinely unavailable inventory.                                      |
| FR-013 | P0       | Property detail displays gallery, room facts, amenities, rules, timing, cancellation summary, accessibility details where supplied.  |
| FR-014 | P0       | Pricing shows nightly rate, date-based total and mandatory fees/taxes with clear quote validity; no invented rates.                  |
| FR-015 | P0       | Guest enquiry captures property, dates, adults, children, name, phone, consent and optional message; persistence occurs server-side. |
| FR-016 | P0       | Successful enquiry returns reference and explains that booking is not confirmed; WhatsApp is optional follow-on.                     |
| FR-017 | P1       | Mobile booking CTA stays available without obscuring content and honors safe-area insets.                                            |
| FR-018 | P1       | Filters and sorting are accessible and URL-shareable; empty states offer reset and alternate dates.                                  |

## F03 — Owner-facing portfolio

| ID     | Priority | Requirement / minimum acceptance behavior                                                                                                         |
|--------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| FR-020 | P0       | Portfolio hero states management value and primary List Your Property CTA.                                                                        |
| FR-021 | P0       | Services page explains service scope, operating process and owner FAQs.                                                                           |
| FR-022 | P0       | City portfolio shows managed properties without nightly price, availability widget or booking CTA.                                                |
| FR-023 | P0       | Case study shows consented gallery, service scope, problem/action/outcome where substantiated, related owner stories and lead CTA.                |
| FR-024 | P0       | Meet the Management Team renders real named profiles with roles, pictures and credentials; CMS publish controls.                                  |
| FR-025 | P0       | Owner testimonial hub supports authentic image screenshots and video, filters, poster thumbnails, captions, lightbox/player and consent metadata. |
| FR-026 | P0       | Owner lead form validates contact fields, deduplicates safely, notifies assigned team and records lead status.                                    |
| FR-027 | P1       | Media testimonials optionally link to one managed property; hub can reuse content on homepage and case studies.                                   |
| FR-028 | P1       | Screenshot uploads can be redacted before publishing; private names/numbers are hidden unless consented.                                          |

## F04 — Admin overview and listings

| ID     | Priority | Requirement / minimum acceptance behavior                                                                                              |
|--------|----------|----------------------------------------------------------------------------------------------------------------------------------------|
| FR-030 | P0       | Admin overview displays arrivals, departures, pending enquiries, room readiness, open maintenance, and priority alerts.                |
| FR-031 | P0       | Listings workspace creates/edits property drafts, physical facts, gallery, amenities, location, guest presentation and publish status. |
| FR-032 | P0       | Guest and portfolio publishing are independent switches; disabling one does not remove the other.                                      |
| FR-033 | P0       | Preview draft as guest/owner before publishing; server enforces publication prerequisites.                                             |
| FR-034 | P1       | Bulk media ordering, alt text, cropping preview and failed upload retry.                                                               |
| FR-035 | P1       | Editorial schedule and change history for published listing descriptions.                                                              |

## F05 — Portfolio management and CMS

| ID     | Priority | Requirement / minimum acceptance behavior                                                                              |
|--------|----------|------------------------------------------------------------------------------------------------------------------------|
| FR-040 | P0       | Portfolio workspace manages case study content, managed city visibility, property-to-story links and review approval.  |
| FR-041 | P0       | Team editor manages avatar, role, bio, sort order, employment visibility and consent.                                  |
| FR-042 | P0       | Testimonial editor uploads screenshots/videos, poster, captions/transcript, source, consent record and publish status. |
| FR-043 | P0       | CMS controls page hero, typography content, city art, navigation labels, sections, legal pages and SEO metadata.       |
| FR-044 | P1       | Page editor supports preview/publish/unpublish with rollback to a previous revision.                                   |
| FR-045 | P1       | Content slots have max lengths, mobile crop focal points and accessibility checks.                                     |

## F06 — PMS booking and operations

| ID     | Priority | Requirement / minimum acceptance behavior                                                                                                                   |
|--------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| FR-050 | P0       | PMS records owners, units, guests, enquiries, reservations and manual external source labels.                                                               |
| FR-051 | P0       | Booking pipeline: enquiry → quote → tentative/awaiting advance → confirmed → checked-in → checked-out/closed, with cancellation/no-show branches.           |
| FR-052 | P0       | Confirmation atomically validates availability and creates exclusive unit occupancy; conflicts return 409 with recoverable guidance.                        |
| FR-053 | P0       | Authorized staff can create blocks for maintenance/owner use; every override is logged and explained.                                                       |
| FR-054 | P0       | Checkout creates or suggests turnover task; readiness states dirty → cleaning → inspection → ready.                                                         |
| FR-055 | P0       | Cleaning and maintenance tasks have assigned staff, priority, due time, state, property/unit context and activity log.                                      |
| FR-056 | P0       | Nightly rate schedules, extra-guest fees, discounts, taxes and quote snapshots are stored with defined rounding/currency.                                   |
| FR-057 | P0       | Payments ledger records claims, verified receipts, refunds, method, amount, currency and reconciliation evidence without inferring payment from screenshot. |
| FR-058 | P0       | Owner financial ledger records commissions, expenses, owner payable, settlement state and period.                                                           |
| FR-059 | P1       | Owner report exports booking and settlement summaries with role-bound access.                                                                               |
| FR-060 | P1       | Reporting dashboard calculates occupancy, ADR, RevPAR, gross revenue, collections and owner payouts using documented formulae.                              |

## F07 — Identity and governance

| ID     | Priority | Requirement / minimum acceptance behavior                                                                                      |
|--------|----------|--------------------------------------------------------------------------------------------------------------------------------|
| FR-070 | P0       | Named admin users authenticate securely; RBAC distinguishes super admin, booking manager, operations staff and content editor. |
| FR-071 | P0       | Audit events record actor, entity, action, before/after data reference, timestamp and request ID.                              |
| FR-072 | P0       | Enforce server-side authorization and input validation for every mutation.                                                     |
| FR-073 | P0       | Publish owner screenshots/video only with recorded consent and removal flow.                                                   |
| FR-074 | P1       | Support configurable retention and deletion workflow for guest PII and media.                                                  |

# C. JOURNEYS, DATA MODEL & SYSTEM CONTRACTS

## C1. Sequential journey maps

### Guest

Home → Stays → City/icon → Date/guest search → Listing → Rate and rules → Enquiry → Reference → Staff follow-up → Confirmed reservation → Check-in → Checkout

### Owner

Home/Portfolio → Services → City portfolio → Property case study → Team → Media testimonials → Owner enquiry → Qualification → Agreement → Owner/property onboarding

### Admin

Login → Overview → Choose workspace → Work item → Validate → Save draft → Preview → Publish/approve → Audit and notify

### PMS

Source enquiry → Availability verification → Quote snapshot → Collection/reconciliation → Confirm & block inventory → Pre-arrival → Housekeeping readiness → Check-in → Checkout → Settlement

## C2. Domain data — proposed additions to present schema

| Canonical entity                 | Required minimum relationships / fields                                                         |
|----------------------------------|-------------------------------------------------------------------------------------------------|
| Property                         | id, locationId, ownerId, guestVisibility, portfolioVisibility, property timezone                |
| ListingPresentation              | propertyId, pricing visibility, guest copy, hero media, SEO, publication                        |
| PortfolioCaseStudy               | propertyId, city, service highlights, outcomes/evidence, consent, publication                   |
| TeamMember                       | name, role, bio, image, order, published, consent                                               |
| MediaTestimonial                 | owner/property optional, IMAGE\|VIDEO, asset, poster, caption/transcript, consent, review state |
| RatePlan / RateCalendar          | property/unit, night, base amount, occupancy rules, fees, taxes, validity                       |
| Quote / Reservation              | property/unit, guests, snapshot totals, dates, source, status, hold expiration                  |
| PaymentTransaction               | reservation, direction, amount, provider/ref, verifiedAt, reconciliation actor                  |
| OwnerLedger / Settlement         | owner, property, fee/expense/commission, payable, period, settlement                            |
| AdminUser / Role / AuditEvent    | identity, permissions, timestamps, redacted change references                                   |
| HousekeepingTask / UnitReadiness | unit, reservation, due, assignee, stages, evidence and audit                                    |

Migration note: keep existing Prisma Property, Location, Owner, Guest, Enquiry, Reservation, Unit, AvailabilityBlock, PropertyMedia, HousekeepingTask and MaintenanceIssue IDs stable; add related entities and migrations rather than reusing business-meaningful fields.

## C3. Booking state rules

- Enquiry: NEW → CONTACTED → AVAILABLE / NOT_AVAILABLE → NEGOTIATING → CONFIRMED / CLOSED / CANCELLED; enquiry never blocks capacity.

- Quote: DRAFT → SENT → ACCEPTED / EXPIRED / DECLINED. A quote is not a booking or payment receipt.

- Reservation: TENTATIVE → AWAITING_PAYMENT (optional) → CONFIRMED → CHECKED_IN → CHECKED_OUT → CLOSED; CANCELLED or NO_SHOW by policy.

- Payment: PENDING / CLAIMED → VERIFIED or REJECTED; VERIFIED → REFUNDED/PARTIALLY_REFUNDED through separate immutable transactions.

- Unit readiness: DIRTY → CLEANING → INSPECTION → READY; manual override needs actor, reason and timestamp.

## C4. Calculation and race-condition contracts

- Stay night range is \[checkIn, checkOut); valid only when checkout strictly follows checkin. No overlapping active confirmed inventory blocks for same unit.

- Monetary values stored in integer minor units or fixed decimal with currency; never use floating-point currency calculations. Quote and reservation keep immutable rate/fee snapshots.

- Occupancy = occupied sellable unit-nights / available sellable unit-nights; ADR = accommodation revenue / sold room-nights; RevPAR = accommodation revenue / available room-nights. Define exclusions in analytics spec.

- Reservation confirmation under transaction/locking must be idempotent using request key. On contention, handle retry for serialization conflicts; database protection should enforce no overlapping confirmed stay ranges.

## C5. API capability matrix (proposed; exact URLs decided in API design)

| Capability                | Method pattern                          | Authorization / output                               |
|---------------------------|-----------------------------------------|------------------------------------------------------|
| Public cities/listings    | GET /api/public/locations, /properties  | Anonymous; published only                            |
| Search/availability/price | GET or POST /api/public/search, /quotes | Validated parameters; calculated authoritative total |
| Guest enquiry             | POST /api/public/enquiries              | Anonymous rate-limited; reference + status           |
| Portfolio/media           | GET /api/public/portfolio/\*            | Published, consented only                            |
| Owner lead                | POST /api/public/owner-leads            | Anonymous rate-limited; reference                    |
| Admin content             | CRUD /api/admin/content/\*              | Content editor + publish permission                  |
| Admin listings            | CRUD /api/admin/properties/\*           | Role controlled; draft and publish checks            |
| PMS                       | CRUD /api/admin/pms/\*                  | Booking / ops roles; serialized conflicts            |
| Accounts/audit            | /api/admin/users, /audit                | Super admin or authorized auditor                    |

# D. MOBILE-FIRST WIREFRAME SPECIFICATION

These are functional low-fidelity wireframes, not final visual designs. Each template must have mobile 320/375/390/430px acceptance snapshots, then tablet 768px and desktop 1280px. Icons on city navigation must be distinctive and accessible. Real listing/gallery photos appear inside listing pages.

## W01 — Home

Route: / • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                         |
|------------------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\]          |
| HERO PHOTO / BRAND PROMISE                     |
| \[Explore Portfolio\] primary                  |
| \[Book a Stay\] secondary                      |
| TWO PATH CARDS: Property owners / Guests       |
| FEATURED MANAGED PROPERTIES (horizontal swipe) |
| MANAGEMENT SERVICES (3 cards)                  |
| TEAM PREVIEW: people / roles                   |
| OWNER STORIES: video/screenshot previews       |
| DESTINATIONS: CITY ICON GRID                   |
| OWNER CTA / CONTACT                            |
| FOOTER / legal / contact                       |

Behavior: Portfolio-led brand story; both audience journeys accessible within first viewport; no hero auto-video on mobile.

## W02 — Guest landing

Route: /stays • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                     |
|--------------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\]      |
| \[Book a Stay\] \[city search\] \[menu\]   |
| FIND YOUR NEXT STAY                        |
| CITY ICON GRID (2–3 cols, readable labels) |
| DATE + GUEST SEARCH controls               |
| FEATURED STAY CARDS                        |
| AMENITIES / TRUST INFO                     |
| \[Explore properties\]                     |
| FOOTER / legal / contact                   |

Behavior: Context header switches to guest mode; city search opens full-width modal with keyboard support.

## W03 — City listings

Route: /stays/\[city\] • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| CITY ICON + CITY HEADING              |
| \[dates\] \[guests\] \[filter\]       |
| FILTER CHIPS / SORT                   |
| LISTING CARD: 4:3 photo               |
| TITLE \| OCCUPANCY \| AMENITIES       |
| FROM RATE or Request quote            |
| \[View stay\]                         |
| NEXT LISTING / EMPTY STATE            |
| FOOTER / legal / contact              |

Behavior: Single-column cards on mobile; rate labeling honest and total appears after dates; back preserves search state.

## W04 — Guest property detail

Route: /stays/\[city\]/\[slug\] • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                  |
|-----------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\]   |
| FULL WIDTH SWIPEABLE PHOTO GALLERY      |
| TITLE + LOCATION + SHARE                |
| SUMMARY FACTS / VERIFIED EXTERNAL LINKS |
| RATE FROM + DATE SELECTION              |
| AMENITIES / RULES / CHECK-IN OUT        |
| ROOM TYPES OR WHOLE PROPERTY            |
| AVAILABILITY / QUOTE SUMMARY            |
| STICKY \[Check dates / Enquire\]        |
| GALLERY LIGHTBOX / FAQ                  |
| FOOTER / legal / contact                |

Behavior: Reserve bottom safe-area space; no overlaid CTA hiding policy or price; content visible with slow connections.

## W05 — Guest booking enquiry

Route: /stays/\[city\]/\[slug\]/enquire • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| BACK + PROGRESS 1/2                   |
| STAY SUMMARY + DATES                  |
| GUEST COUNT                           |
| NAME / PHONE / EMAIL optional         |
| CONSENT + CONTACT PREFERENCE          |
| \[Send Enquiry\]                      |
| NEXT: reference + WhatsApp follow-up  |
| FOOTER / legal / contact              |

Behavior: Explicit not confirmed language; server errors inline; do not rely on WhatsApp send as persistence.

## W06 — Enquiry acknowledgement

Route: /enquiry/\[reference\] • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                   |
|------------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\]    |
| SUCCESS ICON + REFERENCE                 |
| PROPERTY / DATES / GUESTS                |
| STATUS: Awaiting confirmation            |
| EXPECTED NEXT STEPS (non-promissory)     |
| \[Message on WhatsApp\] \[Explore more\] |
| FOOTER / legal / contact                 |

Behavior: Guest can copy reference, return and contact team; private reference must not expose personal information.

## W07 — Portfolio landing

Route: /portfolio • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| PORTFOLIO NAV \[List Your Property\]  |
| MANAGEMENT HERO + OWNER CTA           |
| SERVICES SHORT GRID                   |
| CITY ICON SELECTOR                    |
| MANAGED PROPERTY CASE STUDY CARDS     |
| MEET THE MANAGEMENT TEAM preview      |
| OWNER STORIES (SCREENSHOT / VIDEO)    |
| HOW WE MANAGE / FAQ                   |
| OWNER ENQUIRY CTA                     |
| FOOTER / legal / contact              |

Behavior: No guest rate, booking CTA or availability in portfolio components; allow navigating to guest site via menu.

## W08 — Portfolio city

Route: /portfolio/\[city\] • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| CITY HEADER + ICON / INTRO            |
| MANAGED PROPERTY COUNTS if real       |
| CASE STUDY CARD: MEDIA / PROPERTY     |
| MANAGEMENT HIGHLIGHT / OWNER STORY    |
| \[View Our Work\]                     |
| OWNER CTA                             |
| FOOTER / legal / contact              |

Behavior: Property list filters by managed portfolio status; hidden case studies never appear.

## W09 — Portfolio property case study

Route: /portfolio/\[property\] • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                   |
|------------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\]    |
| IMMERSIVE PHOTO GALLERY                  |
| PROPERTY OVERVIEW / LOCATION             |
| SERVICES WE DELIVER                      |
| CHALLENGE → ACTION → OUTCOME (evidenced) |
| RELATED OWNER MEDIA TESTIMONIAL          |
| TEAM MEMBER ASSOCIATED WITH PROPERTY     |
| \[List Your Property\]                   |
| FOOTER / legal / contact                 |

Behavior: No prices, calendars or book CTA; only verified outcomes and consented media.

## W10 — Services

Route: /services • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| VALUE PROPOSITION                     |
| SERVICE ICON GRID                     |
| OPERATIONS PROCESS TIMELINE           |
| EXAMPLE PROPERTY EXPERIENCE           |
| FAQ ACCORDION                         |
| OWNER LEAD CTA                        |
| FOOTER / legal / contact              |

Behavior: Simple terms and explicit service scope; no unsupported guarantee or revenue claims.

## W11 — Management team

Route: /portfolio/team • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| MEET OUR TEAM HERO                    |
| FOUNDER / LEAD PROFILE                |
| TEAM PHOTO CARDS STACK                |
| ROLE / BIO / EXPERTISE                |
| CONTACT CTA                           |
| FOOTER / legal / contact              |

Behavior: Real consented people only; image cropping respects faces; profiles updated from CMS.

## W12 — Owner stories

Route: /portfolio/testimonials • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| STORIES HERO + SOURCE EXPLANATION     |
| FILTER: ALL \| VIDEOS \| SCREENSHOTS  |
| VIDEO POSTER CARD \[play\]            |
| SCREENSHOT CARD \[expand\]            |
| CAPTIONS / ALTERNATIVE TEXT           |
| OWNER NAME + CITY if approved         |
| PAGINATE / LOAD MORE                  |
| OWNER CTA                             |
| FOOTER / legal / contact              |

Behavior: No forced autoplay; lightbox with escape/swipe; redacted screenshots, accessible captions and video transcripts.

## W13 — Owner enquiry

Route: /portfolio/enquire • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| INTRO / EXPECTATION                   |
| OWNER NAME / PHONE / CITY             |
| PROPERTY TYPE / LOCATION              |
| MANAGEMENT NEEDS / NOTES              |
| CONSENT / SUBMIT                      |
| SUCCESS REFERENCE                     |
| FOOTER / legal / contact              |

Behavior: Mobile keyboard types, validation and spam/rate limiting; optional WhatsApp contact link.

## W14 — About / Contact / Policies

Route: /about, /contact, /privacy, /terms • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| BRAND / COMPANY INFO                  |
| TEAM / BUSINESS DETAILS               |
| CONTACT METHODS / FORM                |
| LEGAL CONTENT / LAST UPDATED          |
| CLEAR INTERNAL LINKS                  |
| FOOTER / legal / contact              |

Behavior: Separate templates per content type; legal pages remain readable at 320px and are CMS-controlled with approval.

# D2. ADMIN MOBILE WIREFRAMES

## W15 — Admin login

Route: /admin/login • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| BRAND / SECURE ADMIN LABEL            |
| EMAIL + PASSWORD                      |
| \[Sign In\]                           |
| ERROR / RATE-LIMIT / HELP             |
| FOOTER / legal / contact              |

Behavior: Use named accounts, secure sessions and no password leakage; hide admin index from search.

## W16 — Admin overview

Route: /admin • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                           |
|--------------------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\]            |
| HEADER + PROPERTY CONTEXT                        |
| TODAY KPIs: ARRIVALS / LEAVING                   |
| PENDING ENQUIRIES / TURNOVER / ISSUES            |
| URGENT ACTIONS QUEUE                             |
| WORKSPACE GRID: LISTINGS / PORTFOLIO / PMS / CMS |
| LATEST ACTIVITY                                  |
| FOOTER / legal / contact                         |

Behavior: One-column KPI cards, context filters, accessible drawer navigation and deep links to actions.

## W17 — Admin listings

Route: /admin/listings • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                           |
|--------------------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\]            |
| SEARCH + FILTER + \[Add\]                        |
| PUBLISH STATUS TABS                              |
| PROPERTY ROW CARDS WITH COVER                    |
| GUEST/PORFOLIO FLAGS                             |
| \[Edit\] \[Preview\]                             |
| DRAFT EDITOR: FACTS \> MEDIA \> RATES \> PUBLISH |
| FOOTER / legal / contact                         |

Behavior: Form broken into steps, dirty-state guard, save draft, responsive media uploader.

## W18 — Admin portfolio

Route: /admin/portfolio • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| MANAGED CASE STUDIES                  |
| \[Add case study\]                    |
| CITY / PROPERTY LINK                  |
| TEAM MANAGEMENT                       |
| OWNER STORIES REVIEW QUEUE            |
| PREVIEW / PUBLISH ACTIONS             |
| FOOTER / legal / contact              |

Behavior: Portfolio content cannot accidentally enable stay booking; testimonial consent required before publish.

## W19 — PMS overview / reservations

Route: /admin/pms • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| TODAY OCCUPANCY + PRIORITIES          |
| TABS: BOOKINGS \| CALENDAR \| GUESTS  |
| BOOKING CARD + STATUS / UNIT          |
| \[New Reservation\]                   |
| ARRIVALS / DEPARTURES / NO-SHOW       |
| FOOTER / legal / contact              |

Behavior: Mobile list calendar rather than dense monthly grid by default; unit conflict and status validation.

## W20 — PMS operations

Route: /admin/pms/operations • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| ROOM READINESS COUNTS                 |
| HOUSEKEEPING TASK LIST                |
| ASSIGNEE / DUE / PRIORITY             |
| TASK DETAILS / PHOTO EVIDENCE         |
| MAINTENANCE QUEUE                     |
| \[Mark Ready\] with validation        |
| FOOTER / legal / contact              |

Behavior: Tasks scoped to unit, offline/retry-friendly saves, timestamps and audits; never silently override dirty room.

## W21 — PMS finance and owners

Route: /admin/pms/finance • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| COLLECTION SUMMARY                    |
| PAYMENT VERIFICATION QUEUE            |
| GUEST BALANCES / REFUNDS              |
| OWNER STATEMENTS / COMMISSIONS        |
| EXPORT / RECONCILE                    |
| FOOTER / legal / contact              |

Behavior: No invented balances; require explicit finance permissions, snapshots and confirmation before financial mutations.

## W22 — CMS overview/editor

Route: /admin/cms • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| CONTENT SECTIONS                      |
| HOME / ABOUT / SERVICES / LEGAL       |
| CITY ICONS / NAVIGATION LABELS        |
| HERO IMAGE + MOBILE CROP              |
| SECTION ORDER / PREVIEW               |
| \[Save draft\] \[Publish\]            |
| FOOTER / legal / contact              |

Behavior: Safe preview, accessibility warnings, version history, published/unpublished separation.

## W23 — CMS media & testimonials

Route: /admin/cms/media • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| MEDIA LIBRARY                         |
| UPLOAD IMAGE / VIDEO                  |
| THUMBNAIL / CAPTIONS / ALT            |
| CONSENT STATUS / REDACTION            |
| APPROVE / PUBLISH / ARCHIVE           |
| FOOTER / legal / contact              |

Behavior: Restrict upload type/size; virus scan, signed media URLs or configured delivery policies.

## W24 — Admin settings and roles

Route: /admin/settings • Mobile reference: 390px; minimum supported: 320px

| STATUS BAR / SAFE AREA                |
|---------------------------------------|
| MODERN STAYZ \[context CTA\] \[menu\] |
| BUSINESS CONTACT / WHATSAPP           |
| PAYMENT / CANCELLATION POLICIES       |
| USERS & ROLES                         |
| AUDIT LOG                             |
| INTEGRATION HEALTH / BACKUPS          |
| FOOTER / legal / contact              |

Behavior: Sensitive settings demand privileged access and audit events; no destructive action without confirmation.

# E. NON-FUNCTIONAL REQUIREMENTS

| NFR ID | Attribute     | Release-level requirement / check                                                                                        |
|--------|---------------|--------------------------------------------------------------------------------------------------------------------------|
| NFR-01 | Mobile first  | Design at 320px; test 375, 390, 430, 768 and 1280px; no horizontal scroll or clipped CTA.                                |
| NFR-02 | Interaction   | Touch targets ≥44×44 CSS px where feasible; keyboard and screen-reader operable.                                         |
| NFR-03 | Performance   | Target CWV p75 mobile: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; validate field data when sufficient.                             |
| NFR-04 | Images/videos | Responsive picture sizes, AVIF/WebP where supported, poster previews, lazy-load below fold, no autoplay audio.           |
| NFR-05 | Security      | TLS, secure HttpOnly cookies, CSRF/origin defense, RBAC, per-endpoint validation, rate limiting, audit logs.             |
| NFR-06 | Privacy       | Consent for team/testimonials, PII redaction, retention policy, private admin assets, deletion workflow.                 |
| NFR-07 | Availability  | Database backup automation, documented restore drill, health checks and operational alerting.                            |
| NFR-08 | Observability | Structured logs, request IDs, metrics for enquiry drop-off, failed bookings, conflicting inventory, publishing errors.   |
| NFR-09 | SEO           | Canonical routes, unique titles/meta, index only published pages, structured data where accurate, sitemap and redirects. |
| NFR-10 | Compatibility | Current Chrome/Safari/Edge and mainstream Android/iOS browsers; verify real touch and date selection.                    |
| NFR-11 | Localization  | India-ready INR formatting, phone input, local property timezone and explicit tax policy.                                |
| NFR-12 | Accessibility | Target WCAG 2.2 AA; captions for video, alt text, visible focus, contrast and reduced-motion support.                    |

## E2. Analytics events / definitions

| Event                   | Required properties                             |
|-------------------------|-------------------------------------------------|
| audience_path_selected  | guest\|owner, source route, device class        |
| city_selected           | cityId, path guest\|portfolio                   |
| property_viewed         | propertyId, viewType guest\|portfolio           |
| rate_quoted             | propertyId, dates, unit, displayedQuoteId       |
| guest_enquiry_submitted | reference, propertyId, source (no raw PII)      |
| owner_lead_submitted    | reference, city, source (no raw PII)            |
| testimonial_opened      | testimonialId, IMAGE\|VIDEO, placement          |
| booking_confirmed       | reservationId, unitId, channel, amount snapshot |
| room_ready_changed      | unitId, from, to, actor role                    |
| content_published       | entityId, entity type, version                  |

## E3. Accessibility / mobile QA checklist

- Device width 320px has no horizontal scrolling, overflow, clipped dialogs or hidden submit actions.

- Sticky booking buttons do not obscure input focus/keyboard, consent or page footer.

- Header menu is focus-trapped while open and closes by escape, outside click and successful navigation.

- Photo gallery and owner screenshot lightbox support swipe, next/prev, keyboard, close and pinch/zoom where practical.

- Videos require explicit play, captions/subtitles and accessible transcripts; media posters load ahead of video bytes.

- Date picker uses clear selected ranges, validation, locale and screen-reader labels.

- Form validation announces errors and preserves entered data on recoverable API failures.

- No user information, payment facts or unpublished content exposed through cached public responses.

# F. USER ACCEPTANCE TESTING (UAT)

Run tests on staging with a seeded but entirely fictional dataset labeled TEST. Test one whole-property and one multi-room property, 2 cities, guest and owner records, rate plans, and signed-in role-based accounts. Never use production card data or actual customer personal information.

| Test   | Pri | Scenario                     | Steps / input                                       | Expected result                                                              |
|--------|-----|------------------------------|-----------------------------------------------------|------------------------------------------------------------------------------|
| UAT-01 | P0  | Mobile home navigation       | At 320/390px open homepage and choose each path     | Both guest and owner journeys reachable; zero overflow                       |
| UAT-02 | P0  | Route-aware header           | Navigate / → /stays → /portfolio → /stays/\[city\]  | Links/CTA/search change by route; cross-path discoverable                    |
| UAT-03 | P0  | Guest city icons             | Tap a city icon with published listings             | Only guest-enabled listings in selected city shown                           |
| UAT-04 | P0  | Empty guest city             | Choose city with no published stays                 | Helpful empty state and alternate discovery                                  |
| UAT-05 | P0  | Guest property prices        | Choose nights and guest count                       | Authoritative nightly/fee/tax/total quote or transparent request-quote state |
| UAT-06 | P0  | Unavailable date             | Select blocked night                                | Unavailable clearly shown; no confirmed booking possible                     |
| UAT-07 | P0  | Guest enquiry                | Submit valid details and accept consent             | Reference persists; UI states not yet confirmed; WhatsApp optional           |
| UAT-08 | P0  | Invalid enquiry              | Missing phone / impossible dates                    | Inline validation, no malformed record                                       |
| UAT-09 | P0  | Portfolio city               | Select city from owner portfolio                    | Managed case studies only; no price or booking CTA                           |
| UAT-10 | P0  | Case-study privacy           | Open unpublished/non-consented case study URL       | Not public; no leaked content                                                |
| UAT-11 | P0  | Screenshot testimonial       | Open original screenshot on phone                   | Legible zoom/lightbox; sensitive info redacted                               |
| UAT-12 | P0  | Video testimonial            | Tap preview and play/caption                        | No autoplay audio; captions/transcript accessible                            |
| UAT-13 | P0  | Owner enquiry                | Submit owner lead                                   | Lead ID/status created; confirmation visible                                 |
| UAT-14 | P0  | Team editing                 | Admin publishes/unpublishes profile                 | Public team pages change consistently                                        |
| UAT-15 | P0  | Publish isolation            | Enable portfolio only on property                   | No guest listing; portfolio visible                                          |
| UAT-16 | P0  | Booking concurrency          | Two staff simultaneously confirm same unit/dates    | At most one succeeds; other gets conflict                                    |
| UAT-17 | P0  | Enquiry vs reservation       | Submit multiple enquiries for same dates            | No unintended inventory blocks from enquiries                                |
| UAT-18 | P0  | Reservation cancellation     | Cancel confirmed stay                               | Inventory released; audit and payment records remain                         |
| UAT-19 | P0  | Room turnover                | Check out guest                                     | Room dirty/turnover task created; inspect to ready                           |
| UAT-20 | P0  | Payment verification         | Record unverified payment screenshot                | No paid state until independent verification                                 |
| UAT-21 | P0  | Owner settlement             | Reconcile completed eligible stay                   | Ledger commission/owner payable matches approved rule                        |
| UAT-22 | P0  | RBAC                         | Content editor attempts payment refund              | 403; no mutation; audit event recorded                                       |
| UAT-23 | P0  | CMS revision                 | Edit hero, preview, publish, rollback               | Mobile crop correct and rollback restores content                            |
| UAT-24 | P0  | Production testimonial proof | Try to publish without consent                      | Blocked with clear required action                                           |
| UAT-25 | P1  | Search/filter state          | Navigate guest search back and forward              | Parameters preserved in URL/state                                            |
| UAT-26 | P1  | Admin mobile                 | Operate PMS at 375px                                | No tiny controls/clipped data or inaccessible actions                        |
| UAT-27 | P1  | Keyboard/accessibility       | Navigate menus, filters, modal, video with keyboard | Focus, labels, escape and announcements function                             |
| UAT-28 | P0  | Network failure recovery     | Fail media upload / enquire API                     | Retry without duplicate submission                                           |
| UAT-29 | P0  | Performance baseline         | Measure phone performance on staging                | Performance targets documented; critical defects resolved                    |
| UAT-30 | P0  | Backup restore               | Restore staging from encrypted backup               | Data and media references usable; RPO/RTO confirmed                          |

## F2. UAT execution and defect protocol

- Each UAT case captures build SHA, tester, test date/device/browser, evidence, actual outcome, pass/fail/blocked status and defect link.

- Severity 1: security/privacy breach, confirmed overlapping occupancy, material financial corruption, inaccessible checkout. Severity 2: critical flow broken without workaround. Severity 3: degraded but usable. Severity 4: cosmetic.

- Go/no-go: all P0 tests pass; no open Sev1/Sev2; mobile navigation, owner proof, reservation conflicts, roles, finance and backup restore evidenced; content and legal signed off.

- Sign-off roles: business owner/product owner, operations lead, engineering lead, QA lead; every accepted exception documented with owner and target date.

# G. RELEASE ROADMAP, TRACEABILITY AND OPEN DECISIONS

| Phase                  | Scope                                                                                           | Exit evidence                                           |
|------------------------|-------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| 0 — Discovery & design | Approved BRD, business rates/terms, information architecture, wireframes, consent templates     | Stakeholder sign-off and open decisions resolved        |
| 1 — Foundations        | Canonical property presentation split, route-aware header, RBAC/audit, responsive design system | Core API/role and mobile tests pass                     |
| 2 — Public experience  | Guest city search and quotes, portfolio case studies, team, media testimonials, owner leads     | Public P0 UAT and accessibility tests pass              |
| 3 — PMS commercial     | Pricing, payments ledger, reservations, turnover, owner statements                              | Concurrency, finance reconciliation and role tests pass |
| 4 — CMS & launch       | Full admin CMS, media approval, SEO, monitoring, migration, backups, legal                      | Release gate and restoration drill pass                 |
| 5 — Optimization       | Owner portal, automation, OTA integrations if prioritized                                       | Separately approved roadmap                             |

## G2. Requirements → tests traceability sample

| Business outcome            | FRD controls             | UAT evidence     |
|-----------------------------|--------------------------|------------------|
| BR-01 Owner acquisition     | FR-020–028, FR-040–043   | UAT-09–15, 24    |
| BR-02 Guest conversion      | FR-010–018               | UAT-01–08, 25    |
| BR-03 Booking safety        | FR-050–053               | UAT-16–18        |
| BR-04 Operational readiness | FR-054–055               | UAT-19, 26       |
| BR-05 Financial reporting   | FR-056–060               | UAT-20–22        |
| BR-06 Content independence  | FR-040–045               | UAT-14, 23–24    |
| BR-07 Mobile usability      | FR-002–003 and NFR-01–12 | UAT-01–02, 26–29 |

## G3. Decisions required before fixed-price development

1.  DEC-01: Confirm business entity name, branding, exact live domain and management service descriptions.

2.  DEC-02: Approve city launch list, initial real properties and whether each appears in guest, portfolio or both.

3.  DEC-03: Define pricing model: per unit or whole-property, seasonal prices, taxes, add-ons, deposits, cancellation and refunds.

4.  DEC-04: Choose assisted enquiry-only booking versus online immediate payment/confirmation for initial release.

5.  DEC-05: Approve owner commission structure, settlement cadence and operational expense approvals.

6.  DEC-06: Provide genuine team photos/roles, screenshot/video testimonials, consent records and real case-study evidence.

7.  DEC-07: Define staff roster, access rights, owner access expectations and financial approver.

8.  DEC-08: Approve legal/privacy/cookie/consent text and retention timeline with qualified counsel.

9.  DEC-09: Choose notification provider (email/WhatsApp API) and failure/retry handling.

10. DEC-10: Confirm accessibility, browsers, traffic expectations, media storage and backup recovery objectives.

## G4. Source audit: existing versus target

| Existing in supplied ZIP (static inspection)             | Planned / materially incomplete                                             |
|----------------------------------------------------------|-----------------------------------------------------------------------------|
| Next.js web + Express TypeScript API + PostgreSQL/Prisma | Independent guest/portfolio presentation, complete city route restructuring |
| Location/property/unit/gallery/amenity models            | Authentic media testimonials, case studies, team CMS models                 |
| Date availability and blocks                             | Atomic DB exclusion policy/retry verification and rate engine               |
| Saved enquiries, manual reservations, owners/guests      | Quotes, payment ledger, settlements, named RBAC and audit                   |
| Housekeeping/maintenance basic tracking                  | Automated readiness workflow and assigned staff identities                  |
| Single admin page and site settings                      | Four dedicated admin workspaces, CMS revisioning and mobile admin UX        |
| Source documentation and prior test files                | Fresh end-to-end staging certification and release gate                     |

Evidence note: README contains stale statements that conflict with current schema/modules. This document uses the visible schema and source layout for existing capability classification, and explicitly labels the target requirements. Static review does not imply deployment/integration validation.

## Approval record

| Role                     | Name / signature                         | Date                 |
|--------------------------|------------------------------------------|----------------------|
| Business owner / sponsor | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_ |
| Product / BA             | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_ |
| Engineering lead         | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_ |
| QA / UAT lead            | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_ |

END OF BASELINE SPECIFICATION
