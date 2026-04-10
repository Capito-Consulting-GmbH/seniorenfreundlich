"use client";

import { useAuth, SignUpButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { Button } from "@/src/components/ui/button";

export function HeroCta() {
  const { isSignedIn } = useAuth();
  const t = useTranslations("home");

  if (isSignedIn) {
    return (
      <Button size="lg" className="rounded-full" asChild>
        <Link href="/dashboard">{t("ctaDashboard")}</Link>
      </Button>
    );
  }

  return (
    <SignUpButton forceRedirectUrl="/dashboard">
      <Button size="lg" className="rounded-full">
        {t("cta")}
      </Button>
    </SignUpButton>
  );
}
