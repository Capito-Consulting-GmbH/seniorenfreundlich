"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { createMolliePayment } from "@/src/mollie/createPayment";
import { db } from "@/src/db/db";
import { companies } from "@/src/db/schema";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import { getApprovedSubmissionByCompanyAndTier } from "@/src/services/assessmentSubmissionService";
import { getActiveConfigByTier } from "@/src/services/assessmentConfigService";
import { writeAuditEvent } from "@/src/services/auditService";

export async function startCheckoutAction(
  tier: "basic" | "standard" | "premium"
): Promise<void> {
  let company = null;
  try {
    company = await getCurrentCompany();
  } catch {
    redirect("/");
  }

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  if (company.verificationStatus !== "verified") {
    redirect(`/dashboard/badge?error=not-verified`);
  }

  const activeBadge = await getActiveBadgeForCompany(company.id, tier);
  if (activeBadge) {
    redirect(`/dashboard/badge?error=badge-active&tier=${tier}`);
  }

  // Require an approved assessment for this tier's active config
  const activeConfig = await getActiveConfigByTier(tier);
  if (!activeConfig) {
    redirect(`/dashboard/badge?error=no-config&tier=${tier}`);
  }

  const approvedSubmission = await getApprovedSubmissionByCompanyAndTier(
    company.id,
    tier
  );
  if (!approvedSubmission) {
    redirect(`/dashboard/badge?error=no-approved-assessment&tier=${tier}`);
  }

  // Create Mollie payment only — do NOT create a DB order yet (deferred)
  const payment = await createMolliePayment({
    companyId: company.id,
    companyName: company.name,
    tier,
  });

  // Store the pending payment ID on the company record so the poller can track it
  await db
    .update(companies)
    .set({ pendingMolliePaymentId: payment.id, updatedAt: new Date() })
    .where(eq(companies.id, company.id));

  await writeAuditEvent({
    entityType: "company",
    entityId: company.id,
    action: "checkout_initiated",
    actorId: company.ownerUserId,
    metadata: {
      molliePaymentId: payment.id,
      tier,
    },
  });

  const checkoutUrl = payment.getCheckoutUrl();
  if (!checkoutUrl) {
    redirect("/dashboard/badge?error=no-checkout-url");
  }

  redirect(checkoutUrl);
}


