import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listCompaniesAdmin } from "@/src/services/companyService";
import { TablePagination } from "@/src/components/admin/TablePagination";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Search, X } from "lucide-react";
import { CompaniesTable } from "./CompaniesTable";

type SearchParams = {
  search?: string;
  page?: string;
  verification?: string;
  badge?: string;
};

const verificationFilters = ["unverified", "pending", "verified"] as const;
const badgeFilters = ["active", "revoked", "none"] as const;

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, t] = await Promise.all([
    searchParams,
    getTranslations("admin.companies"),
  ]);
  const tCommon = await getTranslations("admin.common");
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search?.trim() || undefined;
  const verificationFilter = verificationFilters.includes(params.verification as (typeof verificationFilters)[number])
    ? (params.verification as (typeof verificationFilters)[number])
    : undefined;
  const badgeFilter = badgeFilters.includes(params.badge as (typeof badgeFilters)[number])
    ? (params.badge as (typeof badgeFilters)[number])
    : undefined;

  const { rows: rawRows, total, pageSize } = await listCompaniesAdmin({
    search,
    page,
    verificationFilter,
    badgeFilter,
  });

  const rows = rawRows.map((r) => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toLocaleDateString("de-DE") : String(r.createdAt),
  }));

  function buildHref(nextPage: number) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (verificationFilter) p.set("verification", verificationFilter);
    if (badgeFilter) p.set("badge", badgeFilter);
    p.set("page", String(nextPage));
    return `/admin/companies?${p.toString()}`;
  }

  function filterHref(key: string, value: string | null) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (key !== "verification" && verificationFilter) p.set("verification", verificationFilter);
    if (key !== "badge" && badgeFilter) p.set("badge", badgeFilter);
    if (value) p.set(key, value);
    p.set("page", "1");
    return `/admin/companies?${p.toString()}`;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-0.5">{tCommon("total", { count: total })}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <form action="/admin/companies" method="GET" className="flex gap-2">
          {verificationFilter && <input type="hidden" name="verification" value={verificationFilter} />}
          {badgeFilter && <input type="hidden" name="badge" value={badgeFilter} />}
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="search" placeholder={t("searchPlaceholder")} defaultValue={search} className="pl-9 w-72" />
          </div>
          <Button type="submit" variant="secondary" size="sm">{t("search")}</Button>
          {(search || verificationFilter || badgeFilter) && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/companies"><X className="h-4 w-4 mr-1" />{t("clear")}</Link>
            </Button>
          )}
        </form>

        <div className="flex gap-1">
          <Link href={filterHref("verification", null)}>
            <Badge variant={!verificationFilter ? "default" : "outline"} className="cursor-pointer">{t("allVerification")}</Badge>
          </Link>
          {verificationFilters.map((v) => (
            <Link key={v} href={filterHref("verification", verificationFilter === v ? null : v)}>
              <Badge variant={verificationFilter === v ? "default" : "outline"} className="cursor-pointer capitalize">{v}</Badge>
            </Link>
          ))}
        </div>

        <div className="flex gap-1">
          {badgeFilters.map((b) => (
            <Link key={b} href={filterHref("badge", badgeFilter === b ? null : b)}>
              <Badge
                variant={badgeFilter === b ? (b === "active" ? "default" : b === "revoked" ? "destructive" : "secondary") : "outline"}
                className="cursor-pointer capitalize"
              >
                {b}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      <CompaniesTable rows={rows} />
      <TablePagination page={page} total={total} pageSize={pageSize} buildHref={buildHref} />
    </div>
  );
}
