import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import RevokeBadgeForm from "./RevokeBadgeForm";

export default async function BadgePage() {
  const company = await getCurrentCompany();

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  const badge = await getActiveBadgeForCompany(company.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Siegel</h1>

      {!badge ? (
        <div className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          Noch kein aktives Siegel vorhanden. Kaufen Sie das Siegel auf der Abrechnungsseite.
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Status</p>
          <p className="text-lg font-medium text-green-700">Aktiv</p>

          <p className="mt-4 text-sm text-zinc-500">Assertion ID</p>
          <p className="font-mono text-xs text-zinc-800">{badge.assertionId}</p>

          <p className="mt-4 text-sm text-zinc-500">Zertifikat</p>
          <a
            href={`/certificate/${company.slug}`}
            className="text-sm text-zinc-900 underline hover:text-zinc-700"
          >
            /certificate/{company.slug}
          </a>

          <RevokeBadgeForm />
        </div>
      )}
    </div>
  );
}
