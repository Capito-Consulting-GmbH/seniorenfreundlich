import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import { getLatestOrderByCompany } from "@/src/services/orderService";
import { mollieClient } from "@/src/mollie/mollie";
import { startCheckoutAction } from "@/src/actions/startCheckout";
import RevokeBadgeForm from "./RevokeBadgeForm";
import PaymentPoller from "../billing/PaymentPoller";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BadgePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const tBadge = await getTranslations("dashboard.badge");
  const tBilling = await getTranslations("dashboard.billing");

  let company = null;
  try {
    company = await getCurrentCompany();
  } catch {
    redirect("/");
  }

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  const params = await searchParams;

  // Check if a payment is currently in flight (survives reloads via live Mollie API check)
  let showPaymentPoller = false;
  const latestOrder = await getLatestOrderByCompany(company.id);
  if (latestOrder?.status === "pending" && latestOrder.molliePaymentId !== null) {
    try {
      const molliePayment = await mollieClient.payments.get(latestOrder.molliePaymentId);
      showPaymentPoller =
        molliePayment.status !== "open" &&
        molliePayment.status !== "canceled";
    } catch {
      // Mollie API unreachable — do NOT show poller; user may not have purchased
      showPaymentPoller = false;
    }
  }

  const badge = await getActiveBadgeForCompany(company.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">{tBadge("title")}</h1>

      {showPaymentPoller && <PaymentPoller />}

      {params.error === "badge-active" && (
        <Alert className="mt-4">
          <AlertDescription>{tBilling("badgeAlready")}</AlertDescription>
        </Alert>
      )}
      {params.error === "no-checkout-url" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{tBilling("errorNoCheckout")}</AlertDescription>
        </Alert>
      )}
      {params.error === "not-verified" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{tBilling("notVerified")}</AlertDescription>
        </Alert>
      )}

      {badge ? (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{tBadge("status")}</p>
              <Badge className="gap-2 rounded-full border border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                {tBadge("statusActive")}
              </Badge>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">{tBadge("assertionId")}</p>
            <p className="font-mono text-xs text-foreground break-all">{badge.assertionId}</p>

            <p className="mt-6 text-sm text-muted-foreground">{tBadge("certificate")}</p>
            <div className="mt-2">
              <Button variant="outline" className="gap-2" asChild>
                <Link href={`/certificate/${company.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {tBadge("viewCertificate")}
                </Link>
              </Button>
            </div>

            <RevokeBadgeForm />
          </CardContent>
        </Card>
      ) : !showPaymentPoller ? (
        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{tBilling("product")}</p>
            <p className="text-lg font-medium text-foreground">{tBilling("productName")}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{tBilling("price")}</p>

            {company.verificationStatus !== "verified" ? (
              <Alert className="mt-6">
                <AlertDescription>{tBilling("notVerifiedGate")}</AlertDescription>
              </Alert>
            ) : (
              <form action={startCheckoutAction} className="mt-6">
                <Button type="submit">{tBilling("buy")}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
