# Product Development Document — seniorenfreundlich.de

_Last updated: 2026-04-20 | Branch: `feature/questionaire-builder`_

---

## 1. Product overview

**seniorenfreundlich.de** is a public directory of senior-friendly businesses in Germany. Companies purchase a tiered digital seal ("Siegel") after completing a configurable assessment. The seal is publicly verifiable via an Open Badges-compatible certificate page.

### Business model

Companies pay a one-time fee per tier to receive a digital seal:

| Tier | Price | Assessment difficulty |
|------|-------|-----------------------|
| Basic | €49 | Entry-level criteria |
| Standard | €99 | Intermediate criteria |
| Premium | €149 | Advanced criteria |

Seal purchase requires a **pre-approved assessment** for that tier. Assessment approval is manual (admin review). Payment is processed via Mollie Hosted Checkout. Orders are only created in the database after Mollie confirms payment (deferred order creation).

---

## 2. Technology stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | ^16.2.2 |
| Language | TypeScript | 5.x |
| Database | Neon Postgres (serverless HTTP) | — |
| ORM | Drizzle ORM | ^0.45.2 |
| Auth | better-auth (admin plugin) | ^1.6.2 |
| Payments | Mollie Hosted Checkout + Webhooks | ^4.5.0 |
| Email | Brevo | — |
| Storage | Vercel Blob | — |
| Hosting | Vercel | — |
| Monitoring | Sentry (client + server + edge) | — |
| i18n | next-intl (DE default, `/en` prefix) | ^4.9.0 |
| UI Components | shadcn/ui + Radix UI | — |
| Consent | Cookiebot | — |
| Analytics | Google Analytics 4 | — |

### Key architectural constraints

- Neon HTTP driver has **no transaction support** — all multi-step operations use sequential queries
- next-intl keys **cannot contain dots** — use underscores
- `useRouter` must come from `@/src/i18n/navigation` (locale-aware), not `next/navigation`
- DB schema uses `uuid` PKs on most tables; `user`, `account`, `session` use `text` IDs (better-auth)

---

## 3. Database schema

### 3.1 Core tables

#### `user`
| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | better-auth managed |
| `name` | text | |
| `email` | text unique | |
| `emailVerified` | boolean | |
| `role` | text | `"user"` or `"admin"` |
| `banned` | boolean | better-auth admin plugin |
| `banReason` | text | |
| `banExpires` | timestamp | |
| `createdAt` / `updatedAt` | timestamp | |

#### `account`
better-auth credential/OAuth accounts. `providerId = "credential"` for email+password.

#### `session`
better-auth sessions. Includes `impersonatedBy` (admin plugin).

#### `companies`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | |
| `slug` | text unique | URL-safe company identifier |
| `ownerUserId` | text FK → user | |
| `email` | text | |
| `website` | text | |
| `phone` | text | |
| `address` / `city` / `postalCode` / `country` | text | |
| `logoUrl` | text | Vercel Blob URL |
| `hrbNumber` | text | German commercial register |
| `verificationStatus` | text | `unverified` / `pending` / `verified` |
| `verificationToken` | text | Email verification token |
| `verificationTokenExpiresAt` | timestamp | |
| `verificationAttempts` | integer | |
| `verifiedAt` | timestamp | |
| `pendingMolliePaymentId` | text | Set on checkout start, cleared on webhook |
| `createdAt` / `updatedAt` | timestamp | |

#### `orders`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `companyId` | uuid FK | |
| `molliePaymentId` | text unique | |
| `amount` | integer | Cents (e.g. 4900 = €49.00) |
| `currency` | text | Default `EUR` |
| `status` | enum | `pending` / `paid` / `failed` / `expired` / `refunded` |
| `tier` | enum | `basic` / `standard` / `premium` |
| `createdAt` / `updatedAt` | timestamp | |

#### `badges`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `companyId` | uuid FK | |
| `assertionId` | uuid unique | Open Badges assertion identifier |
| `status` | enum | `active` / `revoked` |
| `tier` | enum | `basic` / `standard` / `premium` |
| `issuedAt` | timestamp | |
| `revokedAt` | timestamp | nullable |

#### `auditEvents`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `entityType` | text | e.g. `company`, `order`, `badge`, `assessment_submission` |
| `entityId` | text | FK reference (not enforced) |
| `action` | text | e.g. `payment_confirmed`, `badge_active`, `assessment_approved` |
| `actorId` | text | User ID or `"mollie:webhook"` / `"system"` |
| `metadata` | jsonb | Contextual data |
| `createdAt` | timestamp | |

### 3.2 Assessment tables

#### `assessmentConfigs`
Versioned JSONB questionnaire definitions. Only one row per tier may be `active`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `version` | integer unique | Auto-incrementing global version |
| `status` | enum | `draft` / `active` / `archived` |
| `tier` | enum | `basic` / `standard` / `premium` |
| `title` | jsonb | `{ de: string, en: string }` |
| `config` | jsonb | Full questionnaire structure (sections + questions) |
| `createdBy` | text FK → user | |
| `createdAt` / `updatedAt` | timestamp | |

