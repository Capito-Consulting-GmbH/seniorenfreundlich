"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  /** If set, user must type this string to confirm */
  requireConfirmText?: string;
  /** If true, show a reason textarea */
  withReason?: boolean;
  onConfirm: (reason: string) => Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = false,
  requireConfirmText,
  withReason = false,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useTranslations("admin.common");
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const resolvedLabel = confirmLabel ?? t("confirm");

  const canConfirm =
    (!requireConfirmText || confirmText === requireConfirmText) &&
    (!withReason || reason.trim().length >= 3);

  function handleClose(v: boolean) {
    if (!isPending) {
      setReason("");
      setConfirmText("");
      setError(null);
      onOpenChange(v);
    }
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await onConfirm(reason.trim());
        handleClose(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An error occurred.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {withReason && (
            <div className="space-y-1.5">
              <Label htmlFor="reason">{t("reasonLabel")} <span className="text-destructive">*</span></Label>
              <Textarea
                id="reason"
                placeholder={t("reasonPlaceholder")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                disabled={isPending}
              />
            </div>
          )}

          {requireConfirmText && (
            <div className="space-y-1.5">
              <Label htmlFor="confirm-text">
                {t("confirmTextLabel")}
              </Label>
              <Input
                id="confirm-text"
                placeholder={requireConfirmText}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isPending}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={!canConfirm || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {resolvedLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
