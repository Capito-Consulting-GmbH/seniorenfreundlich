# AI Implementation Blueprint (Kilo Code Backlog)

## Projekt: seniorenfreundlich.de (MVP)

## Konventionen

* **Next.js App Router**
* **TypeScript**
* **Server Actions** wo sinnvoll, **API Routes** für Webhooks/3rd-party callbacks
* **DB:** Neon Postgres
* **ORM:** Drizzle
* **Auth:** Clerk
* **Payment:** Mollie (Hosted Checkout + Webhook)
* **Mails:** Brevo (+ Mollie Stock-Mails für Zahlungsbestätigungen)
* **Storage:** Vercel Blob (Logos + Badge Assets)
* **Consent:** Cookiebot
* **Analytics:** GA4
* **Obs:** Sentry
* **UI:** Shadcn/ui
* **i18n:** next-intl
* **Testing:** Vitest (Unit/Integration), Playwright (E2E)

---

## EPIC 0 — Repo Setup & Quality Baseline

### Task 0.1 — Project init & dependencies

**Prompt für KI:**

> Initialize a Next.js App Router project in TypeScript for seniorenfreundlich.de. Add required dependencies for Drizzle, Neon, Clerk, Mollie, Brevo, Vercel Blob, Sentry, and next-intl (for DE/EN). Add a sensible folder structure.

**DoD:**

* `app/` App Router structure exists
* dependencies installed
* `.env.example` created with all needed env vars (placeholders)

**Files:**

* `package.json`
* `.env.example`
* `README.md`

---

### Task 0.2 — Environment variable contract

**Prompt:**

> Create a typed env loader (zod or similar) that validates required env vars at startup.

**DoD:**

* app fails fast if required env vars missing
* exports typed env object

**Files:**

* `src/env.ts`

---

### Task 0.3 — Basic UI shell + navigation

**Prompt:**

> Create a minimal UI shell with header navigation for German default and English under /en. Provide links to /unternehmen, /dashboard, language toggle.

**DoD:**

* layout renders
* navbar works
* language toggle works (simple link switch for now)

**Files:**

* `app/layout.tsx`
* `app/page.tsx`
* `app/en/page.tsx`

---

## EPIC 1 — Internationalization (DE default, EN prefixed)

### Task 1.1 — next-intl setup

**Prompt:**

> Implement next-intl for App Router: default German routes without prefix, English under /en. Provide message files and a simple translation helper.

**DoD:**

* translations work on both locales
* `messages/de.json`, `messages/en.json` exist
* `getTranslations` used in at least 2 pages

**Files:**

* `messages/de.json`
* `messages/en.json`
* `src/i18n/*`
* `middleware.ts` (if needed)

---

### Task 1.2 — hreflang + SEO basics

**Prompt:**

> Add hreflang alternate links for company and certificate pages between DE and EN variants. Add basic metadata per page.

**DoD:**

* `<link rel="alternate" hreflang=...>` exists
* metadata uses translated titles/descriptions

**Files:**

* `app/unternehmen/[slug]/page.tsx`
* `app/en/companies/[slug]/page.tsx`
* `app/zertifikat/[slug]/page.tsx`
* `app/en/certificate/[slug]/page.tsx`

---

## EPIC 2 — Database & Drizzle

### Task 2.1 — Drizzle config + migrations

**Prompt:**

> Configure Drizzle with Neon Postgres. Add migration setup and scripts. Provide `db.ts` and `schema.ts`.

**DoD:**

* drizzle can generate and run migrations
* connection works locally with Neon
* basic scripts: `db:generate`, `db:migrate`

**Files:**

* `drizzle.config.ts`
* `src/db/db.ts`
* `src/db/schema.ts`

---

### Task 2.2 — Data models (Company, Order, Badge, AuditEvent)

**Prompt:**

> Implement Drizzle schema for Company, Order, Badge, AuditEvent with proper indexes, enums, and timestamps. Design for reusability: mark domain-specific fields. Orders use molliePaymentId/mollieOrderId instead of Stripe fields. AuditEvents use entityType/entityId/action/actorId pattern for generic auditing.

**DoD:**

