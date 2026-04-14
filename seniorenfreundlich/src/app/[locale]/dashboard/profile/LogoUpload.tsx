"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function LogoUpload({ logoUrl }: { logoUrl: string | null }) {
  const t = useTranslations("dashboard.profile");

  return (
    <div>
      <p className="text-sm font-medium text-foreground">{t("logo")}</p>
      <div className="mt-2 flex items-center gap-6">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={t("logoAlt")}
            width={80}
            height={80}
            style={{ width: "auto", height: "auto" }}
            className="rounded-md object-contain"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border bg-muted text-xs text-muted-foreground">
            {t("logoNone")}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <input
            type="file"
            name="logo"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent"
          />
          <p className="text-xs text-muted-foreground">{t("logoHint")}</p>
        </div>
      </div>
    </div>
  );
}
