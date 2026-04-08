import { eq } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";
import { db } from "@/src/db/db";
import { companies } from "@/src/db/schema";
import { mollieClient } from "@/src/mollie/mollie";
import { getOrderByMolliePaymentId, markOrderPaid } from "@/src/services/orderService";
import { createBadge, getActiveBadgeForCompany } from "@/src/services/badgeService";
import { writeAuditEvent } from "@/src/services/auditService";
import { sendBadgeIssuedEmail } from "@/src/email/brevo";

export async function processMollieWebhook(paymentId: string): Promise<void> {
  const payment = await mollieClient.payments.get(paymentId);
  const order = await getOrderByMolliePaymentId(payment.id);

  if (!order) {
    return;
  }

  // Idempotency: order already paid, webhook can be safely ignored.
  if (order.status === "paid") {
    return;
  }

  const isPaid = payment.status === "paid";

  if (!isPaid) {
    return;
  }

  await markOrderPaid(order.id);

  let badge = await getActiveBadgeForCompany(order.companyId);
  if (!badge) {
    badge = await createBadge(order.companyId);
  }

  await writeAuditEvent({
    entityType: "order",
    entityId: order.id,
    action: "payment_confirmed",
    actorId: "mollie:webhook",
    metadata: { paymentId: payment.id },
  });

  await writeAuditEvent({
    entityType: "badge",
    entityId: badge.id,
    action: "badge_active",
    actorId: "mollie:webhook",
    metadata: { companyId: order.companyId, assertionId: badge.assertionId },
  });

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, order.companyId))
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
