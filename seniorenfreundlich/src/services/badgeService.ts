import { and, eq } from "drizzle-orm";
import { db } from "@/src/db/db";
import { badges } from "@/src/db/schema";

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
