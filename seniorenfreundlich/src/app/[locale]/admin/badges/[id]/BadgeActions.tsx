"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { adminReactivateBadgeAction } from "@/src/actions/admin/adminBadgeActions";
import { adminRevokeBadgeAction } from "@/src/actions/admin/adminBadgeActions";
import { ShieldCheck, ShieldOff } from "lucide-react";

type Props = {
  badgeId: string;
  companyId: string;
  status: "active" | "revoked";
};

type Dialog = "revoke" | "reactivate" | null;

export function BadgeActions({ badgeId, companyId, status }: Props) {
  const t = useTranslations("admin.badge.actions");
  const [open, setOpen] = useState<Dialog>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {status === "active" ? (
        <Button variant="destructive" size="sm" onClick={() => setOpen("revoke")}>
          <ShieldOff className="h-4 w-4 mr-1.5" />
          {t("revoke")}
        </Button>
      ) : (
        <Button variant="default" size="sm" onClick={() => setOpen("reactivate")}>
          <ShieldCheck className="h-4 w-4 mr-1.5" />
          {t("reactivate")}
        </Button>
      )}

      <ConfirmDialog
        open={open === "revoke"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={t("revokeTitle")}
        description={t("revokeDesc")}
        confirmLabel={t("revoke")}
        destructive
        withReason
        onConfirm={async (reason) => {
          const result = await adminRevokeBadgeAction(companyId, reason);
          if (result.error) throw new Error(result.error);
          setOpen(null);
          startTransition(() => router.refresh());
        }}
      />

      <ConfirmDialog
        open={open === "reactivate"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={t("reactivateTitle")}
        description={t("reactivateDesc")}
        confirmLabel={t("reactivate")}
        withReason
        onConfirm={async (reason) => {
          const result = await adminReactivateBadgeAction(badgeId, reason);
          if (result.error) throw new Error(result.error);
          setOpen(null);
          startTransition(() => router.refresh());
        }}
      />
    </div>
  );
}
