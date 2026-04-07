import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";

export default async function DashboardPage() {
  const company = await getCurrentCompany();

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">
        Willkommen, {company.name}
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <a
          href="/dashboard/profile"
          className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-400"
        >
          <h2 className="font-medium text-zinc-900">Profil</h2>
          <p className="mt-1 text-sm text-zinc-500">Unternehmensdaten bearbeiten</p>
        </a>
        <a
          href="/dashboard/billing"
          className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-400"
        >
          <h2 className="font-medium text-zinc-900">Abrechnung</h2>
          <p className="mt-1 text-sm text-zinc-500">Siegel kaufen &amp; Zahlungen</p>
        </a>
        <a
          href="/dashboard/badge"
          className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-400"
        >
          <h2 className="font-medium text-zinc-900">Siegel</h2>
          <p className="mt-1 text-sm text-zinc-500">Badge verwalten &amp; einbetten</p>
        </a>
      </div>
    </div>
  );
}
