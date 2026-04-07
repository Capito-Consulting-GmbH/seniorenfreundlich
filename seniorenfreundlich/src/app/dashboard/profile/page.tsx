import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  let company = null;
  try {
    company = await getCurrentCompany();
  } catch {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-zinc-900">Unternehmensprofil</h1>
        <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Datenbank aktuell nicht erreichbar. Bitte Seite in 10-20 Sekunden neu laden.
        </p>
      </div>
    );
  }

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Unternehmensprofil</h1>
      <p className="mt-2 text-zinc-600">
        Diese Angaben erscheinen auf deiner öffentlichen Unternehmensseite.
      </p>
      <ProfileForm company={company} />
    </div>
  );
}