**Constraints:** unique partial index `(tier, status = 'active')` — one active config per tier.

#### `assessmentSubmissions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `companyId` | uuid FK | |
| `configId` | uuid FK | Pinned to config version at start |
| `status` | enum | `draft` / `submitted` / `under_review` / `approved` / `rejected` |
| `adminNotes` | text | Rejection/review feedback |
| `reviewedBy` | text FK → user | |
| `reviewedAt` | timestamp | |
| `submittedAt` | timestamp | |
| `createdAt` / `updatedAt` | timestamp | |

#### `assessmentAnswers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `submissionId` | uuid FK (cascade delete) | |
| `questionId` | text | Matches stable `question.id` in config JSON |
| `value` | jsonb | Answer shape varies by question type |
| `createdAt` / `updatedAt` | timestamp | |

**Constraints:** unique on `(submissionId, questionId)`.

#### `assessmentFiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `answerId` | uuid FK (cascade delete) | |
| `blobUrl` | text | Vercel Blob URL |
| `filename` | text | Original filename |
| `mimeType` | text | |
| `sizeBytes` | integer | |
| `createdAt` | timestamp | |

### 3.3 Answer value shapes by question type

| Type | Value shape |
|------|------------|
| `yes-no` | `true` or `false` (boolean, stored as jsonb) |
| `text` / `textarea` | `{ "text": "..." }` |
| `single-choice` | `{ "selected": "option-id" }` |
| `multi-choice` | `{ "selected": ["option-id", ...] }` |
| `file-upload` | Handled via `assessmentFiles` table |

---

## 4. Application routes

### 4.1 Public

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/companies` | Public company directory |
| `/companies/[slug]` | Company profile |
| `/certificate/[slug]` | Open Badges certificate verification |
| `/imprint` | Legal imprint |
| `/privacy` | Privacy policy |
| `/terms` | Terms & conditions |
| `/cancellation` | Cancellation policy |
| `/en/...` | English versions of all public pages |

### 4.2 Auth

| Route | Purpose |
|-------|---------|
| `/sign-in` | Login |
| `/sign-up` | Registration |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset confirmation |

### 4.3 Dashboard (authenticated)

| Route | Purpose |
|-------|---------|
| `/dashboard` | Overview / first-run onboarding |
| `/dashboard/onboarding` | Company creation wizard (3 steps) |
| `/dashboard/profile` | Edit company profile + logo |
| `/dashboard/assessment` | Questionnaire wizard + status |
| `/dashboard/badge` | Seal management (all 3 tiers) |
| `/dashboard/billing` | Payment status poller |
| `/dashboard/security` | Account security (password, email) |

### 4.4 Admin (role: `admin`)

| Route | Purpose |
|-------|---------|
| `/admin` | KPI dashboard |
| `/admin/companies` | Company list + search + filter |
| `/admin/companies/[id]` | Company detail + actions |
| `/admin/orders` | Order management |
| `/admin/orders/[id]` | Order detail |
| `/admin/badges` | Badge management |
| `/admin/badges/[id]` | Badge detail + revoke |
| `/admin/users` | User management (role assignment, ban) |
| `/admin/users/[id]` | User detail |
| `/admin/audit` | Audit log viewer |
| `/admin/assessments` | Assessment config management |
| `/admin/assessments/builder/[configId]` | JSONB questionnaire builder |
| `/admin/assessments/submissions` | Submission review queue |
| `/admin/assessments/submissions/[id]` | Submission detail + approve/reject/abort |

### 4.5 API

| Route | Purpose |
|-------|---------|
| `/api/auth/[...all]` | better-auth handler |
| `/api/mollie/webhook` | Mollie payment webhook |
| `/api/orders/latest-status` | Client polling for payment status |
| `/api/openbadges/issuer` | Open Badges issuer endpoint |
| `/api/openbadges/badgeclass` | Open Badges badge class |
| `/api/openbadges/assertion/[id]` | Open Badges assertion (public) |
| `/api/health` | Health check (DB + external services) |
| `/api/payment-status` | Legacy payment status (redirect) |

---

## 5. Service layer

| Service | Responsibility |
|---------|---------------|
| `companyService` | Company CRUD, slug lookup, ownership checks |
| `orderService` | Order creation (`createPaidOrder`), status queries |
| `badgeService` | Badge issuance, revocation, tier-aware queries |
| `mollieWebhookService` | Idempotent webhook processing; creates order + badge on `paid` |
| `assessmentConfigService` | Config CRUD, `getActiveConfigByTier(tier)` |
| `assessmentSubmissionService` | Submission lifecycle; `getApprovedSubmissionByCompanyAndTier` |
| `assessmentAnswerService` | Answer upsert and read |
| `assessmentFileService` | File metadata CRUD |
| `auditService` | `writeAuditEvent(...)` |
| `statsService` | Admin KPI aggregations |

---

## 6. Payment flow

```
Company clicks "Siegel kaufen" (tier)
  → startCheckoutAction(tier)
      → validate: company verified?
      → validate: approved submission for tier exists?
      → validate: no active badge for this tier?
      → createMolliePayment(tier, companyId, companyName)
      → db.update(companies).set({ pendingMolliePaymentId })
      → write audit: checkout_initiated
      → redirect to Mollie checkout URL

