import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  page: number;
  total: number;
  pageSize: number;
  buildHref: (page: number) => string;
}

export async function TablePagination({
  page,
  total,
  pageSize,
  buildHref,
}: TablePaginationProps) {
  const t = await getTranslations("admin.common");
  const totalPages = Math.ceil(total / pageSize);
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-muted-foreground">
        {t("rangeOf", { from, to, total })}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
          {page > 1 ? (
            <Link href={buildHref(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
              {t("previous")}
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4" />
              {t("previous")}
            </span>
          )}
        </Button>
        <span className="text-sm">
          {t("pageOf", { page, pages: totalPages })}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
          {page < totalPages ? (
            <Link href={buildHref(page + 1)}>
              {t("next")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              {t("next")}
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
