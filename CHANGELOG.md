# Changelog — seniorenfreundlich.de

All notable changes to this project, grouped by release version.
Versioning follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`):
- `MAJOR` — breaking architecture changes or full milestone completions
- `MINOR` — new features added in a backward-compatible manner  
- `PATCH` — bug fixes, small improvements, refactors

---

## [Unreleased] — feature/questionaire-builder

_Changes on the `feature/questionaire-builder` branch not yet merged to `development`._

### Added
- `scripts/seed.ts` — idempotent dev seed script populating full lifecycle data (5 users, 3 configs, 4 companies, 4 submissions, 1 order, 1 badge, 5 audit events)
- `src/components/ui/select.tsx` — manual shadcn-style Select dropdown component (Radix UI)

### Changed
- All files below were part of Phase 3 (assessment questionnaire) and Phase 4 (seed) implementation described in v0.5.0

---

## [0.5.0] — 2026-04-18 · Phase 3+4: Tiered Seals & Deferred Orders

### Phase 3 — Finding #6: Deferred order creation

**Problem:** clicking "Siegel kaufen" immediately created a `pending` DB order, even if the user abandoned the Mollie checkout page.

**Solution:** orders are now only created after Mollie confirms payment via webhook.

#### Added
- `pendingMolliePaymentId` column on `companies` table — stores the in-flight Mollie payment ID
- `createPaidOrder()` in `orderService` — inserts an order directly as `paid` (bypasses `pending` state)

#### Changed
- `startCheckoutAction` — no longer creates a DB order; stores `pendingMolliePaymentId` on company instead
- `mollieWebhookService.processMollieWebhook` — reads `tier` + `companyId` from Mollie `payment.metadata`; calls `createPaidOrder` on `paid` status; clears `pendingMolliePaymentId`
- `/api/orders/latest-status` — first checks `company.pendingMolliePaymentId` and polls Mollie directly; falls back to DB order lookup for legacy flow

---

### Phase 3 — Finding #7: S/M/L Seal tiers (Basic / Standard / Premium)

**Problem:** only one undifferentiated seal existed; no connection between assessment tier and seal tier.

**Solution:** three independent tiers, each with its own assessment config, submission, badge, and pricing.

#### Added
- `tier` enum (`basic` | `standard` | `premium`) on `assessmentConfigs`, `badges`, `orders`
- `TIER_CONFIG` in `createPayment.ts` — maps tier to price (€49 / €99 / €149) and Mollie description
- `getActiveConfigByTier(tier)` in `assessmentConfigService`
- `getApprovedSubmissionByCompanyAndTier(companyId, tier)` in `assessmentSubmissionService`
- `getActiveBadgeForCompany(companyId, tier?)` — tier parameter now optional
- `getBadgesForCompany(companyId)` — returns all badges for a company (all tiers)
- Tier picker dialog in `CreateConfigButton` (admin) — admin selects Basic/Standard/Premium before creating a config
- Badge page (`/dashboard/badge`) — redesigned as 3-tier card grid; each card independently gated

#### Changed
- `createConfig(title, createdBy, tier)` — accepts tier argument
- `createBadge(companyId, tier)` — accepts tier argument
- `createMolliePayment` — accepts `tier`, uses tier-specific amount and description
- `startCheckoutAction(tier)` — first parameter is now `tier`
- `approveSubmissionAction` — **removed** auto-badge creation on approval (badge only created after payment)
- Unique index on `assessmentConfigs` changed from `(status = active)` to `(tier, status = active)` — one active config per tier

#### i18n
- Added `dashboard.billing.tier_basic`, `tier_standard`, `tier_premium`, `noConfigForTier` (de + en)
- Added `admin.assessments.tierLabel`, `tierBasic`, `tierStandard`, `tierPremium`, `create`, `cancel` (de + en)

#### Schema migrations (applied via `drizzle-kit push`)
- `CREATE TYPE tier AS ENUM('basic','standard','premium')`
- `ALTER TABLE assessment_configs ADD COLUMN tier tier NOT NULL DEFAULT 'basic'`
- `ALTER TABLE badges ADD COLUMN tier tier NOT NULL DEFAULT 'basic'`
- `ALTER TABLE orders ADD COLUMN tier tier NOT NULL DEFAULT 'basic'`
- Added `assessment_configs_active_tier_idx` (unique partial index per tier)

---

## [0.4.0] — 2026-04-07 · Phase 1+2: Assessment Questionnaire UX

_Implemented as part of the questionnaire findings review._

### Phase 1 — Finding #1: Abort review

**Problem:** once an admin started reviewing a submission there was no way to abort; only approve or reject were available.

#### Added
- `abortReview(submissionId)` in `assessmentSubmissionService` — sets status back to `submitted`
- `abortReviewAction` server action
- Abort button in `/admin/assessments/submissions/[id]` — visible when `status = under_review`

---

### Phase 1 — Finding #2: Multi-choice label display

**Problem:** admin submission view showed raw JSON (`{ selected: ["option-2"] }`) instead of the human-readable option label.

#### Changed
- `SubmissionActions` and submission detail components — resolve `questionId` → config option → label before rendering answer values

---

### Phase 1 — Finding #5: Customer read-only view post-submission

**Problem:** after submitting an assessment, the customer only saw "in review" with no way to review their answers.

#### Added
- `AssessmentStatus` component — renders a read-only view of all answers with resolved labels (mirrors the admin view)
- Read-only state in `AssessmentWizard` — activated when `submission.status !== "draft"`

---

### Phase 1 — Findings #8+9: Mobile admin sidebar

**Problem:** admin panel sidebar disappeared on small screens; no mobile navigation.

#### Added
- Sheet-based mobile sidebar in `/admin/layout.tsx` using `@/src/components/ui/sheet`
- Hamburger menu button visible on mobile; sheet closes on navigation

---

### Phase 2 — Finding #3: Gate seal purchase behind approved assessment

**Problem:** companies could purchase a seal without ever completing an assessment.

#### Changed
- `/dashboard/badge` (formerly `/dashboard/billing`) — shows purchase button only when an approved submission exists for the tier
- `startCheckoutAction` — validates approved submission before creating Mollie payment
- Gate messages shown for: no active config, no submission started, submission not approved, badge already active

---

## [0.3.0] — 2026-04-05 · Admin Panel

_Branch: `feature/admin-panel` (merged to `development` via PR #11)_

### Added
- Full admin panel under `/admin` with locale-prefixed routing
- **Dashboard** (`/admin`) — KPI cards (companies, badges, revenue, orders) + recent audit events
- **Companies** (`/admin/companies`) — paginated list with search, verification filter, badge filter; detail view with badge/order/audit history; verify/unverify/delete actions
- **Orders** (`/admin/orders`) — list with status filter; detail view; manual refund/mark-paid actions
- **Badges** (`/admin/badges`) — list with status filter; detail view; revoke action
- **Users** (`/admin/users`) — list; detail view; role assignment (`setRole`), ban/unban
- **Audit log** (`/admin/audit`) — full paginated audit trail with entity type + action filters
- **Assessments** (`/admin/assessments`) — config list with status; questionnaire JSONB builder; submission review queue; submission detail with approve/reject
- `requireAdmin()` helper in `src/auth/isAdmin.ts`
- `statsService` — KPI aggregation queries
- Admin server actions: `adminCompanyActions`, `adminOrderActions`, `adminBadgeActions`, `adminUserActions`, `adminAssessmentActions`
- Pagination enhancement + additional translation keys

### Changed
- Admin panel sidebar improved for pagination and i18n support

---

## [0.2.0] — 2026-03-28 · Core Platform & Onboarding

_Multiple commits building the main application._

### Added
- **Auth migration**: Clerk → better-auth (full replacement)
  - `src/lib/auth.ts` — better-auth server config with email/password + admin plugin
  - `src/lib/auth-client.ts` — client-side auth helper
  - `src/auth/getCurrentUser.ts`, `getCurrentCompany.ts`
- **Company onboarding** — 3-step wizard (company name, details, email verification)
  - `actions/createCompany.ts`, `actions/sendVerificationEmail.ts`, `actions/verifyCompanyEmail.ts`
  - `/dashboard/onboarding` pages + stepper component
- **Profile management** — edit company details, upload logo to Vercel Blob
  - `actions/updateCompanyProfile.ts`, `actions/uploadLogo.ts`
  - `/dashboard/profile` with `ProfileForm` and `LogoUpload`
- **Mollie payment flow** — Hosted Checkout + webhook
  - `src/mollie/createPayment.ts`, `src/mollie/mollie.ts`
  - `src/services/mollieWebhookService.ts`
  - `/api/mollie/webhook` route
  - `/dashboard/billing` with `PaymentPoller` (client-side polling)
- **Badge lifecycle** — issuance, revocation, certificate page
  - `src/services/badgeService.ts`
  - `/dashboard/badge` + `RevokeBadgeForm`
  - `/certificate/[slug]` — public verification page
- **Open Badges API** — `/api/openbadges/issuer`, `/badgeclass`, `/assertion/[id]`
- **Public directory** — `/companies` list, `/companies/[slug]` profile page
- **Security page** — `/dashboard/security` — password + email management
- **Dashboard navigation** — `DashboardNav`, `UserNav`, `VerificationBanner`
- **Assessment questionnaire system**
  - Schema: `assessmentConfigs`, `assessmentSubmissions`, `assessmentAnswers`, `assessmentFiles`
  - `assessmentConfigService`, `assessmentSubmissionService`, `assessmentAnswerService`, `assessmentFileService`
  - `/dashboard/assessment` wizard + status page
  - `actions/assessmentActions.ts` — save draft, submit, file upload
- **Domain update**: `seniorenfreundlich.de` → `seniorenfreundlich.org`

### Schema migrations
- `0000_stale_wiccan` — initial schema: `companies`, `orders`, `badges`, `auditEvents`, enums
- `0001_brown_roland_deschain` — better-auth tables: `user`, `account`, `session`, `verification`
- `0002_overjoyed_the_watchers` — company verification fields (HRB, verificationStatus, token, attempts)
- `0003_wooden_bill_hollister` — better-auth admin plugin: `role`, `banned`, `banReason`, `banExpires`, `impersonatedBy`
- `0004_abandoned_richard_fisk` — assessment tables: `assessmentConfigs`, `assessmentSubmissions`, `assessmentAnswers`, `assessmentFiles`; tier enum; `pendingMolliePaymentId` on companies

---

## [0.1.0] — 2026-03-10 · Foundation

_Commit: `1cf94d5 feat: complete Phase 1 foundation`_

### Added
- Next.js 15 project with TypeScript, Tailwind CSS, App Router
- `src/env.ts` — Zod-based typed environment variable validation
- Drizzle ORM + Neon Postgres connection (`src/db/db.ts`)
- next-intl routing (`src/i18n/routing.ts`, `navigation.ts`, `request.ts`)
- Sentry integration: client, server, edge configs
- `instrumentation.ts`, `instrumentation-client.ts`
- `next.config.ts` with Sentry + next-intl plugin
- `src/proxy.ts` — Vercel Blob proxy
- `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`
- Initial `messages/de.json` + `messages/en.json`
- README

---

## [0.0.1] — 2026-03-05 · Project initialisation

_Commit: `7c569c8 feat: initialize seniorenfreundlich project`_

### Added
- Next.js scaffold with TypeScript and Tailwind CSS
- `.devcontainer` configuration (Linux + Windows variants)
- Initial planning documents (`pdd.md`, `plan.md`, backups)
