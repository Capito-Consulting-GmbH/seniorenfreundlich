import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getLatestOrderByCompany } from "@/src/services/orderService";
import { mollieClient } from "@/src/mollie/mollie";
import { processMollieWebhook } from "@/src/services/mollieWebhookService";

export async function GET() {
  let company = null;
  try {
    company = await getCurrentCompany();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!company) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const order = await getLatestOrderByCompany(company.id);

  // Lazy reconciliation: if DB still shows "pending", verify with Mollie directly.
  // This self-heals missed or delayed webhooks. processMollieWebhook is idempotent
  // and runs the full paid flow (badge creation, audit events, email) if needed.
  if (order?.status === "pending" && order.molliePaymentId) {
    try {
      const molliePayment = await mollieClient.payments.get(order.molliePaymentId);
      if (molliePayment.status === "paid") {
        await processMollieWebhook(order.molliePaymentId);
        const updated = await getLatestOrderByCompany(company.id);
        return NextResponse.json({ status: updated?.status ?? null });
      }
    } catch {
      // Mollie unreachable — return DB status and let the poller retry next tick
    }
  }

  return NextResponse.json({ status: order?.status ?? null });
}
