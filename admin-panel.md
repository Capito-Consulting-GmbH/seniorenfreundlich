# Admin Panel Requirements

## Access control

- Route: `/admin` (locale-prefixed like all other pages)
- Admin access is determined by `user.role === "admin"` — managed via the **better-auth `admin` plugin**
- Server-side role check on every admin page and action; unauthorized users are redirected to `/`
- No separate admin login — admins use the same better-auth session as regular users

### Role system (better-auth admin plugin)

The better-auth `admin` plugin adds the following fields to the existing `user` table via migration:

| Field | Type | Purpose |
|-------|------|---------|
| `role` | string | `"user"` (default) or `"admin"` |
| `banned` | boolean | Whether the user is blocked from signing in |
| `banReason` | string | Reason for the ban |
| `banExpires` | date | When the ban expires (null = permanent) |

And adds `impersonatedBy` to the `session` table.

**Two roles are sufficient for MVP: `user` (default) and `admin`.**

### Granting admin access

Any existing admin promotes a user via the Users tab in the admin panel (calls `authClient.admin.setRole({ userId, role: "admin" })`).

**Bootstrapping the first admin** (one-time, no code change needed):
> Run directly in the Neon console:
> ```sql
> UPDATE "user" SET role = 'admin' WHERE email = 'you@example.com';
> ```

---

## Navigation

Top-level tabs inside the admin layout:

| Tab | Path | Purpose |
|-----|------|---------|
| Dashboard | `/admin` | KPI overview |
| Companies | `/admin/companies` | Company management |
| Orders | `/admin/orders` | Payment & order management |
| Badges | `/admin/badges` | Badge lifecycle management |
| Users | `/admin/users` | User management (role assignment, banning) |
| Audit Log | `/admin/audit` | Full audit trail viewer |

---

## 1. Admin Dashboard (`/admin`)

At-a-glance KPIs, each as a card:

| Metric | Source |
|--------|--------|
| Total companies | `count(companies)` |
| Verified companies | `count(companies) where verificationStatus = 'verified'` |
| Active badges | `count(badges) where status = 'active'` |
| Revoked badges | `count(badges) where status = 'revoked'` |
| Total revenue | `sum(orders.amount) where status = 'paid'` — display in EUR |
| Pending orders | `count(orders) where status = 'pending'` |
| Orders this month | `count(orders) where status = 'paid' and createdAt >= start of current month` |

Below the cards: a "Recent activity" section showing the last 10 audit events with timestamp, action, entity type, and actor.

---

## 2. Companies (`/admin/companies`)

### List view

- Server-side paginated table (25 per page)
- Columns: Name, Slug, Email, City, Verification Status, Badge Status, Created At
- Badge Status is derived by joining the `badges` table (active / revoked / none)
- Search by name, email, city, or slug
- Filter by verification status (all / unverified / pending / verified)
- Filter by badge status (all / active / revoked / none)
- Sort by name or created date

### Company detail (`/admin/companies/[id]`)

Read-only view of all company fields, grouped:

- **Identity**: name, slug, HRB number
- **Contact**: email, phone, website
- **Address**: address, city, postal code, country
- **Verification**: status, verified at, verification attempts
- **Profile**: description, logo (rendered)

Sections below the company details:

- **Badge history**: table of all badges for this company (status, assertionId, issuedAt, revokedAt)
- **Order history**: table of all orders for this company (molliePaymentId, amount, status, createdAt)
- **Audit trail**: filtered audit events for this company's entityId

### Admin actions on company detail

| Action | Effect | Confirmation required |
|--------|--------|-----------------------|
| Revoke badge | Sets active badge to `revoked`, writes audit event with actorId = admin | Yes — dialog with reason field |
| Issue badge manually | Creates a new active badge without payment (for comp/partner cases), writes audit event | Yes — dialog with reason field |
| Reset verification | Sets verificationStatus back to `unverified`, clears verifiedAt, writes audit event | Yes |
| Delete company | Hard-deletes company and cascading records; only available if no active badge | Yes — type company name to confirm |

All admin actions write audit events with `actorId` set to the admin's user ID and include an `adminReason` field in metadata.

---

## 3. Orders (`/admin/orders`)

### List view

- Server-side paginated table (25 per page)
- Columns: Order ID, Company Name, Mollie Payment ID, Amount (EUR), Status, Created At
- Search by company name or Mollie payment ID
- Filter by status (all / pending / paid / failed / expired / refunded)
- Sort by created date (newest first default)

### Order detail (`/admin/orders/[id]`)

- All order fields displayed
- Link to parent company detail
- Link to Mollie dashboard (external, `https://my.mollie.com/dashboard/payments/{molliePaymentId}`)
- Associated badge (if order resulted in badge issuance)
- Audit trail filtered for this order's entityId

### Admin actions on order detail

| Action | Effect | Confirmation required |
|--------|--------|-----------------------|
| Mark as refunded | Sets order status to `refunded`, revokes associated badge if active, writes audit event | Yes — dialog with reason |
| Re-check Mollie status | Calls Mollie API to fetch live payment status; if status diverges from DB, reconcile and update | No |

---

## 4. Badges (`/admin/badges`)

### List view

- Server-side paginated table (25 per page)
- Columns: Assertion ID, Company Name, Status, Issued At, Revoked At
- Filter by status (all / active / revoked)
- Search by company name or assertion ID
- Sort by issued date (newest first default)

### Badge detail (`/admin/badges/[id]`)

- All badge fields
- Link to parent company detail
- Link to public certificate page (`/certificate/[slug]`)
- Link to Open Badges assertion JSON (`/api/openbadges/assertion/[assertionId]`)
- Audit trail filtered for this badge's entityId

