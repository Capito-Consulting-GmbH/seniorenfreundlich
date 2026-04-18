"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/src/components/admin/DataTable";
import { Badge } from "@/src/components/ui/badge";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  banned: boolean;
  createdAt: string;
};

export function UsersTable({ rows }: { rows: UserRow[] }) {
  const t = useTranslations("admin.users");

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "name",
      header: t("colName"),
      cell: ({ row }) => (
        <Link href={`/admin/users/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "email",
      header: t("colEmail"),
      cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span>,
    },
    {
      accessorKey: "role",
      header: t("colRole"),
      cell: ({ getValue }) => {
        const v = String(getValue());
        return <Badge variant={v === "admin" ? "default" : "outline"}>{v}</Badge>;
      },
    },
    {
      accessorKey: "emailVerified",
      header: t("colEmailVerified"),
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? "default" : "secondary"}>
          {getValue() ? t("verified") : t("unverified")}
        </Badge>
      ),
    },
    {
      accessorKey: "banned",
      header: t("colStatus"),
      cell: ({ getValue }) => {
        const banned = getValue() as boolean;
        return banned ? (
          <Badge variant="destructive">{t("banned")}</Badge>
        ) : (
          <Badge variant="outline">{t("active")}</Badge>
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
