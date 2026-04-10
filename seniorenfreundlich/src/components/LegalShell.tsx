import { getTranslations } from "next-intl/server";
import { Link } from "@/src/i18n/navigation";
import { AuthHeader } from "@/src/app/auth-header";

export async function LegalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const tFooter = await getTranslations("footer");

  return (
    <div className="min-h-screen bg-background">
      <AuthHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <div className="prose prose-zinc dark:prose-invert mt-8 max-w-none">{children}</div>
      </main>
      <footer className="mt-16 border-t px-6 py-6 text-center text-xs text-muted-foreground">
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
