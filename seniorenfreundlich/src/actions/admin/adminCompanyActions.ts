"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/auth/isAdmin";
import {
  getCompanyById,
  deleteCompany,
  updateCompany,
} from "@/src/services/companyService";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import { writeAuditEvent } from "@/src/services/auditService";

export type AdminActionState = { success?: boolean; error?: string };

export async function adminResetVerificationAction(
  companyId: string,
  reason: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  const company = await getCompanyById(companyId);
  if (!company) return { error: "Company not found." };

  await updateCompany(companyId, {
    verificationStatus: "unverified",
    verifiedAt: null,
    verificationToken: null,
    verificationAttempts: 0,
  });

  await writeAuditEvent({
    entityType: "company",
    entityId: companyId,
    action: "admin_verification_reset",
    actorId: admin.userId,
    metadata: { adminReason: reason },
  });

  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${companyId}`);

  return { success: true };
}

export async function adminDeleteCompanyAction(
  companyId: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  const badge = await getActiveBadgeForCompany(companyId);
  if (badge) return { error: "Cannot delete a company with an active badge. Revoke the badge first." };

  const company = await getCompanyById(companyId);
  if (!company) return { error: "Company not found." };

  await writeAuditEvent({
    entityType: "company",
    entityId: companyId,
    action: "admin_company_deleted",
    actorId: admin.userId,
    metadata: { companyName: company.name, companySlug: company.slug },
  });

  await deleteCompany(companyId);

  revalidatePath("/admin/companies");

  return { success: true };
}
