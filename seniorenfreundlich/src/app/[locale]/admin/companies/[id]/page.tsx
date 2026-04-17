import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCompanyById } from "@/src/services/companyService";
import { getOrdersByCompany } from "@/src/services/orderService";
import { listAuditEvents } from "@/src/services/auditService";
import { db } from "@/src/db/db";
import { badges } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { CompanyActions } from "./CompanyActions";
import { AuditEventRow } from "@/src/components/admin/AuditEventRow";
import { ArrowLeft, ExternalLink } from "lucide-react";

type Props = { params: Promise<{ id: string; locale: string }> };

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;

  const [company, orders, allBadges, { rows: auditRows }, t] = await Promise.all([
    getCompanyById(id),
    getOrdersByCompany(id),
    db.select().from(badges).where(eq(badges.companyId, id)).orderBy(desc(badges.issuedAt)),
    listAuditEvents({ entityId: id, page: 1 }),
    getTranslations("admin.company"),
  ]);

  if (!company) notFound();

  const activeBadge = allBadges.find((b) => b.status === "active");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/companies" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground text-sm mt-0.5 font-mono">{company.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={company.verificationStatus === "verified" ? "default" : company.verificationStatus === "pending" ? "secondary" : "outline"}>
            {company.verificationStatus}
          </Badge>
          {activeBadge ? (
            <Badge variant="default">{t("badgeActive")}</Badge>
          ) : (
            <Badge variant="outline">{t("noBadge")}</Badge>
          )}
        </div>
      </div>

      <CompanyActions
        companyId={company.id}
        hasBadge={!!activeBadge}
        verified={company.verificationStatus === "verified"}
      />

      <Separator />

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("sectionContact")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label={t("labelEmail")} value={company.email} />
            <Row label={t("labelPhone")} value={company.phone} />
            <Row label={t("labelWebsite")} value={company.website} link />
            <Row label={t("labelAddress")} value={company.address} />
            <Row label={t("labelCity")} value={company.city} />
            <Row label={t("labelPostalCode")} value={company.postalCode} />
            <Row label={t("labelCountry")} value={company.country} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("sectionRegistration")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label={t("labelId")} value={company.id} mono />
            <Row label={t("labelOwnerId")} value={company.ownerUserId} mono />
            <Row label={t("labelHrb")} value={company.hrbNumber} />
            <Row label={t("labelVerifiedAt")} value={company.verifiedAt?.toLocaleString("de-DE")} />
            <Row label={t("labelVerificationAttempts")} value={String(company.verificationAttempts)} />
            <Row label={t("labelCreated")} value={company.createdAt.toLocaleString("de-DE")} />
            <Row label={t("labelUpdated")} value={company.updatedAt.toLocaleString("de-DE")} />
          </CardContent>
        </Card>
      </div>

      {company.description && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t("sectionDescription")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{company.description}</p>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">{t("sectionBadges", { count: allBadges.length })}</h2>
        <div className="rounded-md border divide-y">
          {allBadges.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">{t("noBadgesYet")}</p>}
          {allBadges.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="text-sm">
                <Link href={`/admin/badges/${b.id}`} className="font-mono hover:underline text-xs">{b.id}</Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("badgeIssued", { date: b.issuedAt.toLocaleDateString("de-DE") })}
                  {b.revokedAt && ` · ${t("badgeRevoked", { date: b.revokedAt.toLocaleDateString("de-DE") })}`}
                </p>
              </div>
              <Badge variant={b.status === "active" ? "default" : "destructive"}>{b.status}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">{t("sectionOrders", { count: orders.length })}</h2>
        <div className="rounded-md border divide-y">
          {orders.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">{t("noOrdersYet")}</p>}
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="text-sm">
                <Link href={`/admin/orders/${o.id}`} className="font-mono hover:underline text-xs">{o.id}</Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  €{(o.amount / 100).toFixed(2)} · {o.currency} · {o.createdAt.toLocaleDateString("de-DE")}
                  {o.molliePaymentId && ` · ${o.molliePaymentId}`}
                </p>
              </div>
              <Badge variant={o.status === "paid" ? "default" : o.status === "failed" || o.status === "refunded" ? "destructive" : "secondary"}>
                {o.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">{t("sectionAudit")}</h2>
        <div className="rounded-md border divide-y">
          {auditRows.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">{t("noEventsYet")}</p>}
          {auditRows.map((e) => (
            <AuditEventRow key={e.id} event={e} showEntity={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  link,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  link?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="truncate flex items-center gap-1 hover:underline text-primary">
          {value} <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ) : (
        <span className={`truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
      )}
    </div>
  );
}
