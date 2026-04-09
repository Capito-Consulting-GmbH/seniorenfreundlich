import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import RevokeBadgeForm from "./RevokeBadgeForm";

export default async function BadgePage() {
  const t = await getTranslations("dashboard.badge");
  const company = await getCurrentCompany();

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  const badge = await getActiveBadgeForCompany(company.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>

      {!badge ? (
        <div className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          <p>{t("noBadge")}</p>
          <a
            href="/dashboard/billing"
            className="mt-3 inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-amber-900"
          >
            {t("noBadgeCta")}
          </a>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">{t("status")}</p>
          <p className="text-lg font-medium text-green-700">{t("statusActive")}</p>

          <p className="mt-4 text-sm text-zinc-500">{t("assertionId")}</p>
          <p className="font-mono text-xs text-zinc-800">{badge.assertionId}</p>

          <p className="mt-6 text-sm text-zinc-500">{t("certificate")}</p>
          <a
            href={`/certificate/${company.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800 hover:bg-green-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            {t("viewCertificate")}
          </a>

          <RevokeBadgeForm />
        </div>
      )}
    </div>
  );
}
