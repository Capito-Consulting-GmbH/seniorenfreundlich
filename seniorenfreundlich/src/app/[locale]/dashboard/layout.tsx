import { getTranslations, setRequestLocale } from "next-intl/server";
import { DashboardNav } from "./DashboardNav";
import { VerificationBanner } from "./VerificationBanner";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  // Attempt to load company — may be null when not authenticated (edge case)
  let showVerificationBanner = false;
  try {
    const company = await getCurrentCompany();
    showVerificationBanner =
      !!company && company.verificationStatus !== "verified";
  } catch {
    // unauthenticated or DB error — skip banner
  }

  return (
    <div className="min-h-screen">
      <DashboardNav
        labels={{
          overview: t("nav.overview"),
          profile: t("nav.profile"),
          badge: t("nav.badge"),
          directory: t("nav.directory"),
          menu: t("nav.menu"),
        }}
      />
      {showVerificationBanner && (
        <VerificationBanner
          title={t("onboarding.verificationBannerTitle")}
          description={t("onboarding.verificationBannerDesc")}
          cta={t("onboarding.verificationBannerCta")}
        />
      )}
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}

