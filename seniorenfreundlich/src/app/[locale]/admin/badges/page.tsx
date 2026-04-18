import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listBadgesAdmin } from "@/src/services/badgeService";
import { TablePagination } from "@/src/components/admin/TablePagination";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Search, X } from "lucide-react";
import { BadgesTable } from "./BadgesTable";

type SearchParams = { search?: string; page?: string; status?: string };

export default async function AdminBadgesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, t, tCommon] = await Promise.all([
    searchParams,
    getTranslations("admin.badges"),
    getTranslations("admin.common"),
  ]);
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search?.trim() || undefined;
  const statusFilter =
    params.status === "active" || params.status === "revoked" ? params.status : undefined;

  const { rows: rawRows, total, pageSize } = await listBadgesAdmin({ search, page, statusFilter });

  const rows = rawRows.map((r) => ({
    ...r,
    issuedAt: r.issuedAt instanceof Date ? r.issuedAt.toLocaleDateString("de-DE") : String(r.issuedAt),
    revokedAt: r.revokedAt instanceof Date ? r.revokedAt.toLocaleDateString("de-DE") : r.revokedAt ? String(r.revokedAt) : null,
  }));

  function buildHref(p: number) {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (statusFilter) q.set("status", statusFilter);
    q.set("page", String(p));
    return `/admin/badges?${q.toString()}`;
  }

  function statusHref(s: string | null) {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (s) q.set("status", s);
    q.set("page", "1");
    return `/admin/badges?${q.toString()}`;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-0.5">{tCommon("total", { count: total })}</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <form action="/admin/badges" method="GET" className="flex gap-2">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="search" placeholder={t("searchPlaceholder")} defaultValue={search} className="pl-9 w-64" />
          </div>
          <Button type="submit" variant="secondary" size="sm">{t("search")}</Button>
          {(search || statusFilter) && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/badges"><X className="h-4 w-4 mr-1" />{t("clear")}</Link>
            </Button>
          )}
        </form>

        <div className="flex gap-1">
          <Link href={statusHref(null)}>
            <Badge variant={!statusFilter ? "default" : "outline"} className="cursor-pointer">{t("allStatuses")}</Badge>
          </Link>
          <Link href={statusHref(statusFilter === "active" ? null : "active")}>
            <Badge variant={statusFilter === "active" ? "default" : "outline"} className="cursor-pointer">{t("active")}</Badge>
          </Link>
          <Link href={statusHref(statusFilter === "revoked" ? null : "revoked")}>
            <Badge variant={statusFilter === "revoked" ? "destructive" : "outline"} className="cursor-pointer">{t("revoked")}</Badge>
          </Link>
        </div>
      </div>

      <BadgesTable rows={rows} />
      <TablePagination page={page} total={total} pageSize={pageSize} buildHref={buildHref} />
    </div>
  );
}
