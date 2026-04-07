import { DashboardUserNav } from "./UserNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-zinc-900">Dashboard</span>
          <a href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">Übersicht</a>
          <a href="/dashboard/profile" className="text-sm text-zinc-600 hover:text-zinc-900">Profil</a>
          <a href="/dashboard/billing" className="text-sm text-zinc-600 hover:text-zinc-900">Abrechnung</a>
          <a href="/dashboard/badge" className="text-sm text-zinc-600 hover:text-zinc-900">Siegel</a>
          <div className="ml-auto">
            <DashboardUserNav />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