User completes payment on Mollie
  → Mollie POST /api/mollie/webhook { id: paymentId }
      → fetch payment from Mollie API
      → if status === "paid":
          → read tier + companyId from payment.metadata
          → createPaidOrder(companyId, molliePaymentId, tier, amount)
          → createBadge(companyId, tier)
          → db.update(companies).set({ pendingMolliePaymentId: null })
          → write audit: payment_confirmed, badge_active
          → send badge-issued email via Brevo

Client polls /api/orders/latest-status
  → if company.pendingMolliePaymentId exists: check Mollie directly
  → returns { status: "pending" | "paid" | "failed" }
  → PaymentPoller redirects to /dashboard/badge?checkout=returned on paid
```

**Deferred order creation:** No DB order row is created until Mollie confirms payment. If the user abandons the checkout, no order record is left behind.

---

## 7. Assessment flow

```
Admin creates assessment config (with tier)
  → sets status: draft
  → Admin publishes → status: active (previous active archived)

Company visits /dashboard/assessment
  → AssessmentWizard renders active config for chosen tier
  → Answers saved progressively (auto-save on change)
  → Company submits → status: submitted

Admin reviews in /admin/assessments/submissions
  → Can: start review (under_review), approve, reject (with notes), abort
  → On approve → status: approved (no badge created yet)

Company visits /dashboard/badge
  → Sees tier card with "Buy Seal" button (if approved + no active badge)
  → Completes payment → badge issued
```

---

## 8. Access control

| Area | Guard |
|------|-------|
| `/dashboard/*` | better-auth session required |
| `/admin/*` | `user.role === "admin"` (server-side check via `requireAdmin()`) |
| All server actions | Ownership or admin check before any mutation |
| Mollie webhook | Payload-based verification (paymentId fetched from Mollie API) |

---

## 9. Internationalisation

- Default locale: **German (`de`)** — no URL prefix
- Second locale: **English (`en`)** — `/en/` prefix
- Translation files: `messages/de.json`, `messages/en.json`
- All user-facing strings use `next-intl` `t()` functions
- i18n key naming convention: underscores only (no dots)

---

## 10. Email

| Trigger | System | Template |
|---------|--------|---------|
| Company email verification | Brevo | Custom |
| Badge issued | Brevo | Custom (includes certificate link + embed code) |
| Payment confirmation | Mollie stock mail | Default |

Mail errors are caught and logged to Sentry but do not block webhook processing.

---

## 11. Monitoring & observability

- **Sentry**: client-side (`instrumentation-client.ts`), server-side (`instrumentation.ts`), edge (`sentry.edge.config.ts`)
- **Health check**: `/api/health` — returns 200/503, checks DB connectivity
- **Audit log**: all significant business events written to `auditEvents` table

---

## 12. GDPR / legal

| Processing | Legal basis | GDPR Article |
|-----------|-------------|--------------|
| Company profile & badge | Contract performance | Art. 6(1)(b) |
| Payment | Contract performance | Art. 6(1)(b) |
| Analytics (GA4) | Consent | Art. 6(1)(a) |
| Error tracking (Sentry) | Legitimate interest | Art. 6(1)(f) |
| Email | Contract performance | Art. 6(1)(b) |

Data processors requiring DPA: Vercel, Neon, Mollie, Brevo, Sentry, Google, Cookiebot.

---

## 13. Launch checklist

- [ ] All legal pages published (imprint, privacy, terms, cancellation)
- [ ] Cookiebot active and cookie categories configured
- [ ] Sentry DSN set for production
- [ ] Mollie production keys configured
- [ ] Brevo transactional email verified
- [ ] Custom domain + SSL on Vercel
- [ ] Database URL points to production Neon project
- [ ] `NEXTAUTH_SECRET` / `BETTER_AUTH_SECRET` set
- [ ] Robots.txt and sitemap.xml generated correctly
- [ ] Health check endpoint responding
- [ ] First admin user promoted via SQL

---

## 14. Development tooling

| Tool | Purpose |
|------|---------|
| `npx tsx scripts/seed.ts` | Seed DB with full lifecycle test data |
| `npx drizzle-kit push` | Apply schema changes to DB |
| `npx drizzle-kit generate` | Generate migration file |
| `npx tsc --noEmit --skipLibCheck` | Type check |
| `npm run dev` | Start dev server (Turbopack, port 3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

**Seed credentials (local only):**

| Role | Email | Password |
|------|-------|---------|
| Admin | `admin@seniorenfreundlich.org` | `Password1!` |
| Company owner (Acme GmbH, basic badge) | `lena@acme.de` | `Password1!` |
| Company owner (Baumgarten Pflege, standard under review) | `thomas@baumgarten.de` | `Password1!` |
| Company owner (Senioren Treff, unverified, draft) | `petra@seniorentreff.de` | `Password1!` |
| Company owner (Alt und Jung KG, no assessment) | `klaus@altundjung.de` | `Password1!` |
