"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/src/components/admin/DataTable";
import { Badge } from "@/src/components/ui/badge";

export type BadgeRow = {
  id: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  status: string;
  issuedAt: string;
  revokedAt: string | null;
};

export function BadgesTable({ rows }: { rows: BadgeRow[] }) {
  const t = useTranslations("admin.badges");

  const columns: ColumnDef<BadgeRow>[] = [
    {
      accessorKey: "id",
      header: t("colId"),
      cell: ({ row }) => (
        <Link href={`/admin/badges/${row.original.id}`} className="font-mono text-xs hover:underline">
          {row.original.id.slice(0, 12)}…
        </Link>
      ),
    },
    {
      accessorKey: "companyName",
      header: t("colCompany"),
      cell: ({ row }) => (
        <Link href={`/admin/companies/${row.original.companyId}`} className="text-sm hover:underline">
          {row.original.companyName}
        </Link>
      ),
    },
    {
      accessorKey: "companySlug",
      header: t("colSlug"),
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("colStatus"),
      cell: ({ getValue }) => {
        const v = String(getValue());
        return <Badge variant={v === "active" ? "default" : "destructive"}>{v}</Badge>;
      },
    },
    {
      accessorKey: "issuedAt",
      header: t("colIssued"),
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "revokedAt",
      header: t("colRevoked"),
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{String(getValue() ?? "—")}</span>
      ),
    },
  ];

  return <DataTable columns={columns} data={rows} />;
}
