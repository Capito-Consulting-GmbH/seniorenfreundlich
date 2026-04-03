"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function AuthHeader() {
  return (
    <header className="flex w-full items-center justify-end gap-3 border-b border-zinc-200 bg-white p-4">
      <Show when="signed-out">
        <SignInButton />
        <SignUpButton />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>
  );
}
