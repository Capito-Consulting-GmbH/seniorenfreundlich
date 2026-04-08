import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getActiveBadgeForCompany } from "@/src/services/badgeService";
import { startCheckoutAction } from "@/src/actions/startCheckout";
import PaymentPoller from "./PaymentPoller";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkout?: string }>;
}) {
  let company = null;
  try {
    company = await getCurrentCompany();
  } catch {
    redirect("/");
  }

  const params = await searchParams;

  if (!company) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Abrechnung</h1>
        <p className="mt-2 text-zinc-600">Bitte zuerst das Onboarding abschliessen.</p>
      </div>
    );
  }

  const activeBadge = await getActiveBadgeForCompany(company.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Abrechnung</h1>
      <p className="mt-2 text-zinc-600">
        Einmalige Aktivierung des Seniorenfreundlich-Siegels fuer 99,00 EUR.
      </p>

      {params.checkout === "returned" && <PaymentPoller />}

      {params.error === "badge-active" && (
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Ihr Unternehmen hat bereits ein aktives Siegel.
        </p>
      )}

      {params.error === "no-checkout-url" && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          Checkout konnte nicht gestartet werden. Bitte erneut versuchen.
        </p>
      )}

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-500">Produkt</p>
        <p className="text-lg font-medium text-zinc-900">Seniorenfreundlich-Siegel</p>
        <p className="mt-2 text-3xl font-semibold text-zinc-900">99,00 EUR</p>

        {activeBadge ? (
          <p className="mt-6 rounded-md bg-green-50 p-3 text-sm text-green-700">
            Ihr Siegel ist bereits aktiv.
          </p>
        ) : (
          <form action={startCheckoutAction} className="mt-6">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Siegel kaufen
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
