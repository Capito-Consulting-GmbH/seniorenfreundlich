import { AuthHeader } from "@/src/app/auth-header";
import { HeroCta } from "@/src/app/hero-cta";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AuthHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Das Siegel für<br />seniorenfreundliche Unternehmen
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-600">
          Zeigen Sie Ihren Kunden, dass Ihr Unternehmen besondere Rücksicht auf die
          Bedürfnisse älterer Menschen nimmt — sichtbar, glaubwürdig und zertifiziert.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <HeroCta />
          <a
            href="/companies"
            className="rounded-full border border-zinc-300 px-8 py-3 text-sm font-semibold text-zinc-700 hover:border-zinc-500"
          >
            Zertifizierte Unternehmen
          </a>
        </div>
      </main>
      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400">
        <p>© {new Date().getFullYear()} Seniorenfreundlich.de</p>
        <nav className="mt-2 flex justify-center gap-4">
          <a href="/imprint" className="hover:text-zinc-600">Impressum</a>
          <a href="/privacy" className="hover:text-zinc-600">Datenschutz</a>
          <a href="/terms" className="hover:text-zinc-600">AGB</a>
          <a href="/cancellation" className="hover:text-zinc-600">Widerruf</a>
        </nav>
      </footer>
    </div>
  );
}

