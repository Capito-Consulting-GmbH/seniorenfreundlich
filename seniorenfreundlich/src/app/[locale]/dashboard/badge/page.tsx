import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getBadgesForCompany } from "@/src/services/badgeService";
import { getApprovedSubmissionByCompanyAndTier } from "@/src/services/assessmentSubmissionService";
import { getActiveConfigByTier } from "@/src/services/assessmentConfigService";
import { startCheckoutAction } from "@/src/actions/startCheckout";
import RevokeBadgeForm from "./RevokeBadgeForm";
import PaymentPoller from "../billing/PaymentPoller";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { ExternalLink } from "lucide-react";
import type { Badge as BadgeRow } from "@/src/services/badgeService";

export const dynamic = "force-dynamic";

type Tier = "basic" | "standard" | "premium";
const TIERS: Tier[] = ["basic", "standard", "premium"];

export default async function BadgePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tier?: string; checkout?: string }>;
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
  const showPaymentPoller =
    params.checkout === "returned" || !!company.pendingMolliePaymentId;

  // Load all data in parallel
  const [allBadges, basicApproved, standardApproved, premiumApproved, basicConfig, standardConfig, premiumConfig] =
    await Promise.all([
      getBadgesForCompany(company.id),
      getApprovedSubmissionByCompanyAndTier(company.id, "basic"),
      getApprovedSubmissionByCompanyAndTier(company.id, "standard"),
      getApprovedSubmissionByCompanyAndTier(company.id, "premium"),
      getActiveConfigByTier("basic"),
      getActiveConfigByTier("standard"),
      getActiveConfigByTier("premium"),
    ]);

  const activeBadgeByTier: Record<Tier, BadgeRow | undefined> = {
    basic:    allBadges.find((b) => b.tier === "basic"    && b.status === "active"),
    standard: allBadges.find((b) => b.tier === "standard" && b.status === "active"),
    premium:  allBadges.find((b) => b.tier === "premium"  && b.status === "active"),
  };

  const approvedByTier = { basic: basicApproved, standard: standardApproved, premium: premiumApproved };
  const configByTier = { basic: basicConfig, standard: standardConfig, premium: premiumConfig };

  const tierPrices: Record<Tier, string> = { basic: "49,00 EUR", standard: "99,00 EUR", premium: "149,00 EUR" };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-foreground">{tBadge("title")}</h1>

      {showPaymentPoller && <PaymentPoller />}

      {params.error === "not-verified" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{tBilling("notVerified")}</AlertDescription>
        </Alert>
      )}
      {params.error === "no-checkout-url" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{tBilling("errorNoCheckout")}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const activeBadge = activeBadgeByTier[tier];
          const approved = approvedByTier[tier];
          const config = configByTier[tier];
          const tierLabel = tBilling(`tier_${tier}` as Parameters<typeof tBilling>[0]);
          const price = tierPrices[tier];
          const isError = params.error && params.tier === tier;

          return (
            <Card key={tier} className={activeBadge ? "border-green-300" : undefined}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tierLabel}</CardTitle>
                <p className="text-2xl font-bold text-foreground">{price}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeBadge ? (
                  <>
                    <Badge className="gap-1.5 rounded-full border border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                      </span>
                      {tBadge("statusActive")}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-mono break-all">{activeBadge.assertionId}</p>
                    <Button variant="outline" size="sm" className="gap-1.5 w-full" asChild>
                      <Link href={`/certificate/${company.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {tBadge("viewCertificate")}
                      </Link>
                    </Button>
                    <RevokeBadgeForm />
                  </>
                ) : company.verificationStatus !== "verified" ? (
                  <p className="text-xs text-muted-foreground">{tBilling("notVerifiedGate")}</p>
                ) : !config ? (
                  <p className="text-xs text-muted-foreground">{tBilling("noConfigForTier")}</p>
                ) : !approved ? (
                  <p className="text-xs text-muted-foreground">{tBilling("noApprovedAssessmentGate")}</p>
                ) : (
                  <>
                    {isError && (
                      <p className="text-xs text-destructive">{tBilling("errorNoCheckout")}</p>
                    )}
                    <form action={startCheckoutAction.bind(null, tier)}>
                      <Button type="submit" size="sm" className="w-full">{tBilling("buy")}</Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

