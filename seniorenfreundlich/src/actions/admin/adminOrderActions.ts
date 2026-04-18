"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/auth/isAdmin";
import { getOrderById, markOrderRefunded } from "@/src/services/orderService";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import { revokeBadge } from "@/src/services/badgeService";
import { writeAuditEvent } from "@/src/services/auditService";
import { mollieClient } from "@/src/mollie/mollie";
import { processMollieWebhook } from "@/src/services/mollieWebhookService";

export type AdminActionState = { success?: boolean; error?: string };

export async function adminMarkOrderRefundedAction(
  orderId: string,
  reason: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  const order = await getOrderById(orderId);
  if (!order) return { error: "Order not found." };

  await markOrderRefunded(orderId);

  // Revoke active badge for this company if any
  const badge = await getActiveBadgeForCompany(order.companyId);
  if (badge) {
    await revokeBadge(badge.id);
    await writeAuditEvent({
      entityType: "badge",
      entityId: badge.id,
      action: "admin_badge_revoked",
      actorId: admin.userId,
      metadata: { reason: "order_refunded", orderId, adminReason: reason },
    });
  }

  await writeAuditEvent({
    entityType: "order",
    entityId: orderId,
    action: "admin_order_refunded",
    actorId: admin.userId,
    metadata: { adminReason: reason },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/companies");

  return { success: true };
}

export async function adminReconcileOrderAction(
  orderId: string
): Promise<AdminActionState & { mollieStatus?: string }> {
  await requireAdmin();

  const order = await getOrderById(orderId);
  if (!order) return { error: "Order not found." };
  if (!order.molliePaymentId) return { error: "No Mollie payment ID on this order." };

  try {
    const payment = await mollieClient.payments.get(order.molliePaymentId);
    if (payment.status === "paid" && order.status !== "paid") {
      await processMollieWebhook(order.molliePaymentId);
    }
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, mollieStatus: payment.status };
  } catch {
    return { error: "Failed to reach Mollie API." };
  }
}
