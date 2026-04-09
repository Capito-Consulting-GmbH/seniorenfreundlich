import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/src/i18n/navigation";
import { WordMark } from "@/src/components/WordMark";
import { DashboardUserNav } from "./UserNav";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.nav");

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-center gap-6 overflow-x-auto">
          <WordMark />
          <Link href="/dashboard" className="whitespace-nowrap text-sm text-zinc-600 hover:text-zinc-900">
            {t("overview")}
          </Link>
          <Link href="/dashboard/profile" className="whitespace-nowrap text-sm text-zinc-600 hover:text-zinc-900">
            {t("profile")}
          </Link>
          <Link href="/dashboard/billing" className="whitespace-nowrap text-sm text-zinc-600 hover:text-zinc-900">
            {t("billing")}
          </Link>
          <Link href="/dashboard/badge" className="whitespace-nowrap text-sm text-zinc-600 hover:text-zinc-900">
            {t("badge")}
          </Link>
          <div className="ml-auto flex shrink-0 items-center gap-6">
            <Link href="/companies" className="whitespace-nowrap text-sm text-zinc-500 hover:text-zinc-900">
              {t("directory")}
            </Link>
            <DashboardUserNav />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
