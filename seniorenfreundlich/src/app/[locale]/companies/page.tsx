import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthHeader } from "@/src/app/auth-header";
import { Link } from "@/src/i18n/navigation";
import { listCertifiedCompanies } from "@/src/services/companyService";

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
    <div className="min-h-screen bg-white">
      <AuthHeader />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-900">{t("title")}</h1>
        <p className="mt-2 text-zinc-600">{t("subtitle")}</p>

        {/* Search */}
        <form method="GET" className="mt-8 flex gap-3">
          <input
            name="search"
            defaultValue={search}
            placeholder={t("searchPlaceholder")}
            className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            {t("searchButton")}
          </button>
          {search && (
            <Link
              href="/companies"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-500"
            >
              {t("resetButton")}
            </Link>
          )}
        </form>

        {/* Count */}
        <p className="mt-6 text-sm text-zinc-500">
          {total === 0
            ? t("noResults")
            : t("resultsCount", { count: total })}
        </p>

        {/* Grid */}
        {rows.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="flex flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:border-zinc-400 hover:shadow-md"
              >
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={`${company.name} Logo`}
                    className="mb-3 h-10 w-auto object-contain"
                  />
                ) : (
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold text-zinc-400">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="font-semibold text-zinc-900">{company.name}</h2>
                {company.city && (
                  <p className="mt-1 text-sm text-zinc-500">{company.city}</p>
                )}
                <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  {t("badgeActive")}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/companies?${search ? `search=${encodeURIComponent(search)}&` : ""}page=${p}`}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  p === page
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-300 text-zinc-600 hover:border-zinc-500"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
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
