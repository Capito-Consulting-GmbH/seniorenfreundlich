import { db } from "@/src/db/db";
import { auditEvents } from "@/src/db/schema";

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
