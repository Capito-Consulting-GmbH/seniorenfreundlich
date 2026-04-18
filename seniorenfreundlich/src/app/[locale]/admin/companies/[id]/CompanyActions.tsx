"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import {
  adminRevokeBadgeAction,
  adminIssueBadgeAction,
} from "@/src/actions/admin/adminBadgeActions";
import {
  adminResetVerificationAction,
  adminDeleteCompanyAction,
} from "@/src/actions/admin/adminCompanyActions";
import { Award, ShieldOff, RotateCcw, Trash2 } from "lucide-react";

type Props = {
  companyId: string;
  hasBadge: boolean;
  verified: boolean;
};

type Dialog = "revoke" | "issue" | "resetVerification" | "delete" | null;

export function CompanyActions({ companyId, hasBadge, verified }: Props) {
  const t = useTranslations("admin.company.actions");
  const [open, setOpen] = useState<Dialog>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function act(
    fn: () => Promise<{ success?: boolean; error?: string }>,
    onDone?: () => void
  ) {
    return async () => {
      const result = await fn();
      if (result.error) throw new Error(result.error);
      onDone?.();
      startTransition(() => router.refresh());
    };
  }

  return (
    <div className="flex flex-wrap gap-2">
      {hasBadge ? (
        <Button variant="destructive" size="sm" onClick={() => setOpen("revoke")}>
          <ShieldOff className="h-4 w-4 mr-1.5" />
          {t("revokeBadge")}
        </Button>
      ) : (
        <Button variant="default" size="sm" onClick={() => setOpen("issue")}>
          <Award className="h-4 w-4 mr-1.5" />
          {t("issueBadge")}
        </Button>
      )}

      {verified && (
        <Button variant="outline" size="sm" onClick={() => setOpen("resetVerification")}>
          <RotateCcw className="h-4 w-4 mr-1.5" />
          {t("resetVerification")}
        </Button>
      )}

      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setOpen("delete")}>
        <Trash2 className="h-4 w-4 mr-1.5" />
        {t("deleteCompany")}
      </Button>

      <ConfirmDialog
        open={open === "revoke"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={t("revokeBadgeTitle")}
        description={t("revokeBadgeDesc")}
        confirmLabel={t("revokeBadge")}
        destructive
        withReason
        onConfirm={(reason) =>
          act(async () => adminRevokeBadgeAction(companyId, reason), () => setOpen(null))()
        }
      />

      <ConfirmDialog
        open={open === "issue"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={t("issueBadgeTitle")}
        description={t("issueBadgeDesc")}
        confirmLabel={t("issueBadge")}
        withReason
        onConfirm={(reason) =>
          act(async () => adminIssueBadgeAction(companyId, reason), () => setOpen(null))()
        }
      />

      <ConfirmDialog
        open={open === "resetVerification"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={t("resetVerificationTitle")}
        description={t("resetVerificationDesc")}
        confirmLabel={t("resetVerification")}
        destructive
        withReason
        onConfirm={(reason) =>
          act(async () => adminResetVerificationAction(companyId, reason), () => setOpen(null))()
        }
      />

      <ConfirmDialog
        open={open === "delete"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={t("deleteTitle")}
        description={t("deleteDesc")}
        confirmLabel={t("deleteCompany")}
        destructive
        requireConfirmText="delete"
        onConfirm={act(async () => adminDeleteCompanyAction(companyId), () => router.push("/admin/companies"))}
      />
    </div>
  );
}
