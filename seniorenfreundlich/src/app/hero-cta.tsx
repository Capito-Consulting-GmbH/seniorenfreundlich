"use client";

import { useAuth, SignUpButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

export function HeroCta() {
  const { isSignedIn } = useAuth();
  const t = useTranslations("home");

  if (isSignedIn) {
    return (
      <Link
        href="/dashboard"
        className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
      >
        {t("ctaDashboard")}
      </Link>
    );
  }

  return (
    <SignUpButton forceRedirectUrl="/dashboard">
      <button className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white hover:bg-zinc-700">
        {t("cta")}
      </button>
    </SignUpButton>
  );
}
