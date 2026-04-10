import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
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

  const activeBadge = await getActiveBadgeForCompany(company.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

      {params.checkout === "returned" && <PaymentPoller />}

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

      <Card className="mt-8">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{t("product")}</p>
          <p className="text-lg font-medium text-foreground">{t("productName")}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{t("price")}</p>

          {activeBadge ? (
            <Alert className="mt-6">
              <AlertDescription>{t("badgeActive")}</AlertDescription>
            </Alert>
          ) : (
            <form action={startCheckoutAction} className="mt-6">
              <Button type="submit">{t("buy")}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
