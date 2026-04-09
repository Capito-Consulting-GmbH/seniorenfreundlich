import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const t = await getTranslations("dashboard.profile");

  let company = null;
  try {
    company = await getCurrentCompany();
  } catch {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
        <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          {t("dbError")}
        </p>
      </div>
    );
  }

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
      <p className="mt-2 text-zinc-600">{t("subtitle")}</p>
      <ProfileForm company={company} />
    </div>
  );
}
