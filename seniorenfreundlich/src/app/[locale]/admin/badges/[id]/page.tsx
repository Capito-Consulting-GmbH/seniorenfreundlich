import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getBadgeById } from "@/src/services/badgeService";
import { getCompanyById } from "@/src/services/companyService";
import { listAuditEvents } from "@/src/services/auditService";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { BadgeActions } from "./BadgeActions";
import { AuditEventRow } from "@/src/components/admin/AuditEventRow";
import { ArrowLeft, ExternalLink } from "lucide-react";

type Props = { params: Promise<{ id: string; locale: string }> };

export default async function BadgeDetailPage({ params }: Props) {
  const { id } = await params;

  const badge = await getBadgeById(id);
  if (!badge) notFound();

  const [company, { rows: auditRows }, t] = await Promise.all([
    getCompanyById(badge.companyId),
    listAuditEvents({ entityId: id, page: 1 }),
    getTranslations("admin.badge"),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/badges" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold font-mono">{badge.id}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {company ? (
              <Link href={`/admin/companies/${company.id}`} className="hover:underline">
                {company.name}
              </Link>
            ) : (
              badge.companyId
            )}
          </p>
        </div>
        <Badge variant={badge.status === "active" ? "default" : "destructive"} className="text-sm px-3 py-1">
          {badge.status}
        </Badge>
      </div>

      <BadgeActions
        badgeId={badge.id}
        companyId={badge.companyId}
        status={badge.status}
      />

      <Separator />

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("sectionDetails")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label={t("labelId")} value={badge.id} mono />
            <InfoRow label={t("labelAssertionId")} value={badge.assertionId} mono />
            <InfoRow label={t("labelStatus")} value={badge.status} />
            <InfoRow label={t("labelIssuedAt")} value={badge.issuedAt.toLocaleString("de-DE")} />
            <InfoRow label={t("labelRevokedAt")} value={badge.revokedAt?.toLocaleString("de-DE")} />
          </CardContent>
        </Card>

        {company && (
          <Card>
            <CardHeader><CardTitle className="text-base">{t("sectionCompany")}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label={t("labelName")} value={company.name} />
              <InfoRow label={t("labelEmail")} value={company.email} />
              <InfoRow label={t("labelCity")} value={company.city} />
              <InfoRow label={t("labelVerification")} value={company.verificationStatus} />
              <div className="flex gap-3 pt-1">
                <Link href={`/admin/companies/${company.id}`} className="text-primary hover:underline text-xs">
                  {t("adminView")}
                </Link>
                <a
                  href={`/certificate/${company.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs flex items-center gap-1"
                >
                  {t("certificate")} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">{t("sectionAudit")}</h2>
        <div className="rounded-md border divide-y">
          {auditRows.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">{t("noEventsYet")}</p>
          )}
          {auditRows.map((e) => (
            <AuditEventRow key={e.id} event={e} showEntity={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
