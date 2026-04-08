import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { processMollieWebhook } from "@/src/services/mollieWebhookService";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let paymentId = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = await request.formData();
      paymentId = String(body.get("id") ?? "");
    } else if (contentType.includes("application/json")) {
      const body = (await request.json()) as { id?: string };
      paymentId = body.id ?? "";
    } else {
      const text = await request.text();
      const params = new URLSearchParams(text);
      paymentId = params.get("id") ?? "";
    }

    if (!paymentId) {
      return new NextResponse("ok", { status: 200 });
    }

    await processMollieWebhook(paymentId);
    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    // Return 200 so Mollie won't drop future webhook attempts on transient errors.
    return new NextResponse("ok", { status: 200 });
  }
}
