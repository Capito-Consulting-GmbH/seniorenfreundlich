"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { revokeBadgeAction, type RevokeBadgeState } from "@/src/actions/revokeBadge";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

const initialState: RevokeBadgeState = {};

export default function RevokeBadgeForm() {
  const t = useTranslations("dashboard.badge");
  const [state, formAction, pending] = useActionState(revokeBadgeAction, initialState);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className="mt-6"
        onClick={() => setOpen(true)}
      >
        {t("revokeButton")}
      </Button>

      {state.error && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state.success && (
        <Alert className="mt-3">
          <AlertDescription>{t("revokeSuccess")}</AlertDescription>
        </Alert>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("revokeConfirm")}</DialogTitle>
            <DialogDescription>{t("revokeConfirmDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("revokeCancel")}
            </Button>
            <form action={formAction}>
              <Button
                type="submit"
                variant="destructive"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                {pending ? t("revoking") : t("revokeButton")}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
