# Findings — seniorenfreundlich.de

All identified findings: resolved issues, open questions, security observations, and known technical debt.
Status: **Resolved** / **Open** / **Deferred**

---

## Resolved findings

These were identified, triaged, and fully implemented.

---

### F-001 · No way to abort an active review
**Type:** Missing feature  
**Reported:** 2026-04-07  
**Status:** ✅ Resolved in v0.4.0

**Description:** Once an admin started reviewing a submission (`under_review`), there was no path back. Only approve or reject were available. This forced admins to reject submissions just to send them back for corrections.

**Resolution:** Added `abortReview()` service method and server action. Admin can set status back to `submitted` from the `under_review` state. Abort button shown conditionally in submission detail view.

---

### F-002 · Multi-choice answers showed raw JSON in admin view
**Type:** Display bug  
**Reported:** 2026-04-07  
**Status:** ✅ Resolved in v0.4.0

**Description:** Admin submission review showed `{ selected: ["option-2"] }` instead of the human-readable option label (e.g. "Externally certified"). The raw option ID has no meaning without config context.

**Resolution:** Submission detail view now resolves `questionId → config option → label` before rendering. Labels are rendered in the current locale.

---

### F-003 · Seal purchasable without an approved assessment
**Type:** Business logic bug / security  
**Reported:** 2026-04-07  
**Status:** ✅ Resolved in v0.4.0

**Description:** Companies could reach the "Siegel kaufen" button and complete a Mollie payment without ever submitting an assessment, bypassing the certification requirement entirely.

**Resolution:** `startCheckoutAction` now validates that an approved submission exists for the requested tier before creating a Mollie payment. The badge page gate also prevents the button from rendering without a valid approved submission.

---

### F-004 · No seed script / no local lifecycle simulation
**Type:** Developer tooling gap  
**Reported:** 2026-04-07  
**Status:** ✅ Resolved in v0.5.0

**Description:** No way to populate a local DB with realistic multi-stage data to test the full platform flow (assessment → review → payment → badge). Every developer had to create data manually.

**Resolution:** `scripts/seed.ts` — idempotent, run with `npx tsx scripts/seed.ts`. Seeds 5 users, 3 assessment configs (one per tier), 4 companies in different lifecycle states, 4 submissions, 1 paid order, 1 active badge, and 5 audit events. See `PRODUCT.md §14` for seed credentials.

---

### F-005 · Customer saw only "in review" status after submission
**Type:** UX gap  
**Reported:** 2026-04-07  
**Status:** ✅ Resolved in v0.4.0

**Description:** After submitting an assessment, the customer dashboard showed a generic "in review" message with no way to review their submitted answers. This made it impossible to spot errors or prepare for follow-up questions.

**Resolution:** `AssessmentStatus` component renders a full read-only view of all submitted answers with resolved option labels, mirroring the admin detail view.

---

### F-006 · Order created immediately on "Siegel kaufen" click
**Type:** Business logic bug  
**Reported:** 2026-04-07  
**Status:** ✅ Resolved in v0.5.0

**Description:** Clicking "Siegel kaufen" immediately inserted a `pending` order row into the DB. If the user navigated away from Mollie without paying, the pending order remained, polluting the orders table and distorting revenue analytics.

**Resolution:** Deferred order creation — no DB order is created until Mollie fires the `paid` webhook. `pendingMolliePaymentId` is stored on the company record to allow the poller to track in-flight payments without a DB order row.

---

### F-007 · Only one undifferentiated seal tier
**Type:** Missing feature / product requirement  
**Reported:** 2026-04-07  
**Status:** ✅ Resolved in v0.5.0

**Description:** The product vision calls for three progressively harder certification tiers (S/M/L → Basic/Standard/Premium), each tied to its own assessment config and its own pricing. Only one undifferentiated seal existed.

