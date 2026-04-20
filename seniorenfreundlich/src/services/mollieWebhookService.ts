import { eq } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";
import { db } from "@/src/db/db";
import { companies } from "@/src/db/schema";
import { mollieClient } from "@/src/mollie/mollie";
import { TIER_CONFIG } from "@/src/mollie/createPayment";
import {
  getOrderByMolliePaymentId,
  createPaidOrder,
  markOrderPaid,
} from "@/src/services/orderService";
import { createBadge, getActiveBadgeForCompany } from "@/src/services/badgeService";
import { writeAuditEvent } from "@/src/services/auditService";
import { sendBadgeIssuedEmail } from "@/src/email/brevo";

export async function processMollieWebhook(paymentId: string): Promise<void> {
  const payment = await mollieClient.payments.get(paymentId);

  const isPaid = payment.status === "paid";
  if (!isPaid) return;

  // Check if we already have an order for this payment (webhook re-delivery)
  const existingOrder = await getOrderByMolliePaymentId(payment.id);
  if (existingOrder?.status === "paid") return; // Already processed, idempotent

  // Read tier and companyId from Mollie metadata
  const meta = payment.metadata as { companyId?: string; tier?: string } | null;
  const companyId = meta?.companyId;
  const tier = (meta?.tier ?? "basic") as "basic" | "standard" | "premium";

  if (!companyId) {
    Sentry.captureMessage("Mollie webhook: missing companyId in metadata", {
      extra: { paymentId },
    });
    return;
  }

  const tierConf = TIER_CONFIG[tier] ?? TIER_CONFIG.basic;

  let order;
  if (existingOrder) {
    // Pending order exists (legacy flow) — just mark it paid
    order = await markOrderPaid(existingOrder.id);
  } else {
    // Deferred order creation (new flow) — create order directly as paid
    order = await createPaidOrder({
      companyId,
      molliePaymentId: payment.id,
      amount: tierConf.amountCents,
      currency: "EUR",
      tier,
    });
  }

  // Clear the pending payment flag on the company
  await db
    .update(companies)
    .set({ pendingMolliePaymentId: null, updatedAt: new Date() })
    .where(eq(companies.id, companyId));

  // Issue badge (revoke old one for this tier if exists)
  const existingBadge = await getActiveBadgeForCompany(companyId, tier);
  const badge = existingBadge ?? (await createBadge(companyId, tier));

  await writeAuditEvent({
    entityType: "order",
    entityId: order.id,
    action: "payment_confirmed",
    actorId: "mollie:webhook",
    metadata: { paymentId: payment.id, tier },
  });

  await writeAuditEvent({
    entityType: "badge",
    entityId: badge.id,
    action: "badge_active",
    actorId: "mollie:webhook",
    metadata: { companyId, assertionId: badge.assertionId, tier },
  });

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (company?.email) {
    try {
      await sendBadgeIssuedEmail({
        toEmail: company.email,
        companyName: company.name,
        companySlug: company.slug,
      });
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}


