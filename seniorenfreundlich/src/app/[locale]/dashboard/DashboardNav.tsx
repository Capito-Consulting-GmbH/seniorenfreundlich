"use client";

import { useState } from "react";
import { Link } from "@/src/i18n/navigation";
import { WordMark } from "@/src/components/WordMark";
import { LocaleSwitcher } from "@/src/components/LocaleSwitcher";
import { DashboardUserNav } from "./UserNav";

type Props = {
  labels: {
    overview: string;
    profile: string;
    billing: string;
    badge: string;
    directory: string;
  };
};

export function DashboardNav({ labels }: Props) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: labels.overview },
    { href: "/dashboard/profile", label: labels.profile },
    { href: "/dashboard/billing", label: labels.billing },
    { href: "/dashboard/badge", label: labels.badge },
  ];

  return (
    <nav className="border-b border-zinc-200 bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Left: wordmark + desktop nav links */}
        <div className="flex items-center gap-6">
          <WordMark />
          <div className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap text-sm text-zinc-600 hover:text-zinc-900"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: directory + locale + user + hamburger */}
        <div className="flex items-center gap-4">
          <Link
            href="/companies"
            className="hidden md:block whitespace-nowrap text-sm text-zinc-500 hover:text-zinc-900"
          >
            {labels.directory}
          </Link>
          <LocaleSwitcher />
          <DashboardUserNav />

          {/* Hamburger — mobile only */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 md:hidden"
          >
            {open ? (
              /* X icon */
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-zinc-100 px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/companies"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-md px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            >
              {labels.directory}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
