"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getActiveBadgeForCompany, revokeBadge as revokeBadgeById } from "@/src/services/badgeService";
import { writeAuditEvent } from "@/src/services/auditService";

export type RevokeBadgeState = {
  success?: boolean;
  error?: string;
};

export async function revokeBadgeAction(): Promise<RevokeBadgeState> {
  const company = await getCurrentCompany();

  if (!company) {
    return { error: "Kein Unternehmensprofil gefunden." };
  }

  const badge = await getActiveBadgeForCompany(company.id);
  if (!badge) {
    return { error: "Kein aktives Siegel vorhanden." };
  }

  await revokeBadgeById(badge.id);

  await writeAuditEvent({
    entityType: "badge",
    entityId: badge.id,
    action: "badge_revoked",
    actorId: company.ownerClerkUserId,
    metadata: { companyId: company.id },
  });

  revalidatePath("/dashboard/badge");
  revalidatePath(`/certificate/${company.slug}`);
  revalidatePath(`/companies/${company.slug}`);

  return { success: true };
}
