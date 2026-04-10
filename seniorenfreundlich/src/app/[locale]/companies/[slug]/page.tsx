import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthHeader } from "@/src/app/auth-header";
import { Link } from "@/src/i18n/navigation";
import { getCompanyBySlug } from "@/src/services/companyService";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import Image from "next/image";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";

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
    <div className="min-h-screen bg-background">
      <AuthHeader />

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="flex items-start gap-5">
          {company.logoUrl ? (
            <Image
              src={company.logoUrl}
              alt={`${company.name} Logo`}
              width={128}
              height={64}
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-xl font-bold text-muted-foreground">
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
            {company.city && (
              <p className="mt-1 text-muted-foreground">{company.city}</p>
            )}
          </div>
        </div>

        {/* Badge status */}
        <div className="mt-8">
          {badge ? (
            <Card className="border-border">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{t("badgeActive")}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t("badgeIssuedOn", {
                        date: new Date(badge.issuedAt).toLocaleDateString(locale, {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }),
                      })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/certificate/${company.slug}`}>
                      {t("checkCertificate")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{t("noBadge")}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        {company.description && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">{t("about")}</h2>
            <p className="mt-2 whitespace-pre-line text-muted-foreground">
              {company.description}
            </p>
          </div>
        )}

        <Separator className="mt-8" />

        {/* Contact details */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {company.website && (
            <ContactItem label={t("website")}>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
              >
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            </ContactItem>
          )}
          {company.phone && (
            <ContactItem label={t("phone")}>
              <a href={`tel:${company.phone}`} className="text-foreground">
                {company.phone}
              </a>
            </ContactItem>
          )}
          {company.email && (
            <ContactItem label={t("email")}>
              <a href={`mailto:${company.email}`} className="text-foreground">
                {company.email}
              </a>
            </ContactItem>
          )}
          {(company.address ?? company.city ?? company.postalCode) && (
            <ContactItem label={t("address")}>
              <span className="text-foreground">
                {[company.address, company.postalCode, company.city]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </ContactItem>
          )}
        </div>

        <div className="mt-10">
          <Button variant="link" className="px-0 text-muted-foreground" asChild>
            <Link href="/companies">{t("backToList")}</Link>
          </Button>
        </div>
      </main>

      <footer className="mt-16 border-t px-6 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Seniorenfreundlich.de</p>
        <nav className="mt-2 flex justify-center gap-4">
          <Link href="/imprint" className="hover:text-foreground transition-colors">{tFooter("imprint")}</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">{tFooter("privacy")}</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">{tFooter("terms")}</Link>
          <Link href="/cancellation" className="hover:text-foreground transition-colors">{tFooter("cancellation")}</Link>
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
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm">{children}</div>
      </CardContent>
    </Card>
  );
}

