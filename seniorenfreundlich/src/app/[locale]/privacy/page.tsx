import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalShell } from "@/src/components/LegalShell";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("metaTitle") };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  return (
    <LegalShell title={t("title")}>
      <Alert className="mb-6">
        <AlertDescription>{t("pending")}</AlertDescription>
      </Alert>

      <h2>{t("h1")}</h2>
      <p>{t("p1")}</p>

      <h2>{t("h2")}</h2>
      <p>{t("p2")}</p>

      <h2>{t("h3")}</h2>
      <p>{t("p3")}</p>

      <h2>{t("h4")}</h2>
      <p>{t("p4")}</p>

      <h2>{t("h5")}</h2>
      <p>{t("p5")}</p>

      <h2>{t("h6")}</h2>
      <p>{t("p6")}</p>

      <h2>{t("h7")}</h2>
      <p>{t("p7")}</p>
    </LegalShell>
  );
}
