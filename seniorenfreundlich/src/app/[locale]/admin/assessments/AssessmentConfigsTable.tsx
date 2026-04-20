"use client";

import Link from "next/link";
import { useRouter } from "@/src/i18n/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/src/components/admin/DataTable";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Copy, Pencil, Trash2 } from "lucide-react";
import {
  duplicateConfigAction,
  deleteConfigAction,
} from "@/src/actions/admin/adminAssessmentActions";

export type ConfigRow = {
  id: string;
  version: number;
  status: string;
  title: { de: string; en: string };
  createdByName: string;
  createdAt: string;
};

function DuplicateButton({ configId }: { configId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateConfigAction(configId);
      if (result.newConfigId) {
        router.push(`/admin/assessments/builder/${result.newConfigId}`);
      }
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDuplicate} disabled={isPending}>
      <Copy className="h-3.5 w-3.5" />
    </Button>
  );
}

function DeleteConfigButton({ configId }: { configId: string }) {
  const t = useTranslations("admin.assessments");
  const tCommon = useTranslations("admin.common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteConfigAction(configId);
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Fehler");
      }
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteConfigTitle")}</DialogTitle>
            <DialogDescription>{t("deleteConfigDesc")}</DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "…" : t("deleteConfigConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AssessmentConfigsTable({ rows }: { rows: ConfigRow[] }) {
  const t = useTranslations("admin.assessments");

  const columns: ColumnDef<ConfigRow>[] = [
    {
      accessorKey: "version",
      header: t("colVersion"),
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold">v{row.original.version}</span>
      ),
    },
    {
      accessorKey: "title",
      header: t("colTitle"),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.title.de}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("colStatus"),
      cell: ({ getValue }) => {
        const v = String(getValue());
        const variant =
          v === "active" ? "default" : v === "draft" ? "secondary" : "outline";
        const label =
          v === "active"
            ? t("statusActive")
            : v === "draft"
            ? t("statusDraft")
            : t("statusArchived");
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "createdByName",
      header: t("colCreatedBy"),
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("colCreatedAt"),
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{String(getValue())}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          {row.original.status !== "archived" && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/assessments/builder/${row.original.id}`}>
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
          <DuplicateButton configId={row.original.id} />
          {row.original.status === "draft" && (
            <DeleteConfigButton configId={row.original.id} />
          )}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={rows} />;
}

