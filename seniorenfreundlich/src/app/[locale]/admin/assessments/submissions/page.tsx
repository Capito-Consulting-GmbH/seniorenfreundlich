import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/src/auth/isAdmin";
import { listSubmissionsAdmin } from "@/src/services/assessmentSubmissionService";
import { SubmissionsTable } from "./SubmissionsTable";
import { TablePagination } from "@/src/components/admin/TablePagination";
import type { AssessmentSubmissionRow } from "@/src/services/assessmentSubmissionService";
interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function SubmissionsPage({ searchParams }: Props) {
  await requireAdmin();
  const { page: pageStr, status } = await searchParams;
  const t = await getTranslations("admin.assessments.submission");

  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const statusFilter = (status as AssessmentSubmissionRow["status"]) ?? undefined;

  const { rows, total, pageSize } = await listSubmissionsAdmin({
    page,
    statusFilter,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>
      <SubmissionsTable rows={rows} />
      <TablePagination
        page={page}
        total={total}
        pageSize={pageSize}
        buildHref={(p) => `/admin/assessments/submissions?page=${p}${status ? `&status=${status}` : ""}`}
      />
    </div>
  );
}
