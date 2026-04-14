import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";

export const dynamic = "force-dynamic";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import { getLatestOrderByCompany } from "@/src/services/orderService";
import { mollieClient } from "@/src/mollie/mollie";
import { startCheckoutAction } from "@/src/actions/startCheckout";
import PaymentPoller from "./PaymentPoller";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkout?: string }>;
}) {
  const t = await getTranslations("dashboard.billing");

  let company = null;
  try {
    company = await getCurrentCompany();
  } catch {
    redirect("/");
  }

  const params = await searchParams;

  if (!company) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("noOnboarding")}</p>
      </div>
    );
  }

  // Always check for an in-progress payment, regardless of URL params.
  // This ensures the poller survives reloads and direct navigation to the page.
  // We consult Mollie directly so we can distinguish:
  //   "open"     = user navigated away / clicked Previous page without paying → no spinner
  //   "canceled" = user explicitly canceled → no spinner
  //   anything else (paid, authorized, …) = payment in flight → show spinner
  let showPaymentPoller = false;
  const latestOrder = await getLatestOrderByCompany(company.id);
  if (latestOrder?.status === "paid") {
    redirect("/dashboard/badge");
  } else if (latestOrder?.status === "pending" && latestOrder.molliePaymentId !== null) {
    try {
      const molliePayment = await mollieClient.payments.get(
        latestOrder.molliePaymentId
      );
      showPaymentPoller =
        molliePayment.status !== "open" &&
        molliePayment.status !== "canceled";
    } catch {
      // Mollie API unreachable – show the poller as a safe fallback
      showPaymentPoller = true;
    }
  }

  const activeBadge = await getActiveBadgeForCompany(company.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

      {showPaymentPoller && <PaymentPoller />}

      {params.error === "badge-active" && (
        <Alert className="mt-4">
          <AlertDescription>{t("badgeAlready")}</AlertDescription>
        </Alert>
      )}

      {params.error === "no-checkout-url" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{t("errorNoCheckout")}</AlertDescription>
        </Alert>
      )}

      {params.error === "not-verified" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{t("notVerified")}</AlertDescription>
        </Alert>
      )}

      <Card className="mt-8">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{t("product")}</p>
          <p className="text-lg font-medium text-foreground">{t("productName")}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{t("price")}</p>

          {activeBadge ? (
            <Alert className="mt-6">
              <AlertDescription>{t("badgeActive")}</AlertDescription>
            </Alert>
          ) : company.verificationStatus !== "verified" ? (
            <Alert className="mt-6">
              <AlertDescription>{t("notVerifiedGate")}</AlertDescription>
            </Alert>
          ) : (
            <form action={startCheckoutAction} className="mt-6">
              <Button type="submit" disabled={showPaymentPoller}>
                {t("buy")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
