import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { Card, CardContent } from "@/src/components/ui/card";

export default async function DashboardPage() {
  const company = await getCurrentCompany();

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  const t = await getTranslations("dashboard.overview");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        {t("welcome", { name: company.name })}
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/profile">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <h2 className="font-medium text-card-foreground">{t("profileTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("profileDesc")}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/billing">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <h2 className="font-medium text-card-foreground">{t("billingTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("billingDesc")}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/badge">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <h2 className="font-medium text-card-foreground">{t("badgeTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("badgeDesc")}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
