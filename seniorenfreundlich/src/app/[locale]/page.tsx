import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthHeader } from "@/src/app/auth-header";
import { HeroCta } from "@/src/app/hero-cta";
import { Link } from "@/src/i18n/navigation";
import { Button } from "@/src/components/ui/button";

type Props = { params: Promise<{ locale: string }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tFooter = await getTranslations("footer");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AuthHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("headline")}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("subline")}</p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <HeroCta />
          <Button variant="outline" size="lg" className="rounded-full" asChild>
            <Link href="/companies">{t("ctaCompanies")}</Link>
          </Button>
        </div>
      </main>
      <footer className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Seniorenfreundlich.de</p>
        <nav className="mt-2 flex justify-center gap-4">
          <Link href="/imprint" className="hover:text-foreground transition-colors">{tFooter("imprint")}</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">{tFooter("privacy")}</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">{tFooter("terms")}</Link>
          <Link href="/cancellation" className="hover:text-foreground transition-colors">{tFooter("cancellation")}</Link>
        </nav>
      </footer>
    </div>
  );
}
