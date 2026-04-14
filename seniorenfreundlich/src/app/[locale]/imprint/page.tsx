import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalShell } from "@/src/components/LegalShell";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "imprint" });
  return { title: t("metaTitle") };
}

export default async function ImprintPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("imprint");

  return (
    <LegalShell title={t("title")}>
      <Alert className="mb-6">
        <AlertDescription>{t("pending")}</AlertDescription>
      </Alert>

      <h2>{t("h_legalInfo")}</h2>
      <p className="whitespace-pre-line">{t("p_address")}</p>

      <h2>{t("h_contact")}</h2>
      <p className="whitespace-pre-line">{t("p_contact")}</p>

      <h2>{t("h_representedBy")}</h2>
      <p>{t("p_representedBy")}</p>

      <h2>{t("h_register")}</h2>
      <p className="whitespace-pre-line">{t("p_register")}</p>

      <h2>{t("h_vat")}</h2>
      <p className="whitespace-pre-line">{t("p_vat")}</p>

      <h2>{t("h_contentResponsible")}</h2>
      <p className="whitespace-pre-line">{t("p_contentResponsible")}</p>
    </LegalShell>
  );
}
