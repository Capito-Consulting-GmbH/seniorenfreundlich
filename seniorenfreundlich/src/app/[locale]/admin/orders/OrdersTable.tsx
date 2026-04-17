"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/src/components/admin/DataTable";
import { Badge } from "@/src/components/ui/badge";

export type OrderRow = {
  id: string;
  companyName: string;
  amount: number;
  status: string;
  molliePaymentId: string | null;
  createdAt: string;
};

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const t = useTranslations("admin.orders");

  const columns: ColumnDef<OrderRow>[] = [
    {
      accessorKey: "id",
      header: t("colId"),
      cell: ({ row }) => (
        <Link href={`/admin/orders/${row.original.id}`} className="font-mono text-xs hover:underline">
          {row.original.id.slice(0, 12)}…
        </Link>
      ),
    },
    {
      accessorKey: "companyName",
      header: t("colCompany"),
      cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span>,
    },
    {
      accessorKey: "amount",
      header: t("colAmount"),
      cell: ({ getValue }) => {
        const v = getValue() as number;
        return <span className="text-sm font-medium">€{(v / 100).toFixed(2)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: t("colStatus"),
      cell: ({ getValue }) => {
        const v = String(getValue());
        return (
          <Badge variant={v === "paid" ? "default" : v === "pending" ? "secondary" : "destructive"}>
            {v}
          </Badge>
        );
      },
    },
    {
      accessorKey: "molliePaymentId",
      header: t("colMollieId"),
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-muted-foreground">{String(getValue() ?? "—")}</span>
      ),
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
