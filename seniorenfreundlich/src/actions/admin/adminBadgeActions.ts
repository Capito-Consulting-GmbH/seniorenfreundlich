"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/auth/isAdmin";
import {
  getActiveBadgeForCompany,
  getBadgeById,
  createBadge,
  reactivateBadge,
} from "@/src/services/badgeService";
import { revokeBadge as revokeBadgeById } from "@/src/services/badgeService";
import { getCompanyById } from "@/src/services/companyService";
import { writeAuditEvent } from "@/src/services/auditService";

export type AdminActionState = { success?: boolean; error?: string };

export async function adminRevokeBadgeAction(
  companyId: string,
  reason: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  const badge = await getActiveBadgeForCompany(companyId);
  if (!badge) return { error: "No active badge found." };

  await revokeBadgeById(badge.id);
  await writeAuditEvent({
    entityType: "badge",
    entityId: badge.id,
    action: "admin_badge_revoked",
    actorId: admin.userId,
    metadata: { companyId, adminReason: reason },
  });

  const company = await getCompanyById(companyId);
  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${companyId}`);
  if (company) {
    revalidatePath(`/certificate/${company.slug}`);
    revalidatePath(`/companies/${company.slug}`);
  }

  return { success: true };
}

export async function adminIssueBadgeAction(
  companyId: string,
  reason: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  // Revoke existing active badge first to avoid duplicates
  const existing = await getActiveBadgeForCompany(companyId);
  if (existing) await revokeBadgeById(existing.id);

  const badge = await createBadge(companyId);
  await writeAuditEvent({
    entityType: "badge",
    entityId: badge.id,
    action: "admin_badge_issued",
    actorId: admin.userId,
    metadata: { companyId, adminReason: reason },
  });

  const company = await getCompanyById(companyId);
  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${companyId}`);
  if (company) {
    revalidatePath(`/certificate/${company.slug}`);
    revalidatePath(`/companies/${company.slug}`);
  }

  return { success: true };
}

export async function adminReactivateBadgeAction(
  badgeId: string,
  reason: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  const badge = await getBadgeById(badgeId);
  if (!badge) return { error: "Badge not found." };

  await reactivateBadge(badgeId);
  await writeAuditEvent({
    entityType: "badge",
    entityId: badgeId,
    action: "admin_badge_reactivated",
    actorId: admin.userId,
    metadata: { companyId: badge.companyId, adminReason: reason },
  });

  revalidatePath("/admin/badges");
  revalidatePath(`/admin/badges/${badgeId}`);

  return { success: true };
}
