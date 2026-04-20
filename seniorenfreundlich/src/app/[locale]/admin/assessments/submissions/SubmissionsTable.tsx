"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/src/components/admin/DataTable";
import { Badge } from "@/src/components/ui/badge";
import type { AdminSubmissionRow } from "@/src/services/assessmentSubmissionService";

const STATUS_VARIANTS: Record<
  string,
  "secondary" | "default" | "destructive" | "outline"
> = {
  draft: "secondary",
  submitted: "default",
  under_review: "default",
  approved: "default",
  rejected: "destructive",
};

export function SubmissionsTable({ rows }: { rows: AdminSubmissionRow[] }) {
  const t = useTranslations("admin.assessments.submission");

  const columns: ColumnDef<AdminSubmissionRow>[] = [
    {
      accessorKey: "companyName",
      header: t("colCompany"),
      cell: ({ row }) => (
        <Link
          href={`/admin/assessments/submissions/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.companyName}
        </Link>
      ),
    },
    {
      accessorKey: "configVersion",
      header: t("colVersion"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">v{row.original.configVersion}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("colStatus"),
      cell: ({ row }) => {
        const status = row.original.status;
        const labelKey = `status${status.charAt(0).toUpperCase() + status.slice(1).replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())}` as Parameters<typeof t>[0];
        return (
          <Badge variant={STATUS_VARIANTS[status] ?? "secondary"}>
            {t(labelKey)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "submittedAt",
      header: t("colSubmittedAt"),
      cell: ({ row }) =>
        row.original.submittedAt
          ? new Date(row.original.submittedAt).toLocaleDateString("de-DE")
          : "—",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/admin/assessments/submissions/${row.original.id}`}>
          <span className="text-xs text-muted-foreground hover:underline">
            Details →
          </span>
        </Link>
      ),
    },
  ];

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("noSubmissions")}</p>
    );
  }

  return <DataTable columns={columns} data={rows} />;
}
