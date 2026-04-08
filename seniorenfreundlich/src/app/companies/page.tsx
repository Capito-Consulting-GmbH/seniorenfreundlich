import type { Metadata } from "next";
import { AuthHeader } from "@/src/app/auth-header";
import { listCertifiedCompanies } from "@/src/services/companyService";

export const metadata: Metadata = {
  title: "Zertifizierte Unternehmen | Seniorenfreundlich.de",
  description:
    "Alle Unternehmen mit aktivem Seniorenfreundlich-Siegel auf einen Blick.",
};

export default async function UnternehmenPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const { rows, total, pageSize } = await listCertifiedCompanies({ search, page });
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-white">
      <AuthHeader />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-900">
          Zertifizierte Unternehmen
        </h1>
        <p className="mt-2 text-zinc-600">
          Alle Unternehmen mit aktivem Seniorenfreundlich-Siegel.
        </p>

        {/* Search */}
        <form method="GET" className="mt-8 flex gap-3">
          <input
            name="search"
            defaultValue={search}
            placeholder="Name oder Stadt suchen…"
            className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Suchen
          </button>
          {search && (
            <a
              href="/companies"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-500"
            >
              Zurücksetzen
            </a>
          )}
        </form>

        {/* Count */}
        <p className="mt-6 text-sm text-zinc-500">
          {total === 0
            ? "Keine Unternehmen gefunden."
            : `${total} ${total === 1 ? "Unternehmen" : "Unternehmen"} gefunden`}
        </p>

        {/* Grid */}
        {rows.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((company) => (
              <a
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
                  ✓ Siegel aktiv
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/companies?${search ? `search=${encodeURIComponent(search)}&` : ""}page=${p}`}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  p === page
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-300 text-zinc-600 hover:border-zinc-500"
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Seniorenfreundlich.de
      </footer>
    </div>
  );
}
