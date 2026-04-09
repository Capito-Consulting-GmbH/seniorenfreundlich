import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalShell } from "@/src/components/LegalShell";
import { Link } from "@/src/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("metaTitle") };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");

  return (
    <LegalShell title={t("title")}>
      <p className="rounded bg-amber-50 p-3 text-sm text-amber-700">
        {t("pending")}
      </p>

      <h2>{t("s1h")}</h2>
      <p>{t("s1p")}</p>

      <h2>{t("s2h")}</h2>
      <p>{t("s2p")}</p>

      <h2>{t("s3h")}</h2>
      <p>{t("s3p")}</p>

      <h2>{t("s4h")}</h2>
      <p>
        {t("s4p")}{" "}
        <Link href="/cancellation" className="underline underline-offset-2">
          {t("s4link")}
        </Link>
        .
      </p>

      <h2>{t("s5h")}</h2>
      <p>{t("s5p")}</p>

      <h2>{t("s6h")}</h2>
      <p>{t("s6p")}</p>
    </LegalShell>
  );
}