**Resolution:** Full tier system implemented. `tier` enum on `assessmentConfigs`, `badges`, `orders`. One active config per tier (unique partial index). Badge page shows 3-tier card grid. Pricing: Basic €49, Standard €99, Premium €149.

---

### F-008 · Admin sidebar disappears on small screens
**Type:** UX / responsive design bug  
**Reported:** 2026-04-07  
**Status:** ✅ Resolved in v0.4.0

**Description:** The admin panel sidebar was only rendered as a static side column. On narrow viewports it disappeared entirely, making the admin panel unusable on mobile or smaller browser windows.

**Resolution:** Sheet-based collapsible sidebar added to the admin layout. A hamburger button is shown on small screens; clicking it opens a slide-in Sheet component with full navigation. Sheet closes automatically on route change.

---

## Open questions

Questions raised during development with current recommended answers documented.

---

### Q-001 · What happens to submissions and purchasers when the questionnaire is modified?
**Raised:** 2026-04-07  
**Status:** 🟡 Answered — not yet fully enforced in UI

**Question:** If an admin modifies the questionnaire while companies have pending reviews or purchased seals, what is the idiomatic resolution?

**Current architecture answer:** Submissions are pinned to a `configId` (FK to `assessmentConfigs`). Configs are versioned and immutable once `active` — publishing a new config archives the previous one. All existing submissions continue to reference their original config version. Admins can see which version a submission was evaluated against.

**Recommendation:** Show "Bewertet nach Version {N}" in the submission detail view (not yet implemented). The JSONB config is stored on the config row, so historical rendering is always possible.

**Remaining work:** Display the config version in the admin submission detail view (cosmetic only, no data model changes needed).

---

### Q-002 · Badge validity / annual renewal
**Raised:** from original pdd.md  
**Status:** 🔵 Deferred to post-launch

**Question:** Should badges expire and require annual renewal?

**Current state:** Badges have no expiry. Status is either `active` or `revoked` (manual).

**Recommendation for post-launch:** Add `expiresAt` column to `badges`. Add a scheduled job (Vercel Cron or similar) to auto-set `status = revoked` on expiry. Build a renewal flow (new payment → extends `expiresAt`).

---

## Security findings

---

### S-001 · Mollie webhook has no signature verification
**Type:** Security observation  
**Severity:** Low (mitigated by design)  
**Status:** 🟡 Accepted risk (by design)

**Description:** Mollie's webhook does not provide a cryptographic signature on the request body. The webhook only receives a `paymentId`. The server immediately fetches the payment status directly from the Mollie API using the paymentId — this is the recommended Mollie pattern and acts as implicit verification (an attacker would need a valid Mollie paymentId to trigger any processing).

**Mitigation in place:** Idempotency check — already-processed payments are ignored. Payment status is always re-verified via Mollie API, never trusted from the webhook body.

**Recommendation:** Consider adding an IP allowlist for Mollie's webhook IPs as an additional defence-in-depth layer if the platform processes high volumes.

---

### S-002 · Seed script password hash in source code
**Type:** Security observation  
**Severity:** Low (development only)  
**Status:** ✅ Acceptable — guarded

**Description:** `scripts/seed.ts` contains a hardcoded bcrypt hash of `Password1!`. This is intentional for local dev seeding.

**Mitigations in place:** 
- Script refuses to run if `NODE_ENV=production`
- Script refuses to run without `DATABASE_URL` env var
- Password is `Password1!` — clearly a dev-only credential

**Recommendation:** Ensure `scripts/seed.ts` is never executed in CI/CD against a production database. The production guard is in place.

---

### S-003 · Admin bootstrap requires direct SQL access
**Type:** Operational security observation  
**Severity:** Low  
**Status:** 🟡 Accepted — documented

**Description:** The first admin user must be promoted via a raw SQL statement (`UPDATE "user" SET role = 'admin' WHERE email = '...'`) run directly against the Neon database. There is no initial-setup admin creation flow.

**Mitigation:** This is a one-time operation and requires database credentials, which limits the attack surface to someone who already has DB access.

