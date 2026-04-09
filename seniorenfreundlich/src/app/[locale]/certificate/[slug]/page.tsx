import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthHeader } from "@/src/app/auth-header";
import { Link } from "@/src/i18n/navigation";
import { getCompanyBySlug } from "@/src/services/companyService";
import { getLatestBadgeForCompany } from "@/src/services/badgeService";
import { env } from "@/src/env";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "certificate" });
  const company = await getCompanyBySlug(slug);
  if (!company) return {};
  return {
    title: t("metaTitle", { name: company.name }),
    description: t("metaDescription", { name: company.name }),
  };
}

export default async function CertificatePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("certificate");
  const tFooter = await getTranslations("footer");

  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const badge = await getLatestBadgeForCompany(company.id);
  if (!badge) notFound();

  const isActive = badge.status === "active";
  const assertionUrl = `${env.NEXT_PUBLIC_APP_URL}/api/openbadges/assertion/${badge.assertionId}`;

  return (
    <div className="min-h-screen bg-zinc-50">
      <AuthHeader />

      <main className="mx-auto max-w-2xl px-6 py-16">
        {/* Certificate card */}
        <div
          className={`rounded-2xl border-2 bg-white p-8 shadow-md ${
            isActive ? "border-green-300" : "border-zinc-300"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                {t("issuer")}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-zinc-900">
                {t("title")}
              </h1>
            </div>
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt={`${company.name} Logo`}
                className="h-14 w-auto object-contain"
              />
            )}
          </div>

          <hr className="my-6 border-zinc-100" />

          {/* Company */}
          <div>
            <p className="text-sm text-zinc-500">{t("issuedFor")}</p>
            <p className="mt-1 text-xl font-semibold text-zinc-900">
              {company.name}
            </p>
            {company.city && (
              <p className="mt-0.5 text-sm text-zinc-500">{company.city}</p>
            )}
          </div>

          {/* Status */}
          <div className="mt-6">
            {isActive ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700 ring-1 ring-green-200">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {t("statusActive")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {t("statusRevoked")}
              </span>
            )}
          </div>

          {/* Dates */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {t("issuedOn")}
              </p>
              <p className="mt-1 text-sm text-zinc-800">
                {new Date(badge.issuedAt).toLocaleDateString(locale, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {!isActive && badge.revokedAt && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {t("revokedOn")}
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {new Date(badge.revokedAt).toLocaleDateString(locale, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          <hr className="my-6 border-zinc-100" />

          {/* Verification */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {t("proofId")}
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-500 break-all">
              {badge.assertionId}
            </p>
            <a
              href={assertionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-800"
            >
              {t("viewJson")}
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href={`/companies/${company.slug}`}
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            {t("backToProfile")}
          </Link>
        </div>
      </main>

      <footer className="mt-8 border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400">
        <p>© {new Date().getFullYear()} Seniorenfreundlich.de</p>
        <nav className="mt-2 flex justify-center gap-4">
          <Link href="/imprint" className="hover:text-zinc-600">{tFooter("imprint")}</Link>
          <Link href="/privacy" className="hover:text-zinc-600">{tFooter("privacy")}</Link>
          <Link href="/terms" className="hover:text-zinc-600">{tFooter("terms")}</Link>
          <Link href="/cancellation" className="hover:text-zinc-600">{tFooter("cancellation")}</Link>
        </nav>
      </footer>
    </div>
  );
}
