import { AuthHeader } from "@/src/app/auth-header";

export function LegalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <AuthHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-900">{title}</h1>
        <div className="prose prose-zinc mt-8 max-w-none">{children}</div>
      </main>
      <footer className="mt-16 border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Seniorenfreundlich.de
      </footer>
    </div>
  );
}