### Admin actions on badge detail

| Action | Effect | Confirmation required |
|--------|--------|-----------------------|
| Revoke | Sets status to `revoked` with timestamp, writes audit event with admin reason | Yes — dialog with reason |
| Re-activate | Sets status back to `active`, clears revokedAt, writes audit event (for wrongful revocation rollback) | Yes — dialog with reason |

---

## 5. Users (`/admin/users`)

User list and management capabilities come directly from the better-auth admin plugin — no custom service code needed for user operations.

### List view

- Paginated table via `authClient.admin.listUsers({ query: { limit, offset, searchValue, searchField, sortBy, sortDirection } })`
- Columns: Name, Email, Role, Banned, Created At
- Search by name or email
- Filter by role (all / user / admin)
- Filter by banned status (all / active / banned)

### User detail (`/admin/users/[id]`)

- User fields: name, email, role, banned status, ban reason, ban expiry
- Linked company (if the user owns one) — link to company detail
- Active sessions list

### Admin actions on user detail

| Action | Effect | API |
|--------|--------|-----|
| Promote to admin | Sets role to `"admin"` | `authClient.admin.setRole({ userId, role: "admin" })` |
| Demote to user | Sets role back to `"user"` | `authClient.admin.setRole({ userId, role: "user" })` |
| Ban user | Blocks sign-in, revokes all sessions; dialog for reason + optional expiry | `authClient.admin.banUser({ userId, banReason, banExpiresIn })` |
| Unban user | Restores access | `authClient.admin.unbanUser({ userId })` |
| Revoke all sessions | Force-signs out the user everywhere | `authClient.admin.revokeUserSessions({ userId })` |

---

## 6. Audit Log (`/admin/audit`)

### List view

- Server-side paginated table (50 per page)
- Columns: Timestamp, Action, Entity Type, Entity ID (linked), Actor ID, Metadata (expandable)
- Filter by entity type (company / order / badge)
- Filter by action (free text or dropdown of known actions)
- Filter by date range
- Search by entity ID or actor ID
- Sort by timestamp (newest first default)
- Expandable row to show full metadata JSON

---

## Technical implementation notes

### Auth guard

```
// src/auth/isAdmin.ts
// Calls getCurrentUser(), checks user.role === "admin"
// Used in admin layout.tsx as a server-side guard — redirects to / if not admin
// Also called at the top of every admin server action
```

### Required migration (better-auth admin plugin)

After adding the `admin` plugin to `auth.ts` and running `npx auth migrate`, the following columns are added automatically — no hand-written migration needed:

- `user.role` (text, default `"user"`)
- `user.banned` (boolean)
- `user.banReason` (text, nullable)
- `user.banExpires` (timestamp, nullable)
- `session.impersonatedBy` (text, nullable)

### New service functions needed

| Service | Function | Purpose |
|---------|----------|---------|
| companyService | `listCompaniesAdmin({ search, page, verificationFilter, badgeFilter, sort })` | Paginated admin list with joins |
| companyService | `getCompanyById(id)` | Fetch by primary key |
| companyService | `deleteCompany(id)` | Hard delete (admin only) |
| orderService | `listOrdersAdmin({ search, page, statusFilter, sort })` | Paginated admin list with company join |
| orderService | `getOrderById(id)` | Fetch by primary key |
| orderService | `markOrderRefunded(id)` | Status transition to refunded |
| badgeService | `listBadgesAdmin({ search, page, statusFilter, sort })` | Paginated admin list with company join |
| badgeService | `getBadgeById(id)` | Fetch by primary key |
| badgeService | `reactivateBadge(id)` | Revert revocation |
| auditService | `listAuditEvents({ entityType, action, entityId, actorId, dateFrom, dateTo, page })` | Paginated + filtered query |
| statsService (new) | `getAdminStats()` | Aggregated KPI queries |

User operations (list, get, setRole, ban, unban, revokeSessions) are handled entirely by the **better-auth admin plugin API** — no custom service layer needed.

### New server actions needed

| Action | Purpose |
|--------|---------|
| `adminRevokeBadge` | Revoke with admin reason in metadata |
| `adminIssueBadge` | Manual badge issuance without payment |
| `adminResetVerification` | Reset company verification status |
| `adminDeleteCompany` | Hard-delete company with cascade |
| `adminMarkOrderRefunded` | Mark order refunded + revoke associated badge |
| `adminReactivateBadge` | Undo wrongful revocation |
| `adminReconcileOrder` | Re-check order against Mollie API |

All admin actions must:
1. Verify the caller is an admin (server-side)
2. Write an audit event with `actorId = admin user ID` and `metadata.adminReason`
3. Revalidate affected paths

### UI components

- Reuse existing shadcn/ui components (card, button, input, dialog, badge, separator)
- **TanStack Table** (`@tanstack/react-table`) for all data tables
  - Each list page is a server component that fetches data and passes it as props to a client `DataTable` component
  - TanStack Table manages column definitions, sorting headers, and row rendering on the client
  - Pagination, sorting, and filter state live in URL search params (server-driven); TanStack handles only the rendering layer
- `ConfirmDialog` component (shadcn Dialog) for destructive action confirmations — includes optional reason text input and optional "type to confirm" field
- Admin layout with sidebar navigation, separate from the user dashboard layout

### No custom database tables required

All application data is in the existing schema. The better-auth admin plugin columns are added to the existing `user` and `session` tables via `npx auth migrate` — no new tables, no hand-written SQL.
