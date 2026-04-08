import { and, count, eq, ilike, or } from "drizzle-orm";
import { db } from "@/src/db/db";
import { badges, companies } from "@/src/db/schema";

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

const PAGE_SIZE = 12;

export async function listCertifiedCompanies({
  search,
  page,
}: {
  search?: string;
  page: number;
}): Promise<{ rows: Company[]; total: number; pageSize: number }> {
  const offset = (page - 1) * PAGE_SIZE;

  const searchFilter =
    search
      ? or(
          ilike(companies.name, `%${search}%`),
          ilike(companies.city, `%${search}%`)
        )
      : undefined;

  const whereClause = and(eq(badges.status, "active"), searchFilter);

  const [{ total }] = await db
    .select({ total: count() })
    .from(companies)
    .innerJoin(badges, eq(badges.companyId, companies.id))
    .where(whereClause);

  const rows = await db
    .select({ company: companies })
    .from(companies)
    .innerJoin(badges, eq(badges.companyId, companies.id))
    .where(whereClause)
    .orderBy(companies.name)
    .limit(PAGE_SIZE)
    .offset(offset);

  return { rows: rows.map((r) => r.company), total, pageSize: PAGE_SIZE };
}
