"use client";

import { useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { WordMark } from "@/src/components/WordMark";

export function AuthHeader() {
  const { isSignedIn } = useAuth();
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative w-full border-b border-zinc-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-6 py-4">
        {/* Logo */}
        <WordMark />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/companies" className="text-sm text-zinc-600 hover:text-zinc-900">
            {t("companies")}
          </Link>
          {isSignedIn && (
            <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
              {t("dashboard")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Auth buttons — desktop only */}
          <Show when="signed-out">
            <SignInButton forceRedirectUrl="/dashboard">
              <button className="hidden rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:border-zinc-500 sm:block">
                {t("signIn")}
              </button>
            </SignInButton>
            <SignUpButton forceRedirectUrl="/dashboard">
              <button className="hidden rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 sm:block">
                {t("signUp")}
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>

          {/* Mobile hamburger */}
          <button
            className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="flex flex-col gap-3 border-t border-zinc-200 bg-white px-6 py-4 md:hidden">
          <Link
            href="/companies"
            className="text-sm text-zinc-600 hover:text-zinc-900"
            onClick={() => setMobileOpen(false)}
          >
            {t("companies")}
          </Link>
          {isSignedIn && (
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 hover:text-zinc-900"
              onClick={() => setMobileOpen(false)}
            >
              {t("dashboard")}
            </Link>
          )}
          <Show when="signed-out">
            <SignInButton forceRedirectUrl="/dashboard">
              <button className="w-full rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:border-zinc-500">
                {t("signIn")}
              </button>
            </SignInButton>
            <SignUpButton forceRedirectUrl="/dashboard">
              <button className="w-full rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700">
                {t("signUp")}
              </button>
            </SignUpButton>
          </Show>
        </div>
      )}
    </header>
  );
}
