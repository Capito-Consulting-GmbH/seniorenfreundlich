import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalShell } from "@/src/components/LegalShell";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cancellation" });
  return { title: t("metaTitle") };
}

export default async function CancellationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cancellation");

  return (
    <LegalShell title={t("title")}>
      <p className="rounded bg-amber-50 p-3 text-sm text-amber-700">
        {t("pending")}
      </p>

      <h2>{t("h_right")}</h2>
      <p>{t("p_right1")}</p>
      <p>{t("p_right2")}</p>

      <h2>{t("h_consequences")}</h2>
      <p>{t("p_consequences")}</p>

      <h2>{t("h_expiry")}</h2>
      <p>{t("p_expiry")}</p>
    </LegalShell>
  );
}
