import { eq } from "drizzle-orm";
import { db } from "@/src/db/db";
import { companies } from "@/src/db/schema";

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export async function getCompanyByOwner(
  ownerClerkUserId: string
): Promise<Company | null> {
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.ownerClerkUserId, ownerClerkUserId))
    .limit(1);
  return result[0] ?? null;
}

export async function getCompanyBySlug(
  slug: string
): Promise<Company | null> {
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function createCompany(data: NewCompany): Promise<Company> {
  const [company] = await db.insert(companies).values(data).returning();
  return company;
}

export async function updateCompany(
  id: string,
  data: Partial<Omit<NewCompany, "id" | "ownerClerkUserId" | "createdAt">>
): Promise<Company> {
  const [company] = await db
    .update(companies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning();
  return company;
}