* schema compiles
* migration created
* indexes for slug, ownerClerkUserId, companyId, assertionId

**Tables:**

* `companies`
* `orders`
* `badges`
* `audit_events`

---

### Task 2.3 — Repository layer

**Prompt:**

> Create a small repository/service layer wrapping common DB operations (create/update/find company, create order, mark order paid, create badge, revoke badge, write audit event).

**DoD:**

* no raw SQL scattered in pages
* functions are typed

**Files:**

* `src/services/companyService.ts`
* `src/services/orderService.ts`
* `src/services/badgeService.ts`
* `src/services/auditService.ts`

---

## EPIC 3 — Auth (Clerk)

### Task 3.1 — Clerk integration

**Prompt:**

> Integrate Clerk with Next.js App Router. Add middleware protection for /dashboard routes. Add sign-in/up pages and user button.

**DoD:**

* unauth users redirected
* sign in/out works

**Files:**

* `middleware.ts`
* `app/sign-in/[[...sign-in]]/page.tsx`
* `app/sign-up/[[...sign-up]]/page.tsx`
* `app/dashboard/layout.tsx`

---

### Task 3.2 — Company ownership model

**Prompt:**

> Implement “company belongs to a clerk user” logic: each user can create exactly one company for MVP. Add `getCurrentCompany()` helper that uses Clerk userId.

**DoD:**

* first time: creates company skeleton or shows onboarding
* subsequent: loads company

**Files:**

* `src/auth/getCurrentUser.ts`
* `src/auth/getCurrentCompany.ts`
* `app/dashboard/page.tsx`

---

## EPIC 4 — Company Profile Management

### Task 4.1 — Company onboarding flow

**Prompt:**

> Build /dashboard onboarding: if no company exists, show a form to create company name and slug. Validate slug uniqueness.

**DoD:**

* company created with slug
* redirects to /dashboard/profile

**Files:**

* `app/dashboard/page.tsx`
* `app/dashboard/onboarding/page.tsx` (or inline)
* `src/validators/company.ts`

---

### Task 4.2 — Profile edit page

**Prompt:**

> Implement /dashboard/profile: form to edit company fields (name, description, website, phone, email, address, city, postalCode). Server Action to save.

**DoD:**

* form saves
* validation errors shown
* audit event logged

**Files:**

* `app/dashboard/profile/page.tsx`
* `src/actions/updateCompanyProfile.ts`

---

### Task 4.3 — Logo upload to Vercel Blob

**Prompt:**

> Add logo upload using Vercel Blob. Store logoUrl in DB. Provide upload route/action and secure it for authenticated user.

**DoD:**

* upload works
* only owner can upload
* logo displayed on profile pages

**Files:**

* `src/actions/uploadLogo.ts`
* `app/dashboard/profile/page.tsx`

---

## EPIC 5 — Public Directory & Company Pages (SEO)

### Task 5.1 — /unternehmen directory page

**Prompt:**

> Build /unternehmen: list companies with active badge only. Add search by name/city and pagination.

**DoD:**

* renders list
* query params work: `?q=&city=&page=`
* SEO metadata

**Files:**

* `app/unternehmen/page.tsx`
* `src/services/publicDirectoryService.ts`

---

### Task 5.2 — /unternehmen/[slug] company page

**Prompt:**

> Build public company profile page: show company data, logo, badge status (active/revoked), and link to certificate page if active.

**DoD:**

* 404 if not found
* shows “Siegel aktiv” / “Kein Siegel”
* SEO meta from company data

**Files:**

* `app/unternehmen/[slug]/page.tsx`

---

### Task 5.3 — English directory pages

**Prompt:**

> Implement /en/companies and /en/companies/[slug] mirroring German pages with translated labels.

**DoD:**

* parity with DE routes
* hreflang links

**Files:**

* `app/en/companies/page.tsx`
* `app/en/companies/[slug]/page.tsx`

---

## EPIC 6 — Certificate Pages & Badge Embed

### Task 6.1 — /zertifikat/[slug] certificate page

**Prompt:**

> Build certificate page: show company, certificate id (assertionId), issuedAt, status, and verification explanation. If revoked, show revoked date.

