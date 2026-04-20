import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/src/db/db";
import { companies, orders } from "@/src/db/schema";

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export async function createOrder(data: NewOrder): Promise<Order> {
  const [order] = await db.insert(orders).values(data).returning();
  return order;
}

export async function createPaidOrder(data: Omit<NewOrder, "status">): Promise<Order> {
  const [order] = await db
    .insert(orders)
    .values({ ...data, status: "paid" })
    .returning();
  return order;
}

export async function getOrderByMolliePaymentId(
  molliePaymentId: string
): Promise<Order | null> {
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.molliePaymentId, molliePaymentId))
    .limit(1);
  return result[0] ?? null;
}

export async function markOrderPaid(id: string): Promise<Order> {
  const [order] = await db
    .update(orders)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return order;
}

export async function getOrdersByCompany(companyId: string): Promise<Order[]> {
  return db.select().from(orders).where(eq(orders.companyId, companyId));
}

export async function getLatestOrderByCompany(companyId: string): Promise<Order | null> {
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.companyId, companyId))
    .orderBy(desc(orders.createdAt))
    .limit(1);

  return result[0] ?? null;
}

// ─── Admin functions ──────────────────────────────────────────────────────────

const ADMIN_PAGE_SIZE = 25;

export type AdminOrderRow = Order & { companyName: string };

export async function listOrdersAdmin({
  search,
  page,
  statusFilter,
}: {
  search?: string;
  page: number;
  statusFilter?: Order["status"];
}): Promise<{ rows: AdminOrderRow[]; total: number; pageSize: number }> {
  const offset = (page - 1) * ADMIN_PAGE_SIZE;

  const rows = await db
    .select({ order: orders, companyName: companies.name })
    .from(orders)
    .innerJoin(companies, eq(orders.companyId, companies.id))
    .where(
      search
        ? or(
            ilike(companies.name, `%${search}%`),
            ilike(orders.molliePaymentId, `%${search}%`)
          )
        : statusFilter
          ? eq(orders.status, statusFilter)
          : undefined
    )
    .orderBy(desc(orders.createdAt));

  const filtered = statusFilter && !search
    ? rows
    : search
      ? rows.filter((r) => !statusFilter || r.order.status === statusFilter)
      : rows;

  const total = filtered.length;
  const page_rows = filtered
    .slice(offset, offset + ADMIN_PAGE_SIZE)
    .map((r) => ({ ...r.order, companyName: r.companyName }));

  return { rows: page_rows, total, pageSize: ADMIN_PAGE_SIZE };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function markOrderRefunded(id: string): Promise<Order> {
  const [order] = await db
    .update(orders)
    .set({ status: "refunded", updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return order;
}
