import { and, count, eq, gte, sum } from "drizzle-orm";
import { db } from "@/src/db/db";
import { badges, companies, orders, auditEvents } from "@/src/db/schema";

export type AdminStats = {
  totalCompanies: number;
  verifiedCompanies: number;
  activeBadges: number;
  revokedBadges: number;
  totalRevenueEur: number;
  pendingOrders: number;
  ordersThisMonth: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    [{ totalCompanies }],
    [{ verifiedCompanies }],
    [{ activeBadges }],
    [{ revokedBadges }],
    [{ totalRevenueCents }],
    [{ pendingOrders }],
    [{ ordersThisMonth }],
  ] = await Promise.all([
    db.select({ totalCompanies: count() }).from(companies),
    db
      .select({ verifiedCompanies: count() })
      .from(companies)
      .where(eq(companies.verificationStatus, "verified")),
    db
      .select({ activeBadges: count() })
      .from(badges)
      .where(eq(badges.status, "active")),
    db
      .select({ revokedBadges: count() })
      .from(badges)
      .where(eq(badges.status, "revoked")),
    db
      .select({ totalRevenueCents: sum(orders.amount) })
      .from(orders)
      .where(eq(orders.status, "paid")),
    db
      .select({ pendingOrders: count() })
      .from(orders)
      .where(eq(orders.status, "pending")),
    db
      .select({ ordersThisMonth: count() })
      .from(orders)
      .where(and(eq(orders.status, "paid"), gte(orders.createdAt, startOfMonth))),
  ]);

  return {
    totalCompanies,
    verifiedCompanies,
    activeBadges,
    revokedBadges,
    totalRevenueEur: Math.round(Number(totalRevenueCents ?? 0)) / 100,
    pendingOrders,
    ordersThisMonth,
  };
}

export async function getRecentAuditEvents(limit = 10) {
  return db
    .select()
    .from(auditEvents)
    .orderBy(auditEvents.createdAt)
    .limit(limit);
}
