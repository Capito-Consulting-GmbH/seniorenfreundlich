"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import {
  adminMarkOrderRefundedAction,
  adminReconcileOrderAction,
} from "@/src/actions/admin/adminOrderActions";
import { RefreshCw, RotateCcw } from "lucide-react";

type Props = {
  orderId: string;
  status: string;
};

type Dialog = "refund" | null;

export function OrderActions({ orderId, status }: Props) {
  const t = useTranslations("admin.order.actions");
  const [open, setOpen] = useState<Dialog>(null);
  const [reconciling, setReconciling] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function reconcile() {
    setReconciling(true);
    try {
      await adminReconcileOrderAction(orderId);
      startTransition(() => router.refresh());
    } finally {
      setReconciling(false);
    }
  }

  function handleRefund(reason: string) {
    return adminMarkOrderRefundedAction(orderId, reason).then((res) => {
      if (res.error) throw new Error(res.error);
      setOpen(null);
      startTransition(() => router.refresh());
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={reconcile} disabled={reconciling}>
        <RefreshCw className={`h-4 w-4 mr-1.5 ${reconciling ? "animate-spin" : ""}`} />
        {t("reconcile")}
      </Button>

      {status !== "refunded" && (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setOpen("refund")}
        >
          <RotateCcw className="h-4 w-4 mr-1.5" />
          {t("markRefunded")}
        </Button>
      )}

      <ConfirmDialog
        open={open === "refund"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={t("markRefundedTitle")}
        description={t("markRefundedDesc")}
        confirmLabel={t("markRefunded")}
        destructive
        withReason
        onConfirm={handleRefund}
      />
    </div>
  );
}
