import { and, count, desc, eq, ilike, or, asc } from "drizzle-orm";
import { db } from "@/src/db/db";
import { badges, companies } from "@/src/db/schema";

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export async function getCompanyByOwner(
  ownerUserId: string
): Promise<Company | null> {
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.ownerUserId, ownerUserId))
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
  data: Partial<Omit<NewCompany, "id" | "ownerUserId" | "createdAt">>
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

// ─── Admin functions ──────────────────────────────────────────────────────────

const ADMIN_PAGE_SIZE = 25;

export type AdminCompanyRow = Company & {
  badgeStatus: "active" | "revoked" | "none";
};

export async function listCompaniesAdmin({
  search,
  page,
  verificationFilter,
  badgeFilter,
  sort = "created_desc",
}: {
  search?: string;
  page: number;
  verificationFilter?: "unverified" | "pending" | "verified";
  badgeFilter?: "active" | "revoked" | "none";
  sort?: "name_asc" | "name_desc" | "created_asc" | "created_desc";
}): Promise<{ rows: AdminCompanyRow[]; total: number; pageSize: number }> {
  const offset = (page - 1) * ADMIN_PAGE_SIZE;

  const searchFilter = search
    ? or(
        ilike(companies.name, `%${search}%`),
        ilike(companies.email, `%${search}%`),
        ilike(companies.city, `%${search}%`),
        ilike(companies.slug, `%${search}%`)
      )
    : undefined;

  const verificationWhere = verificationFilter
    ? eq(companies.verificationStatus, verificationFilter)
    : undefined;

  const baseWhere = and(searchFilter, verificationWhere);

  // Fetch all companies with their latest badge status
  const orderCol =
    sort === "name_asc" ? asc(companies.name)
    : sort === "name_desc" ? desc(companies.name)
    : sort === "created_asc" ? asc(companies.createdAt)
    : desc(companies.createdAt);

  const allRows = await db
    .select({
      company: companies,
      badgeStatus: badges.status,
    })
    .from(companies)
    .leftJoin(badges, and(eq(badges.companyId, companies.id), eq(badges.status, "active")))
    .where(baseWhere)
    .orderBy(orderCol);

  // Resolve badge status: active if has active badge, else check for any revoked
  const uniqueCompanyMap = new Map<string, AdminCompanyRow>();
  for (const row of allRows) {
    const existing = uniqueCompanyMap.get(row.company.id);
    if (!existing) {
      uniqueCompanyMap.set(row.company.id, {
        ...row.company,
        badgeStatus: row.badgeStatus === "active" ? "active" : "none",
      });
    }
  }

  // Apply badge filter
  let result = Array.from(uniqueCompanyMap.values());

  if (badgeFilter === "active") {
    result = result.filter((r) => r.badgeStatus === "active");
  } else if (badgeFilter === "revoked") {
    // Need to check for revoked badges separately
    const revokedCompanyIds = new Set(
      (
        await db
          .select({ companyId: badges.companyId })
          .from(badges)
          .where(eq(badges.status, "revoked"))
      ).map((r) => r.companyId)
    );
    result = result.filter(
      (r) => r.badgeStatus !== "active" && revokedCompanyIds.has(r.id)
    );
    result = result.map((r) => ({ ...r, badgeStatus: "revoked" as const }));
  } else if (badgeFilter === "none") {
    const companiesWithBadges = new Set(
      (await db.select({ companyId: badges.companyId }).from(badges)).map(
        (r) => r.companyId
      )
    );
    result = result.filter((r) => !companiesWithBadges.has(r.id));
  }

  const total = result.length;
  const rows = result.slice(offset, offset + ADMIN_PAGE_SIZE);

  return { rows, total, pageSize: ADMIN_PAGE_SIZE };
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function deleteCompany(id: string): Promise<void> {
  await db.delete(companies).where(eq(companies.id, id));
}