**DoD:**

* public page renders
* clear status indicator
* link to OpenBadges assertion JSON

**Files:**

* `app/zertifikat/[slug]/page.tsx`

---

### Task 6.2 — /en/certificate/[slug]

**Prompt:**

> English certificate page variant with same data and translated text.

**Files:**

* `app/en/certificate/[slug]/page.tsx`

---

### Task 6.3 — Embed code generator

**Prompt:**

> On /dashboard/badge show embed code snippet that links to /zertifikat/[slug] and shows badge image. Provide copy-to-clipboard.

**DoD:**

* code includes `<a>` + `<img>`
* uses stable badge image URL
* copy button works

**Files:**

* `app/dashboard/badge/page.tsx`

---

## EPIC 7 — Payments (Mollie Checkout)

### Task 7.1 — Mollie integration + constants

**Prompt:**

> Create Mollie integration helper. Configure the Mollie client with API key from env (`MOLLIE_API_KEY`). Add helper to create a Mollie payment for the current company with redirect and webhook URLs.

**DoD:**

* session creation function exists
* success/cancel URLs defined

**Files:**

* `src/mollie/mollie.ts`
* `src/mollie/createPayment.ts`

---

### Task 7.2 — /dashboard/billing buy flow

**Prompt:**

> Build /dashboard/billing page with “Siegel kaufen (99€)” button that starts Mollie checkout. Prevent purchase if company already has active badge.

**DoD:**

* button redirects to Mollie payment page
* blocked when active badge exists

**Files:**

* `app/dashboard/billing/page.tsx`
* `src/actions/startCheckout.ts`

---

### Task 7.3 — Orders table + creation

**Prompt:**

> When payment is created, create an Order row with status pending and store molliePaymentId and companyId.

**DoD:**

* pending order created before redirect
* audit event logged

---

## EPIC 8 — Mollie Webhook → Issue Badge

### Task 8.1 — Webhook endpoint

**Prompt:**

> Implement /api/mollie/webhook (route handler). Mollie sends paymentId in the webhook body. Fetch payment status from Mollie API to verify. Handle paid status. Make it idempotent: ignore already processed paymentIds.

**DoD:**

* signature verification
* safe replays
* logs and audit events

**Files:**

* `app/api/mollie/webhook/route.ts`

---

### Task 8.2 — Badge issuance transaction

**Prompt:**

> On successful payment (verified via Mollie API): mark Order paid, create or upsert Badge for company with assertionId (uuid), status active, issuedAt now. Ensure DB transaction semantics.

**DoD:**

* order paid
* badge active
* certificate page resolves

**Files:**

* `src/services/mollieWebhookService.ts`

---

### Task 8.3 — Email on badge issued

**Prompt:**

> After badge issuance, send email via Brevo to company contact email (or owner email fallback) including certificate link and embed code link. Mollie handles payment confirmation emails. If Mollie does not support stock payment emails, add a separate Brevo template for payment confirmation.

**DoD:**

* badge activation email sent on success
* failures logged to Sentry but do not fail webhook response

**Files:**

* `src/email/brevo.ts`
* `src/email/templates/badgeIssued.ts`

---

## EPIC 9 — Badge Management (Revoke / Entwerten)

### Task 9.1 — Revoke in dashboard

**Prompt:**

> Add “Siegel entwerten” button on /dashboard/badge. Confirm dialog. On confirm: set badge status revoked and revokedAt now; log audit event.

**DoD:**

* badge becomes revoked
* certificate page shows revoked
* company directory no longer lists it (if directory shows only active)

**Files:**

* `src/actions/revokeBadge.ts`
* `app/dashboard/badge/page.tsx`

---

## EPIC 10 — Open Badges API (Hosted)

### Task 10.1 — Issuer endpoint

**Prompt:**

> Implement OpenBadges issuer JSON at /api/openbadges/issuer. Include name, url, email, image URL, description.

**DoD:**

* returns valid JSON
* stable URLs
* caches allowed

**Files:**

* `app/api/openbadges/issuer/route.ts`

---

### Task 10.2 — BadgeClass endpoint

**Prompt:**

