import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listConfigs } from "@/src/services/assessmentConfigService";
import { TablePagination } from "@/src/components/admin/TablePagination";
import { Button } from "@/src/components/ui/button";
import { AssessmentConfigsTable } from "./AssessmentConfigsTable";
import { CreateConfigButton } from "./CreateConfigButton";

type SearchParams = { page?: string };

export default async function AdminAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, t, tCommon] = await Promise.all([
    searchParams,
    getTranslations("admin.assessments"),
    getTranslations("admin.common"),
  ]);

  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const { rows, total, pageSize } = await listConfigs({ page });

  function buildHref(p: number) {
    return `/admin/assessments?page=${p}`;
  }

  const formattedRows = rows.map((r) => ({
    ...r,
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt.toLocaleDateString("de-DE")
        : String(r.createdAt),
    title: r.title as { de: string; en: string },
  }));

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-0.5">
            {tCommon("total", { count: total })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/assessments/submissions">
              {t("submissions")}
            </Link>
          </Button>
          <CreateConfigButton />
        </div>
      </div>

      <AssessmentConfigsTable rows={formattedRows} />

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        buildHref={buildHref}
      />
    </div>
  );
}
