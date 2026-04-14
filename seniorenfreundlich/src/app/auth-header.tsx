"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Link, useRouter } from "@/src/i18n/navigation";
import { useSession, signOut } from "@/src/lib/auth-client";
import { WordMark } from "@/src/components/WordMark";
import { LocaleSwitcher } from "@/src/components/LocaleSwitcher";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import { Button } from "@/src/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet";
import { Separator } from "@/src/components/ui/separator";
import { DashboardUserNav } from "@/src/app/[locale]/dashboard/UserNav";

export function AuthHeader() {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSignOut() {
    signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
  }

  return (
    <header className="w-full border-b bg-background">
      <div className="flex items-center justify-between gap-3 px-6 py-3">
        {/* Logo */}
        <WordMark />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/companies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("companies")}
          </Link>
          {session && (
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("dashboard")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          <ThemeToggle />

          {/* Auth buttons — desktop */}
          {session ? (
            <DashboardUserNav />
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="outline" size="sm" className="hidden rounded-full sm:flex">
                  {t("signIn")}
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="hidden rounded-full sm:flex">
                  {t("signUp")}
                </Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 pt-10">
              <SheetTitle className="sr-only">{t("menuLabel")}</SheetTitle>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/companies"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {t("companies")}
                </Link>
                {session && (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {t("dashboard")}
                  </Link>
                )}
              </nav>
              <Separator className="my-4" />
              <div className="flex flex-col gap-2 px-1">
                <div className="sm:hidden">
                  <LocaleSwitcher onLocaleChange={() => setOpen(false)} />
                </div>
                {session ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => { setOpen(false); handleSignOut(); }}
                  >
                    {t("signOut")}
                  </Button>
                ) : (
                  <>
                    <Link href="/sign-in" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full">
                        {t("signIn")}
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setOpen(false)}>
                      <Button className="w-full rounded-full">
                        {t("signUp")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

