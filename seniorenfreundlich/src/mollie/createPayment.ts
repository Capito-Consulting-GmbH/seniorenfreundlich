import { env } from "@/src/env";
import { mollieClient } from "./mollie";

type Tier = "basic" | "standard" | "premium";

const TIER_CONFIG: Record<Tier, { amount: string; amountCents: number; label: string }> = {
  basic:    { amount: "49.00", amountCents: 4900,  label: "Basic" },
  standard: { amount: "99.00", amountCents: 9900,  label: "Standard" },
  premium:  { amount: "149.00", amountCents: 14900, label: "Premium" },
};

type CreatePaymentArgs = {
  companyId: string;
  companyName: string;
  tier: Tier;
};

export async function createMolliePayment({
  companyId,
  companyName,
  tier,
}: CreatePaymentArgs) {
  const { amount, label } = TIER_CONFIG[tier];

  const payment = await mollieClient.payments.create({
    amount: {
      currency: "EUR",
      value: amount,
    },
    description: `Seniorenfreundlich-Siegel ${label} fuer ${companyName}`,
    redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/badge?checkout=returned`,
    webhookUrl: env.MOLLIE_WEBHOOK_URL,
    metadata: {
      companyId,
      tier,
    },
  });

  return payment;
}

export { TIER_CONFIG };
