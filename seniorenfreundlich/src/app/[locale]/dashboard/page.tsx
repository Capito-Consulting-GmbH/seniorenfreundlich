import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";

export default async function DashboardPage() {
  const company = await getCurrentCompany();

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  const t = await getTranslations("dashboard.overview");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">
        {t("welcome", { name: company.name })}
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/profile"
          className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-400"
        >
          <h2 className="font-medium text-zinc-900">{t("profileTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t("profileDesc")}</p>
        </Link>
        <Link
          href="/dashboard/billing"
          className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-400"
        >
          <h2 className="font-medium text-zinc-900">{t("billingTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t("billingDesc")}</p>
        </Link>
        <Link
          href="/dashboard/badge"
          className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-400"
        >
          <h2 className="font-medium text-zinc-900">{t("badgeTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t("badgeDesc")}</p>
        </Link>
      </div>
    </div>
  );
}
