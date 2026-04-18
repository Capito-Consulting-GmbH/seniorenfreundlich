import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listOrdersAdmin } from "@/src/services/orderService";
import { TablePagination } from "@/src/components/admin/TablePagination";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Search, X } from "lucide-react";
import { OrdersTable } from "./OrdersTable";

const statusFilters = ["pending", "paid", "failed", "expired", "refunded"] as const;
type StatusFilter = (typeof statusFilters)[number];

type SearchParams = { search?: string; page?: string; status?: string };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, t, tCommon] = await Promise.all([
    searchParams,
    getTranslations("admin.orders"),
    getTranslations("admin.common"),
  ]);
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search?.trim() || undefined;
  const statusFilter = statusFilters.includes(params.status as StatusFilter)
    ? (params.status as StatusFilter)
    : undefined;

  const { rows: rawRows, total, pageSize } = await listOrdersAdmin({ search, page, statusFilter });

  const rows = rawRows.map((r) => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toLocaleDateString("de-DE") : String(r.createdAt),
  }));

  function buildHref(p: number) {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (statusFilter) q.set("status", statusFilter);
    q.set("page", String(p));
    return `/admin/orders?${q.toString()}`;
  }

  function statusHref(s: StatusFilter | null) {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (s) q.set("status", s);
    q.set("page", "1");
    return `/admin/orders?${q.toString()}`;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-0.5">{tCommon("total", { count: total })}</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <form action="/admin/orders" method="GET" className="flex gap-2">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="search" placeholder={t("searchPlaceholder")} defaultValue={search} className="pl-9 w-72" />
          </div>
          <Button type="submit" variant="secondary" size="sm">{t("search")}</Button>
          {(search || statusFilter) && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders"><X className="h-4 w-4 mr-1" />{t("clear")}</Link>
            </Button>
          )}
        </form>

        <div className="flex gap-1">
          <Link href={statusHref(null)}>
            <Badge variant={!statusFilter ? "default" : "outline"} className="cursor-pointer">{t("all")}</Badge>
          </Link>
          {statusFilters.map((s) => (
            <Link key={s} href={statusHref(statusFilter === s ? null : s)}>
              <Badge
                variant={statusFilter === s ? (s === "paid" ? "default" : s === "pending" ? "secondary" : "destructive") : "outline"}
                className="cursor-pointer capitalize"
              >
                {s}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      <OrdersTable rows={rows} />
      <TablePagination page={page} total={total} pageSize={pageSize} buildHref={buildHref} />
    </div>
  );
}
