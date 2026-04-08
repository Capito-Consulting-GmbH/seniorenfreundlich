"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { WordMark } from "@/src/components/WordMark";

export function AuthHeader() {
  const { isSignedIn } = useAuth();

  return (
    <header className="flex w-full items-center justify-between gap-3 border-b border-zinc-200 bg-white px-6 py-4">
      <div className="flex items-center gap-6">
        <WordMark />
        <a href="/companies" className="text-sm text-zinc-600 hover:text-zinc-900">
          Unternehmen
        </a>
        {isSignedIn && (
          <a href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
            Dashboard
          </a>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton forceRedirectUrl="/dashboard">
            <button className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:border-zinc-500">
              Anmelden
            </button>
          </SignInButton>
          <SignUpButton forceRedirectUrl="/dashboard">
            <button className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700">
              Registrieren
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
