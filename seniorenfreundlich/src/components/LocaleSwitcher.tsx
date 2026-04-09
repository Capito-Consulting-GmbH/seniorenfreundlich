"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/src/i18n/navigation";

type Props = {
  onLocaleChange?: () => void;
};

const locales = ["de", "en"] as const;

export function LocaleSwitcher({ onLocaleChange }: Props) {
  const locale = useLocale();
  const pathname = usePathname(); // locale-stripped by next-intl
  const t = useTranslations("nav");

  return (
    <div
      className="inline-flex items-center rounded-full border border-zinc-300 bg-white p-0.5"
      role="group"
      aria-label={t("languageLabel")}
    >
      {locales.map((nextLocale) => {
        const isActive = locale === nextLocale;
        return (
          <button
            key={nextLocale}
            type="button"
            onClick={() => {
              if (isActive) return;
              onLocaleChange?.();
              // Hard-navigate to flush the RootLayout (NextIntlClientProvider).
              // Set NEXT_LOCALE cookie first so middleware won't redirect back.
              document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
              const prefix = nextLocale === "en" ? "/en" : "";
              const target = (prefix + (pathname === "/" ? "" : pathname)) || "/";
              window.location.href = target + window.location.search;
            }}
            aria-pressed={isActive}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              isActive
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {nextLocale === "de" ? t("langDe") : t("langEn")}
          </button>
        );
      })}
    </div>
  );
}