# Seniorenfreundlich.de - Improved Project Roadmap

**Version:** 2.0  
**Date:** 2026-03-05  
**Project:** MVP v1.0 - Public Directory with Digital Certification  
**Status:** `[PLANNED]`

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Project Phases](#project-phases)
   - Phase 1: Foundation
   - Phase 2: Core Platform
   - Phase 3: Commerce
   - Phase 4: Public Features
   - Phase 5: Launch Preparation
4. [Dependency Graph](#dependency-graph)
5. [Critical Path Analysis](#critical-path-analysis)
6. [Quality Gates](#quality-gates)
7. [Resource Requirements](#resource-requirements)
8. [Risk Register](#risk-register)
9. [Appendix: Comparison with Original Plan](#appendix-comparison-with-original-plan)

---

## Executive Summary

### Improvements Over Original Plan

This roadmap restructures the original 14 EPICs into **5 logical phases** with significant enhancements:

| Improvement | Original Plan | Improved Roadmap |
|-------------|---------------|------------------|
| **Phasing** | 14 disconnected EPICs | 5 cohesive phases with clear objectives |
| **Testing/QA** | ❌ Missing | ✅ Dedicated QA phase with test automation |
| **Deployment Strategy** | ❌ Not defined | ✅ Staging → Production pipeline |
| **Dependencies** | ❌ Implicit | ✅ Explicit → notation throughout |
| **Risk Management** | ❌ None | 🟡 Full risk register with mitigation |
| **Effort Estimation** | ❌ None | 📊 Fibonacci story points on all tasks |
| **Quality Gates** | ❌ None | ✅ Checkpoint criteria between phases |
| **Rollback Plans** | ❌ None | ✅ Contingency procedures defined |
| **Post-Launch Monitoring** | ❌ None | ✅ Sentry + GA4 + Health checks |

**Key Changes:**
- Consolidated i18n into Phase 2 (Core Platform) instead of standalone EPIC
- Merged related authentication and authorization tasks
- Added comprehensive testing layer (unit, integration, E2E)
- Included infrastructure and CI/CD setup
- Added legal compliance checkpoints

---

## Project Overview

### Business Context

**Product:** seniorenfreundlich.de  
**MVP Goal:** Public directory where businesses purchase a "Seniorenfreundlich-Siegel" (€99 digital seal)  
**Target Users:** German businesses serving senior citizens

### Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Database | Neon Postgres |
| ORM | Drizzle |
| Auth | Clerk |
| Payments | Mollie (Hosted Checkout + Webhooks) |
| Email | Brevo (+ Mollie Stock-Mails für Zahlungsbestätigungen) |
| Storage | Vercel Blob |
| Hosting | Vercel |
| Monitoring | Sentry + Google Analytics 4 |
| i18n | next-intl (DE default, /en prefix) |
| UI | Shadcn/ui |
| Testing | Vitest (Unit/Integration), Playwright (E2E) |

### Timeline Overview

```
Week:  1    2    3    4    5    6    7    8    9    10   11   12
       |----|----|----|----|----|----|----|----|----|----|----|
Phase: [====1====]
            [=======2=======]
                    [=======3=======]
                            [=======4=======]
                                    [=======5=======]
                                          [LAUNCH]

Legend:
[====] Development Phase
[LAUNCH] Production Release
```

---

## Project Phases

---

### Phase 1: Foundation
**Status:** `[PLANNED]`  
**Duration:** Weeks 1-2  
**Total Story Points:** 21

#### Phase Objectives
- Establish development environment and quality baseline
- Configure database infrastructure with proper migrations
- Implement core authentication flow
- Set up CI/CD pipeline for staging environment

#### Key Milestones

| Milestone | Target | Deliverable | Status |
|-----------|--------|-------------|--------|
| M1.1 | Week 1, Day 3 | Project initialized with all dependencies | `[PLANNED]` |
| M1.2 | Week 1, Day 5 | Database schema defined and migrations working | `[PLANNED]` |
| M1.3 | Week 1, Day 7 | Authentication flow functional | `[PLANNED]` |
| M1.4 | Week 2, Day 5 | Staging environment deployed | `[PLANNED]` |
| M1.5 | Week 2, Day 7 | Foundation Phase Complete | `[PLANNED]` |

#### Detailed Tasks

##### 1.1 Repository Setup & Quality Baseline `→ M1.1`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Initialize Next.js App Router project with TypeScript
- [ ] Install dependencies: Drizzle, Neon, Clerk, Mollie, Brevo, Vercel Blob, Sentry, next-intl, Shadcn/ui
- [ ] Configure ESLint, Prettier, TypeScript strict mode
- [ ] Create folder structure (`app/`, `src/`, `db/`, `services/`)
- [ ] Create `.env.example` with all required environment variables
- [ ] Set up pre-commit hooks (Husky + lint-staged)

**Definition of Done:**
- [ ] `npm run build` succeeds without errors
- [ ] `npm run lint` passes
- [ ] All dependencies installed and documented

**Deliverables:**
- [ ] Repository structure established
- [ ] `package.json` with all dependencies
- [ ] `.env.example` with placeholder values
- [ ] README.md with setup instructions

---

##### 1.2 Environment Configuration `→ M1.1`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Create typed environment validator using Zod
- [ ] Implement fail-fast validation at startup
- [ ] Separate configs for development, staging, production

**Definition of Done:**
- [ ] App fails immediately with clear error if required env vars missing
- [ ] Type-safe env object exported for use throughout app
- [ ] Staging and production env vars documented

**Dependencies:** `1.1 Repository Setup`

**Deliverables:**
- [ ] `src/env.ts` with Zod schema
- [ ] Environment documentation

---

##### 1.3 Database Configuration & Drizzle Setup `→ M1.2`
**Story Points:** 5 | **Risk:** 🟡 Medium

- [ ] Configure Drizzle with Neon Postgres connection
- [ ] Set up migration scripts (`db:generate`, `db:migrate`)
- [ ] Create database connection pool configuration
- [ ] Configure connection string security

**Definition of Done:**
- [ ] Migrations can be generated and run successfully
- [ ] Local development connects to Neon database
- [ ] Connection pooling optimized for serverless

**Dependencies:** `1.2 Environment Configuration`

**Deliverables:**
- [ ] `drizzle.config.ts`
- [ ] `src/db/db.ts` connection module
- [ ] Migration scripts in `package.json`

---

##### 1.4 Database Schema Design `→ M1.2`
**Story Points:** 5 | **Risk:** 🟡 Medium

- [ ] Define `companies` table (id, slug, name, ownerClerkUserId, contact info, timestamps)
- [ ] Define `orders` table (id, companyId, molliePaymentId, mollieOrderId, status, amount, currency, timestamps)
- [ ] Define `badges` table (id, companyId, assertionId, status, issuedAt, revokedAt)
- [ ] Define `audit_events` table (id, entityType, entityId, action, actorId, metadata, createdAt)
- [ ] Create indexes: slug (unique), ownerClerkUserId, companyId, assertionId
- [ ] Generate initial migration

**Definition of Done:**
- [ ] Schema compiles without errors
- [ ] All indexes created for query performance
- [ ] Foreign key constraints defined
- [ ] Migration file generated and tested

**Dependencies:** `1.3 Database Configuration`

**Deliverables:**
- [ ] `src/db/schema.ts` with all tables
- [ ] Initial migration file
- [ ] Schema documentation

---

##### 1.5 Authentication Core (Clerk) `→ M1.3`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Integrate Clerk with Next.js App Router
- [ ] Configure middleware for route protection
- [ ] Create sign-in/up pages
- [ ] Add user button component
- [ ] Set up protected `/dashboard` route layout

**Definition of Done:**
- [ ] Unauthenticated users redirected from protected routes
- [ ] Sign in/out flow works end-to-end
- [ ] User session persists correctly

**Dependencies:** `1.2 Environment Configuration`

**Deliverables:**
- [ ] `middleware.ts` with route protection
- [ ] `app/sign-in/[[...sign-in]]/page.tsx`
- [ ] `app/sign-up/[[...sign-up]]/page.tsx`
- [ ] `app/dashboard/layout.tsx` (protected)

---

#### Phase 1 Risk Factors & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Clerk account setup delays | Medium | Low | Create account early; use dev keys for initial dev |
| Neon connection issues | Low | Medium | Test connection early; have fallback local Postgres |
| Environment variable misconfiguration | Medium | Medium | Use Zod validation; document all required vars |

#### Phase 1 Rollback/Contingency
- **If Clerk fails:** Can temporarily use NextAuth.js as fallback (adds 3 days)
- **If Neon unavailable:** Use Supabase Postgres (schema compatible)

---

### Phase 2: Core Platform
**Status:** `[PLANNED]`  
**Duration:** Weeks 3-4  
**Total Story Points:** 34

#### Phase Objectives
- Implement internationalization (DE default, EN /en prefix)
- Build company profile management system
- Create repository/service layer for data operations
- Establish company ownership model

#### Key Milestones

| Milestone | Target | Deliverable | Status |
|-----------|--------|-------------|--------|
| M2.1 | Week 3, Day 3 | i18n working in both languages | `[PLANNED]` |
| M2.2 | Week 3, Day 7 | Company onboarding flow complete | `[PLANNED]` |
| M2.3 | Week 4, Day 5 | Profile management functional | `[PLANNED]` |
| M2.4 | Week 4, Day 7 | Core Platform Phase Complete | `[PLANNED]` |

#### Detailed Tasks

##### 2.1 Internationalization Setup `→ M2.1`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Configure next-intl for App Router
- [ ] Set up German as default (no prefix) and English under `/en`
- [ ] Create message files: `messages/de.json`, `messages/en.json`
- [ ] Implement locale detection and switching
- [ ] Add language toggle to UI

**Definition of Done:**
- [ ] German routes work without prefix (`/unternehmen`)
- [ ] English routes work with prefix (`/en/companies`)
- [ ] Language switcher updates URL correctly
- [ ] Content displays in correct language

**Dependencies:** `1.1 Repository Setup`

**Deliverables:**
- [ ] `messages/de.json` with German translations
- [ ] `messages/en.json` with English translations
- [ ] `src/i18n/routing.ts`
- [ ] `middleware.ts` updated for i18n

---

##### 2.2 Hreflang & SEO Basics `→ M2.1`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Add hreflang alternate links between DE and EN variants
- [ ] Implement metadata generation for pages
- [ ] Create translated title/description patterns

**Definition of Done:**
- [ ] `<link rel="alternate" hreflang="de" ...>` present on all pages
- [ ] `<link rel="alternate" hreflang="en" ...>` present on all pages
- [ ] Metadata properly translated per locale

**Dependencies:** `2.1 Internationalization Setup`

**Deliverables:**
- [ ] SEO metadata utilities
- [ ] Hreflang link generation

---

##### 2.3 Repository Layer `→ M2.2`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Create `companyService.ts` (create, update, find, delete)
- [ ] Create `orderService.ts` (create, update status, find)
- [ ] Create `badgeService.ts` (create, revoke, find)
- [ ] Create `auditService.ts` (log events, query)
- [ ] Add proper typing for all service functions

**Definition of Done:**
- [ ] No raw SQL in page components
- [ ] All functions fully typed
- [ ] Error handling implemented
- [ ] Unit tests for core functions

**Dependencies:** `1.4 Database Schema Design`

**Deliverables:**
- [ ] `src/services/companyService.ts`
- [ ] `src/services/orderService.ts`
- [ ] `src/services/badgeService.ts`
- [ ] `src/services/auditService.ts`

---

##### 2.4 Company Ownership Model `→ M2.2`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Implement "one company per user" constraint for MVP
- [ ] Create `getCurrentUser()` helper
- [ ] Create `getCurrentCompany()` helper
- [ ] Link company to Clerk userId

**Definition of Done:**
- [ ] User can create exactly one company
- [ ] Helpers return typed company data
- [ ] Ownership verified on all company operations

**Dependencies:** `1.5 Authentication Core`, `2.3 Repository Layer`

**Deliverables:**
- [ ] `src/auth/getCurrentUser.ts`
- [ ] `src/auth/getCurrentCompany.ts`
- [ ] Ownership validation utilities

---

##### 2.5 Company Onboarding Flow `→ M2.2`
**Story Points:** 5 | **Risk:** 🟡 Medium

- [ ] Build `/dashboard` with onboarding detection
- [ ] Create company creation form (name, slug)
- [ ] Implement slug uniqueness validation
- [ ] Auto-redirect to profile edit after creation

**Definition of Done:**
- [ ] New users see onboarding form
- [ ] Slug validation prevents duplicates
- [ ] Redirect works correctly
- [ ] Audit event logged on creation

**Dependencies:** `2.4 Company Ownership Model`

**Deliverables:**
- [ ] `app/dashboard/page.tsx`
- [ ] `app/dashboard/onboarding/page.tsx`
- [ ] `src/validators/company.ts`

---

##### 2.6 Profile Edit Page `→ M2.3`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Create `/dashboard/profile` page
- [ ] Build form for company fields (description, website, phone, email, address, city, postalCode)
- [ ] Implement Server Action for saving
- [ ] Add client-side validation with error display
- [ ] Log audit event on save

**Definition of Done:**
- [ ] Form saves data to database
- [ ] Validation errors shown clearly
- [ ] Success feedback provided
- [ ] Changes reflect immediately in UI

**Dependencies:** `2.5 Company Onboarding Flow`

**Deliverables:**
- [ ] `app/dashboard/profile/page.tsx`
- [ ] `src/actions/updateCompanyProfile.ts`

---

##### 2.7 Logo Upload (Vercel Blob) `→ M2.3`
**Story Points:** 5 | **Risk:** 🟡 Medium

- [ ] Configure Vercel Blob client
- [ ] Create secure upload Server Action
- [ ] Add image validation (type, size)
- [ ] Store logoUrl in database
- [ ] Display logo on profile pages
- [ ] Handle upload errors gracefully

**Definition of Done:**
- [ ] Upload works end-to-end
- [ ] Only company owner can upload
- [ ] Invalid files rejected
- [ ] Logo displays correctly

**Dependencies:** `2.6 Profile Edit Page`, `1.2 Environment Configuration`

**Deliverables:**
- [ ] `src/actions/uploadLogo.ts`
- [ ] Logo upload UI component
- [ ] Image validation utilities

---

##### 2.8 Basic UI Shell `→ M2.4`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Create main layout with header
- [ ] Add navigation: Home, Directory, Dashboard
- [ ] Implement footer with legal links
- [ ] Add responsive mobile menu
- [ ] Style with Shadcn/ui components

**Definition of Done:**
- [ ] Layout renders on all screen sizes
- [ ] Navigation works correctly
- [ ] Mobile menu functional
- [ ] Consistent styling throughout

**Deliverables:**
- [ ] `app/layout.tsx` (updated)
- [ ] Navigation components
- [ ] Footer component

---

#### Phase 2 Risk Factors & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Slug collision handling | Medium | Low | Implement atomic check-and-create; suggest alternatives |
| Image upload size limits | Medium | Low | Client-side validation; clear error messages |
| Translation completeness | Medium | Low | Use translation keys; fall back to German |

---

### Phase 3: Commerce
**Status:** `[PLANNED]`  
**Duration:** Weeks 5-6  
**Total Story Points:** 29

#### Phase Objectives
- Implement Mollie Checkout integration
- Build payment flow in dashboard
- Create secure webhook handling
- Automate badge issuance on payment success

#### Key Milestones

| Milestone | Target | Deliverable | Status |
|-----------|--------|-------------|--------|
| M3.1 | Week 5, Day 3 | Mollie integration configured | `[PLANNED]` |
| M3.2 | Week 5, Day 5 | Checkout flow functional | `[PLANNED]` |
| M3.3 | Week 5, Day 7 | Webhook endpoint handling events | `[PLANNED]` |
| M3.4 | Week 6, Day 3 | Automated badge issuance working | `[PLANNED]` |
| M3.5 | Week 6, Day 5 | Post-payment emails sending | `[PLANNED]` |
| M3.6 | Week 6, Day 7 | Commerce Phase Complete | `[PLANNED]` |

#### Detailed Tasks

##### 3.1 Mollie Configuration `→ M3.1`
**Story Points:** 3 | **Risk:** 🟡 Medium

- [ ] Configure Mollie client SDK with environment variables
- [ ] Create product/payment description constants
- [ ] Store API key in environment config
- [ ] Set up webhook URL configuration

**Definition of Done:**
- [ ] Mollie client initializes correctly
- [ ] API key configurable via env var
- [ ] Test mode working

**Dependencies:** `1.2 Environment Configuration`

**Deliverables:**
- [ ] `src/mollie/mollie.ts`
- [ ] Mollie configuration documentation

---

##### 3.2 Payment Creation `→ M3.2`
**Story Points:** 5 | **Risk:** 🟡 Medium

- [ ] Create helper for Mollie payment creation
- [ ] Define redirect URL (success page) and webhook URL
- [ ] Store company ID in payment metadata
- [ ] Create pending order before redirect

**Definition of Done:**
- [ ] Payment creates successfully
- [ ] User redirected to Mollie hosted payment page
- [ ] Order created with pending status
- [ ] Metadata contains company reference

**Dependencies:** `3.1 Mollie Configuration`, `2.3 Repository Layer`

**Deliverables:**
- [ ] `src/mollie/createPayment.ts`
- [ ] Order creation on checkout start

---

##### 3.3 Dashboard Billing Page `→ M3.2`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Create `/dashboard/billing` page
- [ ] Add "Siegel kaufen (99€)" button
- [ ] Block purchase if active badge exists
- [ ] Show current badge status
- [ ] Integrate checkout flow

**Definition of Done:**
- [ ] Button redirects to Mollie payment page
- [ ] Block message shown when badge active
- [ ] Current status clearly displayed
- [ ] Flow works end-to-end

**Dependencies:** `3.2 Payment Creation`

**Deliverables:**
- [ ] `app/dashboard/billing/page.tsx`
- [ ] `src/actions/startCheckout.ts`

---

##### 3.4 Webhook Endpoint `→ M3.3`
**Story Points:** 5 | **Risk:** 🔴 High

- [ ] Create `/api/mollie/webhook` route handler
- [ ] Receive paymentId from Mollie webhook
- [ ] Verify payment status via Mollie API (no signature needed)
- [ ] Handle paid status
- [ ] Make handler idempotent (ignore processed payments)
- [ ] Add comprehensive logging

**Definition of Done:**
- [ ] Payment status verified via Mollie API
- [ ] Duplicate events handled gracefully
- [ ] All events logged
- [ ] Returns proper 200 responses

**Dependencies:** `3.1 Mollie Configuration`

**Deliverables:**
- [ ] `app/api/mollie/webhook/route.ts`
- [ ] Webhook verification utilities

---

##### 3.5 Badge Issuance Transaction `→ M3.4`
**Story Points:** 5 | **Risk:** 🔴 High

- [ ] Create service to handle payment success
- [ ] Mark order as paid
- [ ] Create Badge with assertionId (UUID)
- [ ] Set status active and issuedAt timestamp
- [ ] Use database transaction (all-or-nothing)

**Definition of Done:**
- [ ] Order status updates to paid
- [ ] Badge created with correct data
- [ ] Transaction ensures consistency
- [ ] Certificate page resolves correctly

**Dependencies:** `3.4 Webhook Endpoint`, `2.3 Repository Layer`

**Deliverables:**
- [ ] `src/services/mollieWebhookService.ts`
- [ ] Badge issuance logic

---

##### 3.6 Post-Payment Email `→ M3.5`
**Story Points:** 3 | **Risk:** 🟡 Medium

- [ ] Configure Brevo API client
- [ ] Create badge issued email template
- [ ] Send email to company contact (or owner fallback)
- [ ] Include certificate link and embed instructions
- [ ] Handle email failures gracefully
- [ ] Note: Mollie handles payment confirmation emails. If Mollie does not support stock emails, implement payment confirmation via Brevo.

**Definition of Done:**
- [ ] Badge activation email sends after badge issuance
- [ ] Template includes all required info
- [ ] Failures logged to Sentry (don't fail webhook)
- [ ] Delivery status tracked

**Dependencies:** `3.5 Badge Issuance Transaction`, `1.2 Environment Configuration`

**Deliverables:**
- [ ] `src/email/brevo.ts`
- [ ] `src/email/templates/badgeIssued.ts`

---

##### 3.7 Order History `→ M3.6`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Display order history on billing page
- [ ] Show order status, date, amount
- [ ] Link to receipt if available

**Definition of Done:**
- [ ] Orders displayed chronologically
- [ ] Status clearly indicated
- [ ] Receipt links work

**Dependencies:** `3.3 Dashboard Billing Page`

**Deliverables:**
- [ ] Order history component
- [ ] Receipt integration

---

#### Phase 3 Risk Factors & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Webhook delivery failures | Medium | 🔴 High | Implement retry logic; monitor with Sentry |
| Idempotency issues | Medium | 🔴 High | Store processed payment IDs; verify before processing |
| Mollie account verification delays | Medium | Medium | Start verification early; use test mode |
| Payment fraud | Low | Medium | Use Mollie fraud prevention; monitor for suspicious patterns |

#### Phase 3 Rollback/Contingency
- **If Mollie webhooks fail:** Can manually issue badges via admin panel
- **If email fails:** Badge still issued; retry email later via cron job
- **If payment dispute:** Automated badge revocation process

**Definition of Done:**
- [ ] Revocation requires confirmation
- [ ] Badge status updates in database
- [ ] Certificate page reflects revoked status
- [ ] Company removed from public directory listing
- [ ] Audit event created

**Dependencies:** `3.4 Certificate Page`, `2.7 Logo Upload`

**Deliverables:**
- [ ] `src/actions/revokeBadge.ts`
- [ ] Revocation UI in dashboard

---

#### Phase 3 Risk Factors & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SEO performance on dynamic pages | Medium | Medium | Use Next.js generateStaticParams where possible |
| OpenBadges spec compliance | Low | Medium | Validate against OpenBadges validator |
| Certificate verification trust | Low | High | Clear verification instructions; transparent status |

---

### Phase 4: Public Features
**Status:** `[PLANNED]`  
**Duration:** Weeks 7-8  
**Total Story Points:** 34

#### Phase Objectives
- Build public directory with search and filtering
- Create SEO-optimized company profile pages
- Implement certificate pages with verification
- Build badge embed functionality
- Implement OpenBadges API

#### Key Milestones

| Milestone | Target | Deliverable | Status |
|-----------|--------|-------------|--------|
| M4.1 | Week 7, Day 3 | Directory listing page live | `[PLANNED]` |
| M4.2 | Week 7, Day 7 | Company profile pages functional | `[PLANNED]` |
| M4.3 | Week 8, Day 3 | Certificate pages with verification | `[PLANNED]` |
| M4.4 | Week 8, Day 5 | Badge embed functionality complete | `[PLANNED]` |
| M4.5 | Week 8, Day 7 | Public Features Phase Complete | `[PLANNED]` |

#### Detailed Tasks

##### 4.1 Public Directory Page `→ M4.1`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Build `/unternehmen` listing page
- [ ] Display only companies with active badges
- [ ] Implement search by name and city
- [ ] Add pagination support
- [ ] Create SEO metadata generation

**Definition of Done:**
- [ ] List renders correctly with company data
- [ ] Search filters results properly
- [ ] Pagination works with query params (`?page=2`)
- [ ] SEO metadata present

**Dependencies:** `2.3 Repository Layer`, `3.5 Badge Issuance` (badges must exist)

**Deliverables:**
- [ ] `app/unternehmen/page.tsx`
- [ ] `src/services/publicDirectoryService.ts`
- [ ] Search and pagination components

---

##### 4.2 Company Profile Pages `→ M4.2`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Build `/unternehmen/[slug]` page
- [ ] Display company data and logo
- [ ] Show badge status (active/revoked)
- [ ] Link to certificate page if active
- [ ] Generate SEO meta from company data

**Definition of Done:**
- [ ] 404 page shown if company not found
- [ ] Badge status clearly indicated
- [ ] All company data displays correctly
- [ ] SEO metadata generated dynamically

**Dependencies:** `4.1 Public Directory Page`

**Deliverables:**
- [ ] `app/unternehmen/[slug]/page.tsx`
- [ ] Company profile components

---

##### 4.3 English Directory Pages `→ M4.2`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Implement `/en/companies` mirroring German page
- [ ] Implement `/en/companies/[slug]` mirroring German page
- [ ] Add hreflang links between variants
- [ ] Translate all UI labels

**Definition of Done:**
- [ ] English pages have feature parity with German
- [ ] Hreflang links connect DE/EN variants
- [ ] All content properly translated

**Dependencies:** `4.1 Public Directory`, `4.2 Company Profiles`, `2.1 Internationalization`

**Deliverables:**
- [ ] `app/en/companies/page.tsx`
- [ ] `app/en/companies/[slug]/page.tsx`

---

##### 4.4 Certificate Page (German) `→ M4.3`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Build `/zertifikat/[slug]` page
- [ ] Display company name and certificate ID
- [ ] Show issued date and status
- [ ] Display revocation date if revoked
- [ ] Add verification explanation
- [ ] Link to OpenBadges assertion JSON

**Definition of Done:**
- [ ] Public page renders without authentication
- [ ] Status clearly visible (active/revoked)
- [ ] All certificate data displays correctly
- [ ] OpenBadges link functional

**Dependencies:** `2.3 Repository Layer`, `3.5 Badge Issuance`

**Deliverables:**
- [ ] `app/zertifikat/[slug]/page.tsx`
- [ ] Certificate display components

---

##### 4.5 Certificate Page (English) `→ M4.3`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Build `/en/certificate/[slug]` page
- [ ] Mirror German certificate functionality
- [ ] Translate all labels
- [ ] Add hreflang links

**Definition of Done:**
- [ ] English version matches German feature set
- [ ] Content properly translated
- [ ] Hreflang links present

**Dependencies:** `4.4 Certificate Page (German)`

**Deliverables:**
- [ ] `app/en/certificate/[slug]/page.tsx`

---

##### 4.6 Badge Embed Generator `→ M4.4`
**Story Points:** 5 | **Risk:** 🟡 Medium

- [ ] Create `/dashboard/badge` page
- [ ] Build embed code generator
- [ ] Include `<a>` + `<img>` HTML snippet
- [ ] Use stable badge image URL
- [ ] Add copy-to-clipboard functionality
- [ ] Preview embed visually

**Definition of Done:**
- [ ] Embed code generates correctly
- [ ] Copy button works across browsers
- [ ] Preview shows actual badge appearance
- [ ] Code is valid HTML

**Dependencies:** `2.6 Profile Edit Page`, `3.5 Badge Issuance`

**Deliverables:**
- [ ] `app/dashboard/badge/page.tsx`
- [ ] Embed code generator component
- [ ] Copy-to-clipboard utility

---

##### 4.7 Open Badges API - Issuer `→ M4.4`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Create `/api/openbadges/issuer` endpoint
- [ ] Return valid OpenBadges issuer JSON
- [ ] Include name, URL, email, description
- [ ] Add proper caching headers

**Definition of Done:**
- [ ] Returns valid JSON-LD
- [ ] All required fields present
- [ ] Caching configured appropriately

**Deliverables:**
- [ ] `app/api/openbadges/issuer/route.ts`

---

##### 4.8 Open Badges API - BadgeClass `→ M4.4`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Create `/api/openbadges/badgeclass` endpoint
- [ ] Define BadgeClass for "Seniorenfreundlich Siegel"
- [ ] Include criteria URL pointing to public page
- [ ] Add badge image URL

**Definition of Done:**
- [ ] Returns valid OpenBadges BadgeClass JSON
- [ ] Criteria page exists and is public
- [ ] Image URL is stable and accessible

**Dependencies:** `4.7 Open Badges API - Issuer`

**Deliverables:**
- [ ] `app/api/openbadges/badgeclass/route.ts`
- [ ] `app/kriterien/page.tsx` (criteria page)

---

##### 4.9 Open Badges API - Assertion `→ M4.4`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Create `/api/openbadges/assertion/[id]` endpoint
- [ ] Load badge and company by assertionId
- [ ] Return hosted assertion JSON
- [ ] Include evidence URL pointing to certificate page
- [ ] Reflect revoked status correctly

**Definition of Done:**
- [ ] Returns 404 if assertion not found
- [ ] Revoked status reflected accurately
- [ ] Includes issuer and badgeClass references
- [ ] Evidence URL is valid

**Dependencies:** `4.7 Open Badges API - Issuer`, `4.8 Open Badges API - BadgeClass`

**Deliverables:**
- [ ] `app/api/openbadges/assertion/[id]/route.ts`

---

##### 4.10 Badge Revocation `→ M4.5`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Add "Siegel entwerten" button on dashboard
- [ ] Implement confirmation dialog
- [ ] Create revoke action (set status revoked, revokedAt)
- [ ] Log audit event
- [ ] Update certificate page to show revoked status

**Definition of Done:**
- [ ] Revocation requires confirmation
- [ ] Badge status updates in database
- [ ] Certificate page reflects revoked status
- [ ] Company removed from public directory listing
- [ ] Audit event created

**Dependencies:** `4.4 Certificate Page`, `3.5 Badge Issuance`

**Deliverables:**
- [ ] `src/actions/revokeBadge.ts`
- [ ] Revocation UI in dashboard

---

#### Phase 4 Risk Factors & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SEO performance on dynamic pages | Medium | Medium | Use Next.js generateStaticParams where possible |
| OpenBadges spec compliance | Low | Medium | Validate against OpenBadges validator |
| Certificate verification trust | Low | High | Clear verification instructions; transparent status |

---

### Phase 5: Launch Preparation
**Status:** `[PLANNED]`  
**Duration:** Weeks 9-12  
**Total Story Points:** 42

#### Phase Objectives
- Implement comprehensive testing (unit, integration, E2E)
- Set up production infrastructure and deployment pipeline
- Configure monitoring and observability
- Complete legal compliance and SEO optimization
- Execute staging → production deployment

#### Key Milestones

| Milestone | Target | Deliverable | Status |
|-----------|--------|-------------|--------|
| M5.1 | Week 9, Day 3 | Unit test coverage >70% | `[PLANNED]` |
| M5.2 | Week 9, Day 7 | Integration tests passing | `[PLANNED]` |
| M5.3 | Week 10, Day 3 | E2E tests covering critical paths | `[PLANNED]` |
| M5.4 | Week 10, Day 7 | Staging environment fully configured | `[PLANNED]` |
| M5.5 | Week 11, Day 3 | Monitoring and alerts active | `[PLANNED]` |
| M5.6 | Week 11, Day 7 | Legal pages complete | `[PLANNED]` |
| M5.7 | Week 12, Day 3 | Production deployment ready | `[PLANNED]` |
| M5.8 | Week 12, Day 5 | Soft launch complete | `[PLANNED]` |
| M5.9 | Week 12, Day 7 | Public launch | `[PLANNED]` |

#### Detailed Tasks

##### 5.1 Unit Testing Setup `→ M5.1`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Configure Vitest or Jest for unit testing
- [ ] Set up test utilities for React components
- [ ] Create mock utilities for external services
- [ ] Set up coverage reporting

**Definition of Done:**
- [ ] Test runner configured and working
- [ ] Coverage reporting enabled
- [ ] Mock utilities for Clerk, Mollie, DB

**Dependencies:** `1.1 Repository Setup`

**Deliverables:**
- [ ] `vitest.config.ts` or `jest.config.js`
- [ ] Test utilities and mocks
- [ ] CI test job

---

##### 5.2 Unit Tests - Services `→ M5.1`
**Story Points:** 8 | **Risk:** 🟢 Low

- [ ] Write tests for companyService
- [ ] Write tests for orderService
- [ ] Write tests for badgeService
- [ ] Write tests for auditService
- [ ] Mock database layer

**Definition of Done:**
- [ ] All service functions have tests
- [ ] >70% code coverage on services
- [ ] Tests run in CI

**Dependencies:** `5.1 Unit Testing Setup`, `2.3 Repository Layer`

**Deliverables:**
- [ ] `src/services/*.test.ts` files
- [ ] Coverage report

---

##### 5.3 Unit Tests - Utilities `→ M5.1`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Write tests for validation utilities
- [ ] Write tests for formatters
- [ ] Write tests for API helpers

**Definition of Done:**
- [ ] All utility functions tested
- [ ] Edge cases covered

**Dependencies:** `5.1 Unit Testing Setup`

**Deliverables:**
- [ ] Utility test files

---

##### 5.4 Integration Tests `→ M5.2`
**Story Points:** 8 | **Risk:** 🟡 Medium

- [ ] Set up test database (Neon branch or ephemeral)
- [ ] Write integration tests for auth flow
- [ ] Write integration tests for company CRUD
- [ ] Write integration tests for badge lifecycle

**Definition of Done:**
- [ ] Tests use real database (isolated)
- [ ] Critical user flows covered
- [ ] Tests run in CI

**Dependencies:** `5.2 Unit Tests - Services`

**Deliverables:**
- [ ] Integration test suite
- [ ] Test database setup script

---

##### 5.5 E2E Tests with Playwright `→ M5.3`
**Story Points:** 8 | **Risk:** 🟡 Medium

- [ ] Configure Playwright
- [ ] Write E2E test: User registration and onboarding
- [ ] Write E2E test: Profile management
- [ ] Write E2E test: Payment flow (Mollie test mode)
- [ ] Write E2E test: Badge verification

**Definition of Done:**
- [ ] Critical user journeys covered
- [ ] Tests run against staging
- [ ] Screenshots on failure

**Dependencies:** `5.4 Integration Tests`

**Deliverables:**
- [ ] `e2e/` directory with tests
- [ ] Playwright configuration
- [ ] CI E2E job

---

##### 5.6 Staging Environment `→ M5.4`
**Story Points:** 5 | **Risk:** 🟡 Medium

- [ ] Configure staging Vercel project
- [ ] Set up staging Neon database
- [ ] Configure staging Mollie account
- [ ] Set up staging Clerk application
- [ ] Configure staging environment variables

**Definition of Done:**
- [ ] Staging deploys automatically from main branch
- [ ] Staging uses separate database
- [ ] Staging uses test Mollie keys
- [ ] All features functional in staging

**Dependencies:** `1.1 Repository Setup`

**Deliverables:**
- [ ] Staging Vercel project
- [ ] Staging environment documentation

---

##### 5.7 Sentry Integration `→ M5.5`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Configure Sentry for Next.js
- [ ] Set up client-side error capture
- [ ] Set up server-side error capture
- [ ] Configure source maps
- [ ] Set up alerting rules

**Definition of Done:**
- [ ] Errors captured in Sentry
- [ ] Source maps working
- [ ] Alerts configured for production

**Dependencies:** `1.2 Environment Configuration`

**Deliverables:**
- [ ] `sentry.client.config.ts`
- [ ] `sentry.server.config.ts`
- [ ] `sentry.edge.config.ts`

---

##### 5.8 Google Analytics 4 `→ M5.5`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Configure GA4 tracking ID
- [ ] Add gtag integration with Next.js Script
- [ ] Implement Cookiebot consent integration
- [ ] Track key events (signup, purchase, verification)

**Definition of Done:**
- [ ] GA4 loads only after consent
- [ ] Events tracked correctly
- [ ] No tracking before consent

**Dependencies:** `5.9 Cookiebot Integration`

**Deliverables:**
- [ ] `src/analytics/ga.ts`
- [ ] Event tracking utilities

---

##### 5.9 Cookiebot Integration `→ M5.5`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Add Cookiebot script to layout
- [ ] Configure blocking mode auto
- [ ] Ensure GA loads after analytics consent
- [ ] Add consent change handlers

**Definition of Done:**
- [ ] Cookie banner displays
- [ ] GA blocked until consent
- [ ] Consent preferences saved

**Dependencies:** `2.8 Basic UI Shell`

**Deliverables:**
- [ ] Cookiebot integration in `app/layout.tsx`
- [ ] Consent management utilities

---

##### 5.10 SEO & Sitemaps `→ M5.6`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Create dynamic `robots.ts`
- [ ] Create dynamic `sitemap.ts` with all public pages
- [ ] Include company pages and certificate pages
- [ ] Include English equivalents
- [ ] Exclude dashboard routes

**Definition of Done:**
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] All public URLs included
- [ ] No private routes exposed
- [ ] Lastmod dates accurate

**Dependencies:** `3.2 Company Profile Pages`, `3.4 Certificate Page`

**Deliverables:**
- [ ] `app/robots.ts`
- [ ] `app/sitemap.ts`

---

##### 5.11 Structured Data `→ M5.6`
**Story Points:** 3 | **Risk:** 🟢 Low

- [ ] Add JSON-LD for Organization on company pages
- [ ] Add JSON-LD for LocalBusiness on company pages
- [ ] Add JSON-LD for certificate pages
- [ ] Validate with Google's Rich Results Test

**Definition of Done:**
- [ ] JSON-LD present on all relevant pages
- [ ] Validates without errors
- [ ] No fake ratings or reviews

**Dependencies:** `3.2 Company Profile Pages`, `3.4 Certificate Page`

**Deliverables:**
- [ ] Structured data components
- [ ] Validation reports

---

##### 5.12 Legal Pages `→ M5.6`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Create `/impressum` (German legal notice)
- [ ] Create `/datenschutz` (privacy policy)
- [ ] Create `/agb` (terms of service)
- [ ] Create `/widerruf` (cancellation policy)
- [ ] List all third-party services (Vercel, Neon, Mollie, Clerk, Brevo, GA, Cookiebot, Sentry)
- [ ] Include GDPR-compliant data processing information
- [ ] Add English placeholders if desired

**Definition of Done:**
- [ ] All required legal pages present
- [ ] Links in footer
- [ ] Content reviewed for accuracy
- [ ] GDPR data processor list complete

**Dependencies:** `2.8 Basic UI Shell`

**Deliverables:**
- [ ] `app/impressum/page.tsx`
- [ ] `app/datenschutz/page.tsx`
- [ ] `app/agb/page.tsx`
- [ ] `app/widerruf/page.tsx`

---

##### 5.13 Admin Panel (Optional) `→ M5.7`
**Story Points:** 5 | **Risk:** 🟢 Low

- [ ] Create `/admin` route with guard
- [ ] Configure admin user IDs in env
- [ ] Show companies, orders, badges tables
- [ ] Add manual revoke action
- [ ] Add order lookup

**Definition of Done:**
- [ ] Route protected to admin users only
- [ ] Core data visible in tables
- [ ] Emergency revoke functional

**Dependencies:** `1.5 Authentication Core`, `2.3 Repository Layer`

**Deliverables:**
- [ ] `app/admin/page.tsx`
- [ ] `src/auth/isAdmin.ts`

---

##### 5.14 Production Deployment `→ M5.7`
**Story Points:** 3 | **Risk:** 🔴 High

- [ ] Configure production Vercel project
- [ ] Set up production Neon database
- [ ] Configure production Mollie (live keys)
- [ ] Configure production Clerk
- [ ] Set up production Brevo
- [ ] Run database migrations
- [ ] Verify all environment variables

**Definition of Done:**
- [ ] Production builds successfully
- [ ] Database connected and migrated
- [ ] All third-party services configured
- [ ] Smoke tests pass

**Dependencies:** All previous tasks

**Deliverables:**
- [ ] Production deployment
- [ ] Deployment checklist

---

##### 5.15 Health Checks & Monitoring `→ M5.7`
**Story Points:** 3 | **Risk:** 🟡 Medium

- [ ] Create `/api/health` endpoint
- [ ] Check database connectivity
- [ ] Check external service status
- [ ] Set up UptimeRobot or similar monitoring
- [ ] Configure alert notifications

**Definition of Done:**
- [ ] Health endpoint returns 200 when healthy
- [ ] Returns 503 when unhealthy
- [ ] Monitoring checks every 5 minutes
- [ ] Alerts sent on downtime

**Dependencies:** `5.14 Production Deployment`

**Deliverables:**
- [ ] `app/api/health/route.ts`
- [ ] Monitoring configuration

---

##### 5.16 Launch Checklist Execution `→ M5.8`
**Story Points:** 2 | **Risk:** 🟡 Medium

- [ ] Verify SSL certificate
- [ ] Test all critical user flows in production
- [ ] Verify Mollie live mode working
- [ ] Test email delivery
- [ ] Confirm analytics receiving data
- [ ] Run security scan
- [ ] Performance test (Lighthouse >90)

**Definition of Done:**
- [ ] All checklist items pass
- [ ] Issues documented and resolved
- [ ] Sign-off for public launch

**Dependencies:** `5.14 Production Deployment`

**Deliverables:**
- [ ] Launch checklist document
- [ ] Sign-off approval

---

##### 5.17 Soft Launch `→ M5.8`
**Story Points:** 2 | **Risk:** 🟢 Low

- [ ] Launch to limited audience (friends, family, beta testers)
- [ ] Monitor for issues
- [ ] Collect feedback
- [ ] Fix critical issues

**Definition of Done:**
- [ ] Limited users can access
- [ ] No critical bugs reported
- [ ] Feedback collected and prioritized

**Dependencies:** `5.16 Launch Checklist Execution`

---

##### 5.18 Public Launch `→ M5.9`
**Story Points:** 1 | **Risk:** 🟢 Low

- [ ] Remove any access restrictions
- [ ] Announce launch
- [ ] Monitor closely for 48 hours

**Definition of Done:**
- [ ] Site publicly accessible
- [ ] Launch announcement published
- [ ] Monitoring active

**Dependencies:** `5.17 Soft Launch`

---

#### Phase 5 Risk Factors & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Production deployment failure | Medium | 🔴 High | Staging parity; blue-green deployment; rollback plan ready |
| Third-party service outages | Low | Medium | Health checks; graceful degradation; status page |
| Performance issues | Medium | Medium | Lighthouse CI; load testing; caching strategy |
| Legal compliance gaps | Low | 🔴 High | Legal review; comprehensive privacy policy; terms of service |
| Security vulnerabilities | Low | 🔴 High | Security audit; dependency scanning; CSP headers |

#### Phase 5 Rollback/Contingency
- **If deployment fails:** Rollback to previous version via Vercel
- **If critical bug found:** Hotfix deployment process documented
- **If Mollie issues:** Can disable payments temporarily
- **If database issues:** Neon point-in-time recovery

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROJECT DEPENDENCIES                                │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: FOUNDATION
───────────────────
[1.1 Repo Setup] ─────┬──→ [1.2 Env Config] ────→ [1.3 DB Config]
                      │                              │
                      └──────────────────────────────┘
                                                       ↓
                                               [1.4 DB Schema]
                                                       ↓
                                               [1.5 Auth Core]
                                                       ↓
                                              ╔═══════════════╗
                                              ║  GATE 1 PASS  ║
                                              ╚═══════╤═══════╝
                                                      ↓

PHASE 2: CORE PLATFORM
──────────────────────
[2.1 i18n Setup] ────→ [2.2 Hreflang SEO]
                              ↓
[2.3 Repository] ←──────┬─────┘
       ↓                │
[2.4 Ownership] ────────┤
       ↓                │
[2.5 Onboarding] ───────┤
       ↓                │
[2.6 Profile] ──────────┤
       ↓                │
[2.7 Logo Upload] ──────┘
       ↓
[2.8 UI Shell]
       ↓
╔═══════════════╗
║  GATE 2 PASS  ║
╚═══════╤═══════╝
        ↓

PHASE 3: COMMERCE
─────────────────
[3.1 Mollie Config] ────→ [3.2 Payment Creation] ────→ [3.3 Billing Page]
                                                              ↓
[3.4 Webhook] ←───────────────────────────────────────────────┘
       ↓
[3.5 Badge Issuance]
       ↓
[3.6 Email Notification]
       ↓
[3.7 Order History]
       ↓
╔═══════════════╗
║  GATE 3 PASS  ║
╚═══════╤═══════╝
        ↓

PHASE 4: PUBLIC FEATURES
────────────────────────
[4.1 Directory] ────→ [4.2 Company Pages] ────→ [4.4 Cert (DE)]
       ↓                                    ↓              ↓
[4.3 English Dir]                          └─────→ [4.5 Cert (EN)]
                                                            ↓
[4.6 Badge Embed] ←─────────────────────────────────────────┘
       ↓
[4.7 OB Issuer] ────→ [4.8 OB BadgeClass] ────→ [4.9 OB Assertion]
                                                       ↓
[4.10 Revocation] ←────────────────────────────────────┘
       ↓
╔═══════════════╗
║  GATE 4 PASS  ║
╚═══════╤═══════╝
        ↓

PHASE 5: LAUNCH PREPARATION
───────────────────────────
[5.1-5.3 Unit Tests] ────→ [5.4 Integration] ────→ [5.5 E2E Tests]
                                                          ↓
[5.6 Staging] ←───────────────────────────────────────────┘
       ↓
[5.7 Sentry] ────→ [5.9 Cookiebot] ────→ [5.8 GA4]
       ↓                                    ↓
[5.10 SEO/Sitemap] ────→ [5.11 Structured]  │
       ↓                                    │
[5.12 Legal] ←──────────────────────────────┘
       ↓
[5.13 Admin] ────→ [5.14 Prod Deploy] ────→ [5.15 Health]
                                                  ↓
[5.16 Checklist] ────→ [5.17 Soft Launch] ────→ [5.18 Public Launch]

CRITICAL PATH (Bold)
────────────────────
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 2.3 → 2.4 → 2.5 → 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 4.1 → 4.2 → 5.5 → 5.14 → 5.18
```

---

## Critical Path Analysis

### Critical Path Tasks

The following sequence determines the **minimum project duration (10 weeks)**:

| Order | Task | Duration | Cumulative |
|-------|------|----------|------------|
| 1 | Repository Setup | 5 days | Week 1 |
| 2 | Environment Config | 3 days | Week 1 |
| 3 | Database Config | 5 days | Week 1-2 |
| 4 | Database Schema | 5 days | Week 2 |
| 5 | Auth Core | 3 days | Week 2 |
| 6 | Repository Layer | 5 days | Week 3 |
| 7 | Company Ownership | 3 days | Week 3 |
| 8 | Onboarding Flow | 5 days | Week 3-4 |
| 9 | Mollie Config | 3 days | Week 5 |
| 10 | Payment Creation | 5 days | Week 5 |
| 11 | Billing Page | 5 days | Week 5-6 |
| 12 | Webhook Endpoint | 5 days | Week 6 |
| 13 | Badge Issuance | 5 days | Week 6 |
| 14 | Email Notification | 3 days | Week 6 |
| 15 | Public Directory | 5 days | Week 7 |
| 16 | Company Pages | 5 days | Week 7-8 |
| 17 | E2E Tests | 8 days | Week 9-10 |
| 18 | Production Deploy | 3 days | Week 11-12 |
| 19 | Public Launch | 1 day | Week 12 |
| 17 | E2E Tests | 8 days | Week 9-10 |
| 18 | Production Deploy | 3 days | Week 11-12 |
| 19 | Public Launch | 1 day | Week 12 |

### Float Analysis

Tasks with **available float** (can be delayed without impacting launch):

| Task | Float | Reason |
|------|-------|--------|
| 4.3 English Directory | 7 days | Can launch with German only |
| 4.5 Certificate EN | 7 days | German certificate sufficient |
| 4.6 Badge Embed | 14 days | Nice-to-have for MVP |
| 4.7-4.9 OpenBadges | 14 days | Verification works without |
| 4.10 Revocation | 5 days | Can be manual initially |
| 5.13 Admin Panel | 14 days | Optional for MVP |
| 5.17 Soft Launch | 3 days | Can go straight to public |

### Compression Opportunities

To reduce timeline, consider:
1. **Parallel work:** UI shell (2.8) can be done alongside auth setup
2. **Resource addition:** Add second developer for frontend tasks
3. **Scope reduction:** Defer English translation to post-launch
4. **Automation:** Use CI/CD templates to speed up Phase 5

---

## Quality Gates

### Gate 1: Foundation Complete
**Location:** End of Phase 1  
**Status:** `[PLANNED]`

| Criteria | Requirement | Verification |
|----------|-------------|--------------|
| Build | `npm run build` succeeds | Automated check |
| Lint | No ESLint errors | CI check |
| Tests | Unit test framework configured | Test runner executes |
| Auth | Sign in/out flow works | Manual test |
| Database | Migrations run successfully | Migration log |
| Security | No secrets in code | Secret scan |

**Approver:** Tech Lead  
**Exit Action:** Proceed to Phase 2

---

### Gate 2: Core Platform Complete
**Location:** End of Phase 2  
**Status:** `[PLANNED]`

| Criteria | Requirement | Verification |
|----------|-------------|--------------|
| i18n | Both languages functional | Manual test |
| Database | All CRUD operations work | Integration tests |
| Profile | Full company profile editable | E2E test |
| Ownership | User can only edit own company | Security test |
| Upload | Logo upload works | Manual test |
| Accessibility | WCAG 2.1 AA compliance | Axe scan |

**Approver:** Tech Lead + Product Owner  
**Exit Action:** Proceed to Phase 3

---

### Gate 3: Commerce Complete
**Location:** End of Phase 3  
**Status:** `[PLANNED]`

| Criteria | Requirement | Verification |
|----------|-------------|--------------|
| Payment | Mollie test checkout works | E2E test |
| Webhook | Events processed correctly | Webhook test |
| Issuance | Badge created on payment | Integration test |
| Idempotency | Duplicate webhooks handled | Unit test |
| Email | Post-purchase email sent | Manual test |
| Security | Payment verified via Mollie API | Security review |

**Approver:** Tech Lead + Product Owner + Security Review  
**Exit Action:** Proceed to Phase 4

---

### Gate 4: Public Features Complete
**Location:** End of Phase 4  
**Status:** `[PLANNED]`

| Criteria | Requirement | Verification |
|----------|-------------|--------------|
| Directory | Search and pagination work | E2E test |
| SEO | Meta tags present on all pages | Automated check |
| Certificate | Verification page functional | Manual test |
| Performance | Lighthouse score >80 | Lighthouse CI |
| Mobile | Responsive on all breakpoints | Manual test |

**Approver:** Tech Lead + Product Owner + Security Review  
**Exit Action:** Proceed to Phase 5

---

### Gate 5: Launch Ready
**Location:** End of Phase 5  
**Status:** `[PLANNED]`

| Criteria | Requirement | Verification |
|----------|-------------|--------------|
| Coverage | >70% test coverage | Coverage report |
| E2E | All critical paths tested | E2E suite pass |
| Security | No high/critical vulnerabilities | Security scan |
| Performance | Lighthouse score >90 | Lighthouse CI |
| Legal | All required pages present | Manual review |
| Monitoring | Sentry + GA4 receiving data | Dashboard check |
| Health | Health endpoint responding | Automated check |

**Approver:** Tech Lead + Product Owner + Stakeholder  
**Exit Action:** Soft Launch → Public Launch

---

## Resource Requirements

### Team Composition by Phase

| Phase | Frontend Dev | Backend Dev | DevOps | QA | Legal |
|-------|--------------|-------------|--------|-----|-------|
| Phase 1 | 1 | 1 | 0.5 | 0 | 0 |
| Phase 2 | 1 | 1 | 0 | 0 | 0 |
| Phase 3 | 1 | 0.5 | 0 | 0 | 0 |
| Phase 4 | 0.5 | 1 | 0 | 0 | 0 |
| Phase 5 | 0.5 | 0.5 | 0.5 | 1 | 0.5 |

### Skills Required

| Skill | Required For | Priority |
|-------|--------------|----------|
| Next.js 14+ | All phases | Critical |
| TypeScript | All phases | Critical |
| React/Server Components | All phases | Critical |
| PostgreSQL | Phase 1, 2, 4 | High |
| Drizzle ORM | Phase 1, 2 | High |
| Clerk Auth | Phase 1, 2 | High |
| Mollie Integration | Phase 3 | Critical |
| Webhook Security | Phase 3 | Critical |
| i18n (next-intl) | Phase 2 | Medium |
| SEO/Structured Data | Phase 3, 5 | Medium |
| Playwright E2E | Phase 5 | High |
| Vercel/Serverless | All phases | High |

### External Resources

| Resource | Purpose | Cost (est.) |
|----------|---------|-------------|
| Vercel Pro | Hosting | $20/mo |
| Neon Pro | Database | $19/mo |
| Clerk Pro | Auth (first 10k free) | $0-25/mo |
| Mollie | Payment processing (EU) | 1.8% + €0.25 per iDEAL / varies by method |
| Brevo | Email (300/day free) | $0 |
| Sentry | Error tracking (5k events free) | $0-26/mo |
| GA4 | Analytics | Free |
| Cookiebot | Consent (small site) | €42/mo |

---

## Risk Register

### Top 10 Project Risks

| # | Risk | Probability | Impact | Score | Mitigation | Owner |
|---|------|-------------|--------|-------|------------|-------|
| 1 | Mollie webhook delivery failures | 🟡 Medium | 🔴 High | 6 | Implement idempotency; verify via API; manual fallback | Backend Lead |
| 2 | Production deployment failure | 🟡 Medium | 🔴 High | 6 | Staging parity; blue-green deploy; rollback ready | DevOps |
| 3 | Database migration issues | 🟡 Medium | 🔴 High | 6 | Test migrations in staging; backup before deploy | Backend Lead |
| 4 | Payment processing bugs | 🟡 Medium | 🔴 High | 6 | Extensive E2E testing; Mollie test mode validation | QA Lead |
| 5 | Third-party service outage | 🟡 Medium | 🟡 Medium | 4 | Health checks; graceful degradation; status monitoring | DevOps |
| 6 | Legal compliance gaps | 🟢 Low | 🔴 High | 3 | Legal review; comprehensive privacy policy | Product Owner |
| 7 | Performance issues at scale | 🟡 Medium | 🟡 Medium | 4 | Load testing; caching strategy; CDN | Backend Lead |
| 8 | Security vulnerabilities | 🟢 Low | 🔴 High | 3 | Security audit; dependency scanning; CSP | Security Lead |
| 9 | i18n content gaps | 🟡 Medium | 🟢 Low | 2 | Translation keys; German fallback; content review | Frontend Lead |
| 10 | Scope creep | 🟡 Medium | 🟡 Medium | 4 | Strict MVP definition; change control process | Product Owner |

### Risk Response Matrix

| Risk | Response Type | Actions |
|------|---------------|---------|
| 1, 2, 3, 4 | Mitigate | Extra testing; monitoring; fallback procedures |
| 5 | Accept | Monitor; have workarounds ready |
| 6, 8 | Transfer | Legal review; security audit |
| 7 | Mitigate | Performance budget; caching |
| 9 | Accept | German default; post-launch translations |
| 10 | Avoid | Strict change control |

### Contingency Budget

| Category | Amount | Purpose |
|----------|--------|---------|
| Additional development | 1 week | Scope adjustments, bug fixes |
| External consulting | €2,000 | Legal review, security audit |
| Infrastructure scaling | €500/month | Traffic spikes |
| Bug bounty/reserves | €1,000 | Security issues |

---

## Appendix: Comparison with Original Plan

### EPIC Restructuring

| Original EPIC | New Phase | Changes |
|---------------|-----------|---------|
| EPIC 0: Repo Setup | Phase 1 | Unchanged |
| EPIC 1: Internationalization | Phase 2 | Merged with Core Platform |
| EPIC 2: Database & Drizzle | Phase 1 | Moved earlier |
| EPIC 3: Auth | Phase 1 | Moved earlier |
| EPIC 4: Company Profile | Phase 2 | Unchanged |
| EPIC 7: Payments | Phase 3 | Moved earlier; Stripe → Mollie |
| EPIC 8: Webhook | Phase 3 | Moved earlier; Stripe → Mollie |
| EPIC 5: Public Directory | Phase 4 | Moved after Commerce |
| EPIC 6: Certificate Pages | Phase 4 | Moved after Commerce |
| EPIC 9: Badge Management | Phase 4 | Moved with Public Features |
| EPIC 10: Open Badges | Phase 4 | Moved with Public Features |
| EPIC 11: Consent/Analytics | Phase 5 | Added testing/QA |
| EPIC 12: SEO & Sitemaps | Phase 5 | Unchanged |
| EPIC 13: Legal Pages | Phase 5 | Added /widerruf, GDPR compliance |
| EPIC 14: Admin (Optional) | Phase 5 | Still optional |

### New Additions

| Feature | Phase | Story Points | Reason |
|---------|-------|--------------|--------|
| Unit Testing Framework | 5 | 5 | Quality baseline |
| Unit Tests - Services | 5 | 8 | Prevent regressions |
| Integration Tests | 5 | 8 | Verify integrations |
| E2E Tests | 5 | 8 | Critical path validation |
| Staging Environment | 5 | 5 | Safe testing |
| Health Checks | 5 | 3 | Production monitoring |
| Quality Gates | All | N/A | Phase validation |
| Risk Register | All | N/A | Risk management |
| Dependency Graph | N/A | N/A | Visual planning |
| Critical Path Analysis | N/A | N/A | Timeline optimization |

### Improvements Summary

| Aspect | Original | Improved | Benefit |
|--------|----------|----------|---------|
| Test Coverage | ~0% | >70% | Fewer bugs, confidence |
| Deployment | Unplanned | Staging → Prod | Reduced risk |
| Dependencies | Implicit | Explicit graph | Clear sequencing |
| Risk Management | None | Full register | Proactive mitigation |
| Estimation | None | Story points | Capacity planning |
| Quality Gates | None | 5 checkpoints | Phase validation |
| Rollback Plans | None | Documented | Recovery readiness |
| Monitoring | Basic | Comprehensive | Issue detection |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Original | - | Initial 14 EPICs |
| 2.0 | 2026-03-05 | Kilo Code | Restructured into 5 phases, added testing, QA, deployment, risk management |
| 3.0 | 2026-03-31 | Copilot | Stripe → Mollie, Commerce before Public Features, GDPR compliance, generic schema, added /widerruf, Shadcn/ui, next-intl |

---

**Next Steps:**
1. Review roadmap with stakeholders
2. Assign team members to phases
3. Set up project tracking (Jira/Linear)
4. Schedule Phase 1 kickoff
5. Create detailed tickets from tasks

**Questions or Feedback:** Document in project management tool or schedule review meeting.
