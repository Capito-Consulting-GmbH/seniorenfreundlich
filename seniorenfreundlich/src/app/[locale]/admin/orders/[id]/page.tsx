import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrderById } from "@/src/services/orderService";
import { getCompanyById } from "@/src/services/companyService";
import { listAuditEvents } from "@/src/services/auditService";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { OrderActions } from "./OrderActions";
import { AuditEventRow } from "@/src/components/admin/AuditEventRow";
import { ArrowLeft } from "lucide-react";
import type { Order } from "@/src/services/orderService";

type Props = { params: Promise<{ id: string; locale: string }> };

function statusVariant(s: Order["status"]) {
  if (s === "paid") return "default";
  if (s === "pending") return "secondary";
  return "destructive";
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const [company, { rows: auditRows }, t] = await Promise.all([
    getCompanyById(order.companyId),
    listAuditEvents({ entityId: id, page: 1 }),
    getTranslations("admin.order"),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-mono text-base">{order.id}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {company ? (
              <Link href={`/admin/companies/${company.id}`} className="hover:underline">{company.name}</Link>
            ) : (
              order.companyId
            )}
          </p>
        </div>
        <Badge variant={statusVariant(order.status)} className="text-sm px-3 py-1">
          {order.status}
        </Badge>
      </div>

      <OrderActions orderId={order.id} status={order.status} />

      <Separator />

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("sectionPayment")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label={t("labelAmount")} value={`€${(order.amount / 100).toFixed(2)} ${order.currency}`} />
            <InfoRow label={t("labelStatus")} value={order.status} />
            <InfoRow label={t("labelMolliePaymentId")} value={order.molliePaymentId} mono />
            <InfoRow label={t("labelMollieOrderId")} value={order.mollieOrderId} mono />
            <InfoRow label={t("labelCreated")} value={order.createdAt.toLocaleString("de-DE")} />
            <InfoRow label={t("labelUpdated")} value={order.updatedAt.toLocaleString("de-DE")} />
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
              <div className="pt-1">
                <Link href={`/admin/companies/${company.id}`} className="text-primary hover:underline text-xs">
                  {t("viewCompany")}
                </Link>
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