**Recommendation:** For operational convenience, a CLI command (`npx tsx scripts/create-admin.ts <email>`) could be added post-launch to avoid requiring raw SQL access.

---

### S-004 · Server actions lack rate limiting
**Type:** Security gap  
**Severity:** Medium  
**Status:** 🔵 Deferred

**Description:** Server actions (checkout initiation, assessment submission, email verification) have no rate limiting. A malicious actor could spam the checkout action to create many in-flight Mollie payments, or brute-force email verification tokens.

**Recommendation:** Add rate limiting middleware (e.g. Upstash Rate Limit or Vercel Edge Middleware) before launch, particularly on:
- `startCheckoutAction` — max 5 per company per hour
- `sendVerificationEmail` — max 3 per email per hour
- Auth endpoints (better-auth has built-in support)

---

### S-005 · Vercel Blob logo uploads lack MIME type enforcement
**Type:** Security gap  
**Severity:** Medium  
**Status:** 🔵 Deferred

**Description:** `uploadLogo.ts` uploads files to Vercel Blob but relies on the client-supplied MIME type. A malicious actor could upload a non-image file (e.g. SVG with embedded script, or a PDF) as a "logo".

**Recommendation:** Validate MIME type server-side using file magic bytes (e.g. `file-type` npm package), not the client-supplied content-type header. Restrict to `image/png`, `image/jpeg`, `image/webp`. Enforce a file size limit server-side (not just client-side).

---

## Known technical debt

---

### T-001 · No automated test suite
**Severity:** High (for production readiness)  
**Status:** 🔵 Planned (post-launch)

The original plan (see `plan.md` Phases 1–6) included Vitest unit tests and Playwright E2E tests. These were not implemented during the MVP sprint. All business logic is untested.

**Recommended priority order:**
1. `mollieWebhookService` — idempotency logic (unit test with mock Mollie client)
2. `startCheckoutAction` — gate validation logic
3. Assessment approval/rejection state machine
4. Playwright E2E: registration → assessment → payment → badge verification

---

### T-002 · No CI/CD pipeline
**Severity:** Medium  
**Status:** 🔵 Deferred

No `.github/workflows/ci.yml` exists. Builds, linting, and type-checking are not automated on push.

**Recommendation:** Add a GitHub Actions workflow: `lint → tsc → build` on every PR to `development`.

---

### T-003 · Assessment file uploads not wired to UI
**Severity:** Low  
**Status:** 🔵 Deferred

The database schema, service (`assessmentFileService`), and Vercel Blob proxy support file-upload questions. However, the `AssessmentWizard` does not yet render `file-upload` question types. The schema is ready; the UI is not.

---

### T-004 · No data export for GDPR Art. 20 (data portability)
**Severity:** Medium (legal requirement)  
**Status:** 🔵 Deferred

The GDPR section of the original PDD specifies that users must be able to export their data as JSON. No export feature exists.

**Recommendation:** Add a "Export my data" button to `/dashboard/security` that generates a JSON export of company profile, submissions, orders, and badges.

---

### T-005 · `assessment_configs.version` is a global unique integer
**Severity:** Low  
**Status:** 🟡 Accepted — by design

The `version` column is globally unique across all tiers and statuses. This means version numbers are not per-tier (e.g. Basic v1, Standard v1 are not both version 1). The seed script uses version 100/101/102 to avoid collisions with manually created configs.

**Note:** This is acceptable for auditing purposes (each published config has a unique global version) but may confuse users who expect per-tier versioning. Consider renaming to `globalVersion` or adding a per-tier `revision` counter if this becomes confusing.

---

### T-006 · Cancellation page not connected to Mollie
**Severity:** Low  
**Status:** 🔵 Deferred

`/cancellation` page exists as a legal static page but there is no automated flow for processing refund requests (GDPR Art. 13 / consumer law 14-day withdrawal right). Refunds must currently be processed manually by an admin via the admin panel.
