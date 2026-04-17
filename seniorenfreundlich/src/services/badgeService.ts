import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/src/db/db";
import { badges, companies } from "@/src/db/schema";

export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;

export async function getActiveBadgeForCompany(
  companyId: string
): Promise<Badge | null> {
  const result = await db
    .select()
    .from(badges)
    .where(and(eq(badges.companyId, companyId), eq(badges.status, "active")))
    .limit(1);
  return result[0] ?? null;
}

export async function getBadgeByAssertionId(
  assertionId: string
): Promise<Badge | null> {
  const result = await db
    .select()
    .from(badges)
    .where(eq(badges.assertionId, assertionId))
    .limit(1);
  return result[0] ?? null;
}

export async function createBadge(companyId: string): Promise<Badge> {
  const [badge] = await db.insert(badges).values({ companyId }).returning();
  return badge;
}

export async function revokeBadge(id: string): Promise<Badge> {
  const [badge] = await db
    .update(badges)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(eq(badges.id, id))
    .returning();
  return badge;
}

export async function getLatestBadgeForCompany(
  companyId: string
): Promise<Badge | null> {
  const result = await db
    .select()
    .from(badges)
    .where(eq(badges.companyId, companyId))
    .orderBy(desc(badges.issuedAt))
    .limit(1);
  return result[0] ?? null;
}

// ─── Admin functions ──────────────────────────────────────────────────────────

const ADMIN_PAGE_SIZE = 25;

export type AdminBadgeRow = Badge & { companyName: string; companySlug: string };

export async function listBadgesAdmin({
  search,
  page,
  statusFilter,
}: {
  search?: string;
  page: number;
  statusFilter?: "active" | "revoked";
}): Promise<{ rows: AdminBadgeRow[]; total: number; pageSize: number }> {
  const offset = (page - 1) * ADMIN_PAGE_SIZE;

  const rows = await db
    .select({ badge: badges, companyName: companies.name, companySlug: companies.slug })
    .from(badges)
    .innerJoin(companies, eq(badges.companyId, companies.id))
    .where(
      and(
        statusFilter ? eq(badges.status, statusFilter) : undefined,
        search
          ? ilike(companies.name, `%${search}%`)
          : undefined
      )
    )
    .orderBy(desc(badges.issuedAt));

  const total = rows.length;
  const page_rows = rows
    .slice(offset, offset + ADMIN_PAGE_SIZE)
    .map((r) => ({ ...r.badge, companyName: r.companyName, companySlug: r.companySlug }));

  return { rows: page_rows, total, pageSize: ADMIN_PAGE_SIZE };
}

export async function getBadgeById(id: string): Promise<Badge | null> {
  const result = await db
    .select()
    .from(badges)
    .where(eq(badges.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function reactivateBadge(id: string): Promise<Badge> {
  const [badge] = await db
    .update(badges)
    .set({ status: "active", revokedAt: null })
    .where(eq(badges.id, id))
    .returning();
  return badge;
}
