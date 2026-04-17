import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/src/lib/auth";
import { TablePagination } from "@/src/components/admin/TablePagination";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Search, X } from "lucide-react";
import { UsersTable } from "./UsersTable";

const PAGE_SIZE = 25;

type SearchParams = { search?: string; page?: string };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, t, tCommon] = await Promise.all([
    searchParams,
    getTranslations("admin.users"),
    getTranslations("admin.common"),
  ]);
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search?.trim() || undefined;

  const result = await auth.api.listUsers({
    headers: await headers(),
    query: {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      ...(search ? { searchValue: search, searchBy: "name" as const } : {}),
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = (result?.users ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const total = (result as any)?.total ?? users.length;

  const rows = users.map((u) => ({
    id: u.id as string,
    name: u.name as string,
    email: u.email as string,
    emailVerified: u.emailVerified as boolean,
    role: (u.role ?? "user") as string,
    banned: (u.banned ?? false) as boolean,
    createdAt: u.createdAt instanceof Date
      ? u.createdAt.toLocaleDateString("de-DE")
      : new Date(u.createdAt).toLocaleDateString("de-DE"),
  }));

  function buildHref(p: number) {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    q.set("page", String(p));
    return `/admin/users?${q.toString()}`;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-0.5">{tCommon("total", { count: total })}</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <form action="/admin/users" method="GET" className="flex gap-2">
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="search" placeholder={t("searchPlaceholder")} defaultValue={search} className="pl-9 w-64" />
          </div>
          <Button type="submit" variant="secondary" size="sm">{t("search")}</Button>
          {search && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users"><X className="h-4 w-4 mr-1" />{t("clear")}</Link>
            </Button>
          )}
        </form>
      </div>

      <UsersTable rows={rows} />
      <TablePagination page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
    </div>
  );
}
