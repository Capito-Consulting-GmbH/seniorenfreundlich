import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/src/auth/isAdmin";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import { WordMark } from "@/src/components/WordMark";
import { ArrowLeft } from "lucide-react";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.nav");

  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t("backToDashboard")}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <WordMark />
          <ThemeToggle />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
