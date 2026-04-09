import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthHeader } from "@/src/app/auth-header";
import { Link } from "@/src/i18n/navigation";
import { getCompanyBySlug } from "@/src/services/companyService";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) return {};
  return {
    title: `${company.name} | Seniorenfreundlich.de`,
    description:
      company.description ??
      `${company.name} – ein seniorenfreundliches Unternehmen.`,
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("company");
  const tFooter = await getTranslations("footer");

  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const badge = await getActiveBadgeForCompany(company.id);

  return (
    <div className="min-h-screen bg-white">
      <AuthHeader />

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="flex items-start gap-5">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={`${company.name} Logo`}
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-100 text-xl font-bold text-zinc-400">
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">{company.name}</h1>
            {company.city && (
              <p className="mt-1 text-zinc-500">{company.city}</p>
            )}
          </div>
        </div>

        {/* Badge status */}
        <div className="mt-8">
          {badge ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white font-bold text-lg">
                  ✓
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-800">{t("badgeActive")}</p>
                  <p className="mt-0.5 text-sm text-green-700">
                    {t("badgeIssuedOn", {
                      date: new Date(badge.issuedAt).toLocaleDateString(locale, {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }),
                    })}
                  </p>
                </div>
                <Link
                  href={`/certificate/${company.slug}`}
                  className="rounded-md border border-green-300 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-100"
                >
                  {t("checkCertificate")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">{t("noBadge")}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {company.description && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-900">{t("about")}</h2>
            <p className="mt-2 whitespace-pre-line text-zinc-600">
              {company.description}
            </p>
          </div>
        )}

        {/* Contact details */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {company.website && (
            <ContactItem label={t("website")}>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-800 underline underline-offset-2 hover:text-zinc-600"
              >
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            </ContactItem>
          )}
          {company.phone && (
            <ContactItem label={t("phone")}>
              <a href={`tel:${company.phone}`} className="text-zinc-800">
                {company.phone}
              </a>
            </ContactItem>
          )}
          {company.email && (
            <ContactItem label={t("email")}>
              <a href={`mailto:${company.email}`} className="text-zinc-800">
                {company.email}
              </a>
            </ContactItem>
          )}
          {(company.address ?? company.city ?? company.postalCode) && (
            <ContactItem label={t("address")}>
              <span className="text-zinc-800">
                {[company.address, company.postalCode, company.city]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </ContactItem>
          )}
        </div>

        <div className="mt-10">
          <Link href="/companies" className="text-sm text-zinc-500 hover:text-zinc-800">
            {t("backToList")}
          </Link>
        </div>
      </main>

      <footer className="mt-16 border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400">
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

function ContactItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
