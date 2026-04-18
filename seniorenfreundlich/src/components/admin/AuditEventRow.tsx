"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";

function entityHref(entityType: string, entityId: string): string {
  switch (entityType) {
    case "company": return `/admin/companies/${entityId}`;
    case "order":   return `/admin/orders/${entityId}`;
    case "badge":   return `/admin/badges/${entityId}`;
    case "user":    return `/admin/users/${entityId}`;
    default:        return `/admin`;
  }
}

type AuditEvent = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string;
  metadata: unknown;
  createdAt: Date;
};

function MetaLine({
  metadata,
  t,
}: {
  metadata: unknown;
  t: ReturnType<typeof useTranslations<"admin.auditMeta">>;
}) {
  if (metadata == null || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;
  const parts: string[] = [];

  if (m.adminReason && typeof m.adminReason === "string") {
    parts.push(t("reason", { value: m.adminReason }));
  } else if (m.reason && typeof m.reason === "string") {
    parts.push(t("reason", { value: m.reason }));
  }
  if (m.banReason && typeof m.banReason === "string") {
    parts.push(t("banReason", { value: m.banReason }));
  }
  if (m.newRole && typeof m.newRole === "string") {
    parts.push(t("newRole", { value: m.newRole }));
  }
  if (m.companyName && typeof m.companyName === "string") {
    parts.push(t("companyName", { value: m.companyName }));
  }

  if (parts.length === 0) return null;
  return (
    <p className="text-xs text-muted-foreground mt-0.5">{parts.join(" · ")}</p>
  );
}

export function AuditEventRow({
  event,
  showEntity = true,
}: {
  event: AuditEvent;
  showEntity?: boolean;
}) {
  const tEvents = useTranslations("admin.auditEvents");
  const tMeta = useTranslations("admin.auditMeta");
  const tAudit = useTranslations("admin.audit");

  // Translate action label, fallback to raw action string
  const actionLabel = tEvents.has(event.action as never)
    ? tEvents(event.action as Parameters<typeof tEvents>[0])
    : event.action.replace(/_/g, " ");

  return (
    <div className="px-4 py-3 space-y-1.5">
      {/* Row 1: badge + action label + timestamp */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {showEntity ? (
            <Link href={entityHref(event.entityType, event.entityId)}>
              <Badge variant="outline" className="text-xs capitalize shrink-0 hover:bg-muted cursor-pointer">
                {event.entityType}
              </Badge>
            </Link>
          ) : (
            <Badge variant="outline" className="text-xs capitalize shrink-0">
              {event.entityType}
            </Badge>
          )}
          <span className="text-sm font-medium">{actionLabel}</span>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
          {formatDistanceToNow(event.createdAt)}
        </span>
      </div>

      {/* Row 2: entity link + actor link */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        {showEntity && (
          <span>
            {tAudit("entity")}:{" "}
            <Link
              href={entityHref(event.entityType, event.entityId)}
              className="font-mono text-foreground hover:underline"
            >
              {event.entityId.slice(0, 8)}…
            </Link>
          </span>
        )}
        <span>
          {tAudit("actor")}:{" "}
          <Link
            href={`/admin/users/${event.actorId}`}
            className="font-mono text-foreground hover:underline"
          >
            {event.actorId.slice(0, 8)}…
          </Link>
        </span>
      </div>

      <MetaLine metadata={event.metadata} t={tMeta} />
    </div>
  );
}
