import { env } from "@/src/env";
import { mollieClient } from "./mollie";

type CreatePaymentArgs = {
  companyId: string;
  companyName: string;
};

export async function createMolliePayment({
  companyId,
  companyName,
}: CreatePaymentArgs) {
  const payment = await mollieClient.payments.create({
    amount: {
      currency: "EUR",
      value: "99.00",
    },
    description: `Seniorenfreundlich-Siegel fuer ${companyName}`,
    redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=returned`,
    webhookUrl: env.MOLLIE_WEBHOOK_URL,
    metadata: {
      companyId,
    },
  });

  return payment;
}
