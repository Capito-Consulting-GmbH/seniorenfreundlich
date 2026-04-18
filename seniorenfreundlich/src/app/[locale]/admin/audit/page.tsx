import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listAuditEvents } from "@/src/services/auditService";
import { TablePagination } from "@/src/components/admin/TablePagination";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Search, X } from "lucide-react";
import { AuditEventRow } from "@/src/components/admin/AuditEventRow";

const entityTypes = ["company", "badge", "order", "user"] as const;

type SearchParams = {
  entityType?: string;
  action?: string;
  entityId?: string;
  actorId?: string;
  page?: string;
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, t, tCommon] = await Promise.all([
    searchParams,
    getTranslations("admin.audit"),
    getTranslations("admin.common"),
  ]);
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const action = params.action?.trim() || undefined;
  const entityId = params.entityId?.trim() || undefined;
  const actorId = params.actorId?.trim() || undefined;
  const entityType = entityTypes.includes(params.entityType as (typeof entityTypes)[number])
    ? (params.entityType as (typeof entityTypes)[number])
    : undefined;

  const { rows, total, pageSize } = await listAuditEvents({
    entityType,
    action,
    entityId,
    actorId,
    page,
  });

  const hasFilters = !!(entityType || action || entityId || actorId);

  function buildHref(p: number) {
    const q = new URLSearchParams();
    if (entityType) q.set("entityType", entityType);
    if (action) q.set("action", action);
    if (entityId) q.set("entityId", entityId);
    if (actorId) q.set("actorId", actorId);
    q.set("page", String(p));
    return `/admin/audit?${q.toString()}`;
  }

  function entityTypeHref(et: string | null) {
    const q = new URLSearchParams();
    if (action) q.set("action", action);
    if (entityId) q.set("entityId", entityId);
    if (actorId) q.set("actorId", actorId);
    if (et) q.set("entityType", et);
    q.set("page", "1");
    return `/admin/audit?${q.toString()}`;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-0.5">{t("events", { count: total })}</p>
      </div>

      <div className="space-y-3">
        <form action="/admin/audit" method="GET" className="flex flex-wrap gap-2">
          {entityType && <input type="hidden" name="entityType" value={entityType} />}
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="action" placeholder={t("actionPlaceholder")} defaultValue={action} className="pl-9 w-48" />
          </div>
          <Input name="entityId" placeholder={t("entityIdPlaceholder")} defaultValue={entityId} className="w-52 font-mono text-xs" />
          <Input name="actorId" placeholder={t("actorIdPlaceholder")} defaultValue={actorId} className="w-52 font-mono text-xs" />
          <Button type="submit" variant="secondary" size="sm">{t("filter")}</Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/audit"><X className="h-4 w-4 mr-1" />{t("clear")}</Link>
            </Button>
          )}
        </form>

        <div className="flex gap-1 flex-wrap">
          <Link href={entityTypeHref(null)}>
            <Badge variant={!entityType ? "default" : "outline"} className="cursor-pointer">{t("all")}</Badge>
          </Link>
          {entityTypes.map((et) => (
            <Link key={et} href={entityTypeHref(entityType === et ? null : et)}>
              <Badge variant={entityType === et ? "default" : "outline"} className="cursor-pointer capitalize">{et}</Badge>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-md border divide-y">
        {rows.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">{t("noEvents")}</p>
        )}
        {rows.map((e) => (
          <AuditEventRow key={e.id} event={e} showEntity />
        ))}
      </div>

      <TablePagination page={page} total={total} pageSize={pageSize} buildHref={buildHref} />
    </div>
  );
}
