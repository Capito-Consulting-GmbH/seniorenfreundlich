import { and, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { db } from "@/src/db/db";
import { auditEvents } from "@/src/db/schema";

export type AuditEvent = typeof auditEvents.$inferSelect;

export type AuditEventData = {
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  metadata?: Record<string, unknown>;
};

export async function writeAuditEvent(data: AuditEventData): Promise<void> {
  await db.insert(auditEvents).values({
    entityType: data.entityType,
    entityId: data.entityId,
    action: data.action,
    actorId: data.actorId,
    metadata: data.metadata ?? null,
  });
}

// ─── Admin functions ──────────────────────────────────────────────────────────

const ADMIN_PAGE_SIZE = 50;

export async function listAuditEvents({
  entityType,
  action,
  entityId,
  actorId,
  dateFrom,
  dateTo,
  page,
}: {
  entityType?: string;
  action?: string;
  entityId?: string;
  actorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
}): Promise<{ rows: AuditEvent[]; total: number; pageSize: number }> {
  const offset = (page - 1) * ADMIN_PAGE_SIZE;

  const rows = await db
    .select()
    .from(auditEvents)
    .where(
      and(
        entityType ? eq(auditEvents.entityType, entityType) : undefined,
        action ? ilike(auditEvents.action, `%${action}%`) : undefined,
        entityId ? or(eq(auditEvents.entityId, entityId), ilike(auditEvents.entityId, `%${entityId}%`)) : undefined,
        actorId ? ilike(auditEvents.actorId, `%${actorId}%`) : undefined,
        dateFrom ? gte(auditEvents.createdAt, dateFrom) : undefined,
        dateTo ? lte(auditEvents.createdAt, dateTo) : undefined
      )
    )
    .orderBy(desc(auditEvents.createdAt));

  const total = rows.length;
  const page_rows = rows.slice(offset, offset + ADMIN_PAGE_SIZE);

  return { rows: page_rows, total, pageSize: ADMIN_PAGE_SIZE };
}
