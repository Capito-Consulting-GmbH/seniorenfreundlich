"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/src/i18n/navigation";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Check } from "lucide-react";

type Props = {
  onLocaleChange?: () => void;
};

const locales = [
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "en", flag: "🇬🇧", label: "English" },
] as const;

function navigate(nextLocale: string, pathname: string, onLocaleChange?: () => void) {
  onLocaleChange?.();
  document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
  const prefix = nextLocale === "en" ? "/en" : "";
  const target = (prefix + (pathname === "/" ? "" : pathname)) || "/";
  window.location.href = target + window.location.search;
}

export function LocaleSwitcher({ onLocaleChange }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2 text-sm"
          aria-label={t("languageLabel")}
        >
          <span aria-hidden="true">{current.flag}</span>
          <span className="hidden sm:inline">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {locales.map(({ code, flag, label }) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => {
              if (code !== locale) navigate(code, pathname, onLocaleChange);
            }}
            className="gap-2"
          >
            <span aria-hidden="true">{flag}</span>
            {label}
            {code === locale && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}