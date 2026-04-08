import { desc, eq } from "drizzle-orm";
import { db } from "@/src/db/db";
import { orders } from "@/src/db/schema";

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export async function createOrder(data: NewOrder): Promise<Order> {
  const [order] = await db.insert(orders).values(data).returning();
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
