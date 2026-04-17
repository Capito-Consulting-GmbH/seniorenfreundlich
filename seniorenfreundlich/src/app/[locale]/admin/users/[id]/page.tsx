import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/src/lib/auth";
import { getCurrentUser } from "@/src/auth/getCurrentUser";
import { listAuditEvents } from "@/src/services/auditService";
import { getCompanyByOwner } from "@/src/services/companyService";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { UserActions } from "./UserActions";
import { AuditEventRow } from "@/src/components/admin/AuditEventRow";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ id: string; locale: string }> };

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;

  const [userResult, currentAdmin, { rows: auditRows }, t, tU] = await Promise.all([
    auth.api.getUser({ headers: await headers(), query: { id } }),
    getCurrentUser().catch(() => null),
    listAuditEvents({ entityId: id, page: 1 }),
    getTranslations("admin.user"),
    getTranslations("admin.users"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = userResult as any;
  if (!u) notFound();

  const company = await getCompanyByOwner(id).catch(() => null);

  const isSelf = currentAdmin?.userId === id;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{u.name}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{u.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={u.role === "admin" ? "default" : "outline"}>{u.role ?? "user"}</Badge>
          {u.banned ? (
            <Badge variant="destructive">{tU("banned")}</Badge>
          ) : (
            <Badge variant="outline">{tU("active")}</Badge>
          )}
          {u.emailVerified && <Badge variant="secondary">{tU("verified")}</Badge>}
        </div>
      </div>

      <UserActions
        userId={id}
        currentRole={u.role ?? "user"}
        isBanned={!!u.banned}
        isSelf={isSelf}
      />

      <Separator />

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("sectionAccount")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label={t("labelId")} value={u.id} mono />
            <InfoRow label={t("labelName")} value={u.name} />
            <InfoRow label={t("labelEmail")} value={u.email} />
            <InfoRow label={t("labelRole")} value={u.role ?? "user"} />
            <InfoRow label={t("labelEmailVerified")} value={u.emailVerified ? t("yes") : t("no")} />
            <InfoRow label={t("labelBanned")} value={u.banned ? t("yes") : t("no")} />
            {u.banReason && <InfoRow label={t("labelBanReason")} value={u.banReason} />}
            <InfoRow label={t("labelCreated")} value={new Date(u.createdAt).toLocaleString("de-DE")} />
            <InfoRow label={t("labelUpdated")} value={new Date(u.updatedAt).toLocaleString("de-DE")} />
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
            <AuditEventRow key={e.id} event={e} showEntity />
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
