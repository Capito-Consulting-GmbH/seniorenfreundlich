import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthHeader } from "@/src/app/auth-header";
import { Link } from "@/src/i18n/navigation";
import { listCertifiedCompanies } from "@/src/services/companyService";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Image from "next/image";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; page?: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "companies" });
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function CompaniesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("companies");
  const tFooter = await getTranslations("footer");

  const sp = await searchParams;
  const search = sp.search?.trim() || undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const { rows, total, pageSize } = await listCertifiedCompanies({ search, page });
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-background">
      <AuthHeader />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

        {/* Search */}
        <form method="GET" className="mt-8 flex gap-3">
          <Input
            name="search"
            defaultValue={search}
            placeholder={t("searchPlaceholder")}
            className="flex-1"
          />
          <Button type="submit">{t("searchButton")}</Button>
          {search && (
            <Button variant="outline" asChild>
              <Link href="/companies">{t("resetButton")}</Link>
            </Button>
          )}
        </form>

        {/* Count */}
        <p className="mt-6 text-sm text-muted-foreground">
          {total === 0 ? t("noResults") : t("resultsCount", { count: total })}
        </p>

        {/* Grid */}
        {rows.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((company) => (
              <Link key={company.id} href={`/companies/${company.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    {company.logoUrl ? (
                      <Image
                        src={company.logoUrl}
                        alt={`${company.name} Logo`}
                        width={80}
                        height={40}
                        className="mb-3 h-10 w-auto object-contain"
                      />
                    ) : (
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h2 className="font-semibold text-card-foreground">{company.name}</h2>
                    {company.city && (
                      <p className="mt-1 text-sm text-muted-foreground">{company.city}</p>
                    )}
                    <div className="mt-3">
                      <Badge variant="secondary">
                        {t("badgeActive")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={`/companies?${search ? `search=${encodeURIComponent(search)}&` : ""}page=${p}`}>
                  {p}
                </Link>
              </Button>
            ))}
          </div>
        )}
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

