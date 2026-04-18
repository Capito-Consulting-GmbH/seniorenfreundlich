"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import {
  adminSetRoleAction,
  adminBanUserAction,
  adminUnbanUserAction,
} from "@/src/actions/admin/adminUserActions";
import { Shield, ShieldOff, UserX, UserCheck } from "lucide-react";

type Props = {
  userId: string;
  currentRole: string;
  isBanned: boolean;
  isSelf: boolean;
};

type Dialog = "promoteAdmin" | "demoteAdmin" | "ban" | "unban" | null;

export function UserActions({ userId, currentRole, isBanned, isSelf }: Props) {
  const t = useTranslations("admin.user");
  const ta = useTranslations("admin.user.actions");
  const [open, setOpen] = useState<Dialog>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  if (isSelf) return <p className="text-sm text-muted-foreground">{t("isSelf")}</p>;

  async function runAction(fn: () => Promise<{ success?: boolean; error?: string }>) {
    const result = await fn();
    if (result.error) throw new Error(result.error);
    setOpen(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentRole !== "admin" ? (
        <Button variant="default" size="sm" onClick={() => setOpen("promoteAdmin")}>
          <Shield className="h-4 w-4 mr-1.5" />
          {ta("promoteAdmin")}
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen("demoteAdmin")}>
          <ShieldOff className="h-4 w-4 mr-1.5" />
          {ta("removeAdmin")}
        </Button>
      )}

      {isBanned ? (
        <Button variant="outline" size="sm" onClick={() => setOpen("unban")}>
          <UserCheck className="h-4 w-4 mr-1.5" />
          {ta("unban")}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setOpen("ban")}
        >
          <UserX className="h-4 w-4 mr-1.5" />
          {ta("ban")}
        </Button>
      )}

      <ConfirmDialog
        open={open === "promoteAdmin"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={ta("promoteTitle")}
        description={ta("promoteDesc")}
        confirmLabel={ta("promoteAdmin")}
        onConfirm={async () => runAction(() => adminSetRoleAction(userId, "admin"))}
      />

      <ConfirmDialog
        open={open === "demoteAdmin"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={ta("demoteTitle")}
        description={ta("demoteDesc")}
        confirmLabel={ta("removeAdmin")}
        destructive
        onConfirm={async () => runAction(() => adminSetRoleAction(userId, "user"))}
      />

      <ConfirmDialog
        open={open === "ban"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={ta("banTitle")}
        description={ta("banDesc")}
        confirmLabel={ta("ban")}
        destructive
        withReason
        onConfirm={async (reason) => runAction(() => adminBanUserAction(userId, reason))}
      />

      <ConfirmDialog
        open={open === "unban"}
        onOpenChange={(v) => !v && setOpen(null)}
        title={ta("unbanTitle")}
        description={ta("unbanDesc")}
        confirmLabel={ta("unban")}
        onConfirm={async () => runAction(() => adminUnbanUserAction(userId))}
      />
    </div>
  );
}
