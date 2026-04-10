import { getTranslations, setRequestLocale } from "next-intl/server";
import { DashboardNav } from "./DashboardNav";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.nav");

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardNav
        labels={{
          overview: t("overview"),
          profile: t("profile"),
          billing: t("billing"),
          badge: t("badge"),
          directory: t("directory"),
          menu: t("menu"),
        }}
      />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
