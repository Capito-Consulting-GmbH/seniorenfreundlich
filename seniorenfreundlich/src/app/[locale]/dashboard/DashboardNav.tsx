"use client";

import { Link } from "@/src/i18n/navigation";
import { WordMark } from "@/src/components/WordMark";
import { LocaleSwitcher } from "@/src/components/LocaleSwitcher";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import { DashboardUserNav } from "./UserNav";
import { Button } from "@/src/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet";
import { Separator } from "@/src/components/ui/separator";
import { Menu } from "lucide-react";
import { useState } from "react";

type Props = {
  isAdmin?: boolean;
  labels: {
    overview: string;
    profile: string;
    badge: string;
    security: string;
    directory: string;
    menu: string;
    assessment: string;
  };
};

export function DashboardNav({ labels, isAdmin }: Props) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: labels.overview },
    { href: "/dashboard/profile", label: labels.profile },
    { href: "/dashboard/badge", label: labels.badge },
    { href: "/dashboard/assessment", label: labels.assessment },
    { href: "/dashboard/security", label: labels.security },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: wordmark + desktop nav links */}
        <div className="flex items-center gap-6">
          <WordMark />
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: directory + locale + theme + user + hamburger */}
        <div className="flex items-center gap-2">
          <Link
            href="/companies"
            className="hidden md:block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {labels.directory}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden md:inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:bg-accent transition-colors"
            >
              Admin
            </Link>
          )}
          <LocaleSwitcher />
          <ThemeToggle />
          <DashboardUserNav />

          {/* Hamburger — mobile only */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 pt-10">
              <SheetTitle className="sr-only">{labels.menu}</SheetTitle>
              <nav className="flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
                <Separator className="my-2" />
                <Link
                  href="/companies"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {labels.directory}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                  >
                    Admin
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
