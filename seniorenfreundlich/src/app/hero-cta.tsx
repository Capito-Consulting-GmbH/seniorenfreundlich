"use client";

import { useAuth, SignUpButton } from "@clerk/nextjs";

export function HeroCta() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <a
        href="/dashboard"
        className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
      >
        Zum Dashboard
      </a>
    );
  }

  return (
    <SignUpButton forceRedirectUrl="/dashboard">
      <button className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white hover:bg-zinc-700">
        Jetzt registrieren
      </button>
    </SignUpButton>
  );
}
