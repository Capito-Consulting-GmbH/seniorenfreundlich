"use client";

import { useSession } from "@/src/lib/auth-client";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { Button } from "@/src/components/ui/button";

export function HeroCta() {
  const { data: session } = useSession();
  const t = useTranslations("home");

  if (session) {
    return (
      <Button size="lg" className="rounded-full" asChild>
        <Link href="/dashboard">{t("ctaDashboard")}</Link>
      </Button>
    );
  }

  return (
    <Button size="lg" className="rounded-full" asChild>
      <Link href="/sign-up">{t("cta")}</Link>
    </Button>
  );
}
