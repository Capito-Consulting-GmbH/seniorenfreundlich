"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/src/components/admin/DataTable";
import { Badge } from "@/src/components/ui/badge";

export type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  city: string | null;
  verificationStatus: string;
  badgeStatus: string;
  createdAt: string;
};

export function CompaniesTable({ rows }: { rows: CompanyRow[] }) {
  const t = useTranslations("admin.companies");

  const columns: ColumnDef<CompanyRow>[] = [
    {
      accessorKey: "name",
      header: t("colName"),
      cell: ({ row }) => (
        <Link href={`/admin/companies/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "slug",
      header: t("colSlug"),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-xs font-mono">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "email",
      header: t("colEmail"),
      cell: ({ getValue }) => <span className="text-sm">{String(getValue() ?? "—")}</span>,
    },
    {
      accessorKey: "city",
      header: t("colCity"),
      cell: ({ getValue }) => <span className="text-sm">{String(getValue() ?? "—")}</span>,
    },
    {
      accessorKey: "verificationStatus",
      header: t("colVerification"),
      cell: ({ getValue }) => {
        const v = String(getValue());
        return (
          <Badge variant={v === "verified" ? "default" : v === "pending" ? "secondary" : "outline"}>
            {v}
          </Badge>
        );
      },
    },
    {
      accessorKey: "badgeStatus",
      header: t("colBadge"),
      cell: ({ getValue }) => {
        const v = String(getValue());
        return (
          <Badge variant={v === "active" ? "default" : v === "revoked" ? "destructive" : "outline"}>
            {v}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("colCreated"),
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{String(getValue())}</span>
      ),
    },
  ];

  return <DataTable columns={columns} data={rows} />;
}
