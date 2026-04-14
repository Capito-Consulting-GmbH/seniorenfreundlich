"use server";

import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { createMolliePayment } from "@/src/mollie/createPayment";
import { createOrder } from "@/src/services/orderService";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import { writeAuditEvent } from "@/src/services/auditService";

export async function startCheckoutAction(): Promise<void> {
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
    redirect("/dashboard/badge?error=not-verified");
  }

  const activeBadge = await getActiveBadgeForCompany(company.id);
  if (activeBadge) {
    redirect("/dashboard/badge?error=badge-active");
  }

  const payment = await createMolliePayment({
    companyId: company.id,
    companyName: company.name,
  });

  await createOrder({
    companyId: company.id,
    molliePaymentId: payment.id,
    amount: 9900,
    currency: "EUR",
    status: "pending",
  });

  await writeAuditEvent({
    entityType: "order",
    entityId: payment.id,
    action: "checkout_started",
    actorId: company.ownerUserId,
    metadata: {
      molliePaymentId: payment.id,
      amount: 9900,
      currency: "EUR",
    },
  });

  const checkoutUrl = payment.getCheckoutUrl();
  if (!checkoutUrl) {
    redirect("/dashboard/badge?error=no-checkout-url");
  }

  redirect(checkoutUrl);
}
