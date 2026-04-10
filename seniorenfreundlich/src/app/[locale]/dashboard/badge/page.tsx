import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import RevokeBadgeForm from "./RevokeBadgeForm";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { CheckCircle, ExternalLink } from "lucide-react";

export default async function BadgePage() {
  const t = await getTranslations("dashboard.badge");
  const company = await getCurrentCompany();

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  const badge = await getActiveBadgeForCompany(company.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>

      {!badge ? (
        <Alert className="mt-4">
          <AlertDescription>
            {t("noBadge")}
            <Button variant="link" className="h-auto p-0 pl-1 font-medium" asChild>
              <Link href="/dashboard/billing">{t("noBadgeCta")}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{t("status")}</p>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                {t("statusActive")}
              </Badge>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">{t("assertionId")}</p>
            <p className="font-mono text-xs text-foreground break-all">{badge.assertionId}</p>

            <p className="mt-6 text-sm text-muted-foreground">{t("certificate")}</p>
            <Button variant="outline" className="mt-2 gap-2" asChild>
              <Link href={`/certificate/${company.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                {t("viewCertificate")}
              </Link>
            </Button>

            <RevokeBadgeForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