> Implement /api/openbadges/badgeclass JSON describing the “Seniorenfreundlich Siegel” including criteria URL and image URL.

**DoD:**

* criteria points to a public criteria page
* image points to hosted badge image

**Files:**

* `app/api/openbadges/badgeclass/route.ts`
* `app/kriterien/page.tsx` (public criteria page)

---

### Task 10.3 — Assertion endpoint

**Prompt:**

> Implement /api/openbadges/assertion/[id]. It loads badge + company by assertionId. Returns hosted assertion JSON including evidence URL pointing to /zertifikat/[slug] and status.

**DoD:**

* 404 if not found
* reflects revoked status
* includes issuer + badgeclass refs

**Files:**

* `app/api/openbadges/assertion/[id]/route.ts`

---

## EPIC 11 — Consent, Analytics, Observability

### Task 11.1 — Cookiebot integration

**Prompt:**

> Add Cookiebot script to app layout with blocking mode auto. Ensure it loads before GA scripts.

**DoD:**

* Cookie banner shows
* GA blocked until consent

**Files:**

* `app/layout.tsx`

---

### Task 11.2 — Google Analytics (GA4)

**Prompt:**

> Add GA4 gtag integration using Next Script. Ensure it respects Cookiebot categories and only runs after analytics consent.

**DoD:**

* no GA requests before consent
* works after accept

**Files:**

* `src/analytics/ga.ts`
* `app/layout.tsx`

---

### Task 11.3 — Sentry integration

**Prompt:**

> Add Sentry for Next.js with Vercel. Configure DSN env var, enable in production, capture exceptions in API routes and server actions.

**DoD:**

* errors appear in Sentry
* source maps working if configured

**Files:**

* `sentry.client.config.ts`
* `sentry.server.config.ts`
* `sentry.edge.config.ts`

---

## EPIC 12 — SEO & Sitemaps

### Task 12.1 — robots.txt and sitemap.xml

**Prompt:**

> Implement robots.txt and dynamic sitemap.xml including /unternehmen pages and /zertifikat pages for active/revoked badges. Include English equivalents.

**DoD:**

* sitemap accessible
* includes all public slugs
* excludes dashboard routes

**Files:**

* `app/robots.ts`
* `app/sitemap.ts`

---

### Task 12.2 — Structured data

**Prompt:**

> Add JSON-LD for Organization/LocalBusiness on company pages and certificate pages. Keep it minimal and valid.

**DoD:**

* JSON-LD present
* no fake ratings

**Files:**

* company & certificate page components

---

## EPIC 13 — Legal & Content Pages

### Task 13.1 — Legal pages

**Prompt:**

> Create German legal pages: /impressum, /datenschutz, /agb, /widerruf. Add English placeholders under /en if desired.

**DoD:**

* pages exist
* linked in footer
* privacy lists Vercel, Neon, Mollie, Clerk, Brevo, GA, Cookiebot, Sentry

**Files:**

* `app/impressum/page.tsx`
* `app/datenschutz/page.tsx`
* `app/agb/page.tsx`
* `app/widerruf/page.tsx`

---

## EPIC 14 — Admin (Optional for MVP but very useful)

### Task 14.1 — Minimal admin guard

**Prompt:**

> Add /admin route accessible only for a configured Clerk userId list. Show basic tables: companies, orders, badges, revoke/activate actions.

**DoD:**

* protected
* can view core data
* can manually revoke in emergencies

**Files:**

* `app/admin/page.tsx`
* `src/auth/isAdmin.ts`

---

# Suggested Execution Order (fastest path to “working product”)

1. EPIC 0 (setup)
2. EPIC 2 (DB)
3. EPIC 3 (Auth)
4. EPIC 1 (i18n)
5. EPIC 4 (Profile)
6. EPIC 7 + 8 (Mollie + Webhook + issue badge)
7. EPIC 6 (certificate + embed)
8. EPIC 5 (directory + company pages)
9. EPIC 10 (OpenBadges endpoints)
10. EPIC 11 (Cookiebot + GA + Sentry)
11. EPIC 12 + 13 (SEO + legal + widerruf)
12. EPIC 14 (optional admin)