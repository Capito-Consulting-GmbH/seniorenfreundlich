import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthHeader } from "@/src/app/auth-header";
import { getCompanyBySlug } from "@/src/services/companyService";
import { getLatestBadgeForCompany } from "@/src/services/badgeService";
import { env } from "@/src/env";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) return {};
  return {
    title: `Zertifikat – ${company.name} | Seniorenfreundlich.de`,
    description: `Verifiziertes Seniorenfreundlich-Siegel für ${company.name}.`,
  };
}

export default async function ZertifikatPage({ params }: Props) {
  const { slug } = await params;
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
                Seniorenfreundlich.de
              </p>
              <h1 className="mt-1 text-2xl font-bold text-zinc-900">
                Seniorenfreundlich-Siegel
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
            <p className="text-sm text-zinc-500">Ausgestellt für</p>
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
                Siegel aktiv
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Siegel widerrufen
              </span>
            )}
          </div>

          {/* Dates */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Ausgestellt am
              </p>
              <p className="mt-1 text-sm text-zinc-800">
                {new Date(badge.issuedAt).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {!isActive && badge.revokedAt && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Widerrufen am
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {new Date(badge.revokedAt).toLocaleDateString("de-DE", {
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
              Nachweis-ID
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
              Open Badges JSON anzeigen →
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <a
            href={`/companies/${company.slug}`}
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            ← Zum Unternehmensprofil
          </a>
        </div>
      </main>

      <footer className="mt-8 border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Seniorenfreundlich.de
      </footer>
    </div>
  );
}
