"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/auth/isAdmin";
import { auth } from "@/src/lib/auth";
import { writeAuditEvent } from "@/src/services/auditService";

export type AdminActionState = { success?: boolean; error?: string };

export async function adminSetRoleAction(
  targetUserId: string,
  role: "user" | "admin"
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (admin.userId === targetUserId) return { error: "Cannot change your own role." };

  await auth.api.setRole({
    headers: await headers(),
    body: { userId: targetUserId, role },
  });

  await writeAuditEvent({
    entityType: "user",
    entityId: targetUserId,
    action: "admin_role_changed",
    actorId: admin.userId,
    metadata: { newRole: role },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);
  return { success: true };
}

export async function adminBanUserAction(
  targetUserId: string,
  reason: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (admin.userId === targetUserId) return { error: "Cannot ban yourself." };

  await auth.api.banUser({
    headers: await headers(),
    body: { userId: targetUserId, banReason: reason },
  });

  await writeAuditEvent({
    entityType: "user",
    entityId: targetUserId,
    action: "admin_user_banned",
    actorId: admin.userId,
    metadata: { banReason: reason },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);
  return { success: true };
}

export async function adminUnbanUserAction(
  targetUserId: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  await auth.api.unbanUser({
    headers: await headers(),
    body: { userId: targetUserId },
  });

  await writeAuditEvent({
    entityType: "user",
    entityId: targetUserId,
    action: "admin_user_unbanned",
    actorId: admin.userId,
    metadata: {},
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);
  return { success: true };
}
