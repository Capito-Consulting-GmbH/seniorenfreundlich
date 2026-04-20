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

  // Deferred flow: company has a pending Mollie payment but no DB order yet.
  // Check Mollie directly and trigger full order+badge creation if paid.
  if (company.pendingMolliePaymentId) {
    try {
      const molliePayment = await mollieClient.payments.get(
        company.pendingMolliePaymentId
      );
      if (molliePayment.status === "paid") {
        await processMollieWebhook(company.pendingMolliePaymentId);
        // After processing, re-fetch to confirm
        const updated = await getLatestOrderByCompany(company.id);
        return NextResponse.json({ status: updated?.status ?? "paid" });
      }
      // Payment still open/pending — return a synthetic pending status so the
      // poller knows to keep checking
      return NextResponse.json({ status: "pending" });
    } catch {
      // Mollie unreachable — keep polling
      return NextResponse.json({ status: "pending" });
    }
  }

  const order = await getLatestOrderByCompany(company.id);

  // Legacy reconciliation: if DB still shows "pending", verify with Mollie.
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


