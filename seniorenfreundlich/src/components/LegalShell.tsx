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
    <div className="min-h-screen bg-white">
      <AuthHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-900">{title}</h1>
        <div className="prose prose-zinc mt-8 max-w-none">{children}</div>
      </main>
      <footer className="mt-16 border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400">
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
