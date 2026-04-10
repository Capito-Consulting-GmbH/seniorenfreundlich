import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import ProfileForm from "./ProfileForm";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

export default async function ProfilePage() {
  const t = await getTranslations("dashboard.profile");

  let company = null;
  try {
    company = await getCurrentCompany();
  } catch {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
        <Alert className="mt-3">
          <AlertDescription>{t("dbError")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!company) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      <ProfileForm company={company} />
    </div>
  );
}
