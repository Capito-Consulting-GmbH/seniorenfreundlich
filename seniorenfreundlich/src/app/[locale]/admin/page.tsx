import { getTranslations } from "next-intl/server";
import { getAdminStats, getRecentAuditEvents } from "@/src/services/statsService";
import { StatCard } from "@/src/components/admin/StatCard";
import { AuditEventRow } from "@/src/components/admin/AuditEventRow";

export default async function AdminDashboardPage() {
  const [stats, recentEvents, t] = await Promise.all([
    getAdminStats(),
    getRecentAuditEvents(10),
    getTranslations("admin.dashboard"),
  ]);

  const pct = stats.totalCompanies > 0
    ? Math.round((stats.verifiedCompanies / stats.totalCompanies) * 100)
    : 0;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("totalCompanies")} value={stats.totalCompanies} />
        <StatCard
          label={t("verifiedCompanies")}
          value={stats.verifiedCompanies}
          description={t("ofTotal", { pct })}
        />
        <StatCard label={t("activeBadges")} value={stats.activeBadges} />
        <StatCard label={t("revokedBadges")} value={stats.revokedBadges} />
        <StatCard
          label={t("totalRevenue")}
          value={`€${stats.totalRevenueEur.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
        />
        <StatCard
          label={t("ordersThisMonth")}
          value={stats.ordersThisMonth}
        />
        <StatCard
          label={t("pendingOrders")}
          value={stats.pendingOrders}
          description={stats.pendingOrders > 0 ? t("awaitingPayment") : t("allClear")}
          className={stats.pendingOrders > 0 ? "border-amber-500/50" : ""}
        />
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t("recentActivity")}</h2>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noEvents")}</p>
        ) : (
          <div className="rounded-md border divide-y">
            {recentEvents.map((event) => (
              <AuditEventRow key={event.id} event={event} showEntity />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
