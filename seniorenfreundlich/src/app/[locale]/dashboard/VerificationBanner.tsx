"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { MailWarning } from "lucide-react";

type Props = {
  title: string;
  description: string;
  cta: string;
};

export function VerificationBanner({ title, description, cta }: Props) {
  const pathname = usePathname();

  // Don't show the banner while the user is already on the onboarding page
  if (pathname.includes("/onboarding")) return null;

  return (
    <div className="border-b bg-amber-50 dark:bg-amber-950/30">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{title}</p>
            <p className="text-sm text-amber-800/80 dark:text-amber-300/80">{description}</p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-600/40 bg-transparent text-amber-900 hover:bg-amber-100 dark:border-amber-400/60 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-900/50">
          <Link href="/dashboard/onboarding">{cta}</Link>
        </Button>
      </div>
    </div>
  );
}
