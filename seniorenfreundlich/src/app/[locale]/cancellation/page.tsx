import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalShell } from "@/src/components/LegalShell";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

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
      <Alert className="mb-6">
        <AlertDescription>{t("pending")}</AlertDescription>
      </Alert>

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
