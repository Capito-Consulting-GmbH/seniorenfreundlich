import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AuthHeader } from "@/src/app/auth-header";
import { Link } from "@/src/i18n/navigation";
import { getCompanyBySlug } from "@/src/services/companyService";
import { getLatestBadgeForCompany } from "@/src/services/badgeService";
import { env } from "@/src/env";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";

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
    <div className="min-h-screen bg-muted/40">
      <AuthHeader />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <Card className="border-2 shadow-md">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("issuer")}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-foreground">
                  {t("title")}
                </h1>
              </div>
              {company.logoUrl && (
                <Image
                  src={company.logoUrl}
                  alt={`${company.name} Logo`}
                  width={112}
                  height={56}
                  className="h-14 w-auto object-contain"
                />
              )}
            </div>

            <Separator className="my-6" />

            {/* Company */}
            <div>
              <p className="text-sm text-muted-foreground">{t("issuedFor")}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {company.name}
              </p>
              {company.city && (
                <p className="mt-0.5 text-sm text-muted-foreground">{company.city}</p>
              )}
            </div>

            {/* Status */}
            <div className="mt-6">
              {isActive ? (
                <Badge className="gap-2 rounded-full px-4 py-1.5 border border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  {t("statusActive")}
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-2 rounded-full px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-white/80" />
                  {t("statusRevoked")}
                </Badge>
              )}
            </div>

            {/* Dates */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("issuedOn")}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {new Date(badge.issuedAt).toLocaleDateString(locale, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              {!isActive && badge.revokedAt && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("revokedOn")}
                  </p>
                  <p className="mt-1 text-sm text-destructive">
                    {new Date(badge.revokedAt).toLocaleDateString(locale, {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Verification */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("proofId")}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground break-all">
                {badge.assertionId}
              </p>
              <a
                href={assertionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              >
                {t("viewJson")}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Button variant="link" className="text-muted-foreground" asChild>
            <Link href={`/companies/${company.slug}`}>
              {t("backToProfile")}
            </Link>
          </Button>
        </div>
      </main>

      <footer className="mt-8 border-t px-6 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Seniorenfreundlich.org</p>
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

