import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthHeader } from "@/src/app/auth-header";
import { HeroCta } from "@/src/app/hero-cta";
import { Link } from "@/src/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tFooter = await getTranslations("footer");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AuthHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          {t("headline")}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-600">{t("subline")}</p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <HeroCta />
          <Link
            href="/companies"
            className="rounded-full border border-zinc-300 px-8 py-3 text-sm font-semibold text-zinc-700 hover:border-zinc-500"
          >
            {t("ctaCompanies")}
          </Link>
        </div>
      </main>
      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400">
        <p>© {new Date().getFullYear()} Seniorenfreundlich.de</p>
        <nav className="mt-2 flex justify-center gap-4">
          <Link href="/imprint" className="hover:text-zinc-600">{tFooter("imprint")}</Link>
          <Link href="/privacy" className="hover:text-zinc-600">{tFooter("privacy")}</Link>
          <Link href="/terms" className="hover:text-zinc-600">{tFooter("terms")}</Link>
          <Link href="/cancellation" className="hover:text-zinc-600">{tFooter("cancellation")}</Link>
        </nav>
      </footer>
    </div>
  );
}
