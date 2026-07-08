import { db } from "@/lib/db";
import Link from "next/link";
import {
  SubscriptionStatusChart,
  MonthlyPaymentsChart,
  NotificationTrendChart,
} from "@/components/dashboard/charts";

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

export default async function DashboardPage() {
  const now = new Date();

  // ── Summary counts (Only Temporary Power / MONTHLY) ──
  const [
    activeCount,
    dueSoonCount,
    overdueCount,
    totalCustomers,
    totalSites,
    cancelledCount,
    suspendedCount,
  ] = await Promise.all([
    db.subscription.count({ where: { status: "ACTIVE", type: "MONTHLY", deletedAt: null } }),
    db.subscription.count({ where: { status: "DUE_SOON", type: "MONTHLY", deletedAt: null } }),
    db.subscription.count({ where: { status: "OVERDUE", type: "MONTHLY", deletedAt: null } }),
    db.customer.count({ where: { deletedAt: null } }),
    db.site.count({ where: { deletedAt: null, subscriptions: { some: { type: "MONTHLY" } } } }),
    db.subscription.count({ where: { status: "CANCELLED", type: "MONTHLY", deletedAt: null } }),
    db.subscription.count({ where: { status: "SUSPENDED", type: "MONTHLY", deletedAt: null } }),
  ]);

  // ── Monthly payments (last 6 months) ──
  const monthlyPayments: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);

    const agg = await db.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: start, lt: end },
        subscription: { type: "MONTHLY" },
      },
      _sum: { amount: true },
    });

    monthlyPayments.push({
      month: getMonthLabel(d),
      total: Number(agg._sum.amount ?? 0),
    });
  }

  // ── Notification trend (last 6 months) ──
  const notifTrend: { month: string; sent: number; failed: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);

    const [sentCount, failedCount] = await Promise.all([
      db.notificationLog.count({
        where: {
          status: "SENT",
          createdAt: { gte: start, lt: end },
          subscription: { type: "MONTHLY" },
        },
      }),
      db.notificationLog.count({
        where: {
          status: "FAILED",
          createdAt: { gte: start, lt: end },
          subscription: { type: "MONTHLY" },
        },
      }),
    ]);

    notifTrend.push({
      month: getMonthLabel(d),
      sent: sentCount,
      failed: failedCount,
    });
  }

  // ── Upcoming due subscriptions (Only Temporary Power) ──
  const upcomingDue = await db.subscription.findMany({
    where: {
      deletedAt: null,
      type: "MONTHLY",
      status: { in: ["ACTIVE", "DUE_SOON", "OVERDUE"] },
      dueDate: { not: null },
    },
    orderBy: { dueDate: "asc" },
    take: 8,
    include: {
      customer: true,
      site: { include: { customer: true } },
    },
  });

  // ── Recent notifications (Only Temporary Power) ──
  const recentNotifs = await db.notificationLog.findMany({
    where: {
      subscription: {
        type: "MONTHLY",
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      subscription: {
        include: { customer: true, site: { include: { customer: true } } },
      },
    },
  });

  // ── Chart data ──
  const statusChartData = [
    { name: "Aktif", value: activeCount, color: "#1e7a4c" },
    { name: "Akan Jatuh Tempo", value: dueSoonCount, color: "#b8860b" },
    { name: "Lewat Jatuh Tempo", value: overdueCount, color: "#b3261e" },
    { name: "Ditangguhkan", value: suspendedCount, color: "#6b7280" },
    { name: "Dibatalkan", value: cancelledCount, color: "#9ca3af" },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <h1 className="text-lg font-bold text-ink mb-4">Ringkasan Dashboard</h1>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Temporary Power Aktif", value: activeCount, color: "text-status-active" },
          { label: "Akan Jatuh Tempo", value: dueSoonCount, color: "text-status-dueSoon" },
          { label: "Lewat Jatuh Tempo", value: overdueCount, color: "text-status-overdue" },
          { label: "Total Pelanggan", value: totalCustomers, color: "text-primary-dark" },
          { label: "Total Site", value: totalSites, color: "text-primary-dark" },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-border p-4">
            <div className="text-xs text-ink-muted uppercase">{card.label}</div>
            <div className={`text-2xl font-bold mt-2 ${card.color}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <MonthlyPaymentsChart data={monthlyPayments} />
        <SubscriptionStatusChart data={statusChartData} />
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <NotificationTrendChart data={notifTrend} />
      </div>

      {/* ── Tables Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Due */}
        <div className="bg-white border border-border p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-ink">Segera Jatuh Tempo</h2>
            <Link
              href="/subscriptions?status=DUE_SOON"
              className="text-xs text-primary-dark underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th>Site</th>
                  <th>Jatuh Tempo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingDue.map((sub) => {
                  const custName =
                    sub.customer?.name ?? sub.site.customer.name;
                  const statusLabel =
                    sub.status === "OVERDUE"
                      ? "Lewat"
                      : sub.status === "DUE_SOON"
                        ? "Segera"
                        : "Aktif";
                  const statusColor =
                    sub.status === "OVERDUE"
                      ? "text-status-overdue"
                      : sub.status === "DUE_SOON"
                        ? "text-status-dueSoon"
                        : "text-status-active";

                  return (
                    <tr key={sub.id}>
                      <td>
                        <Link
                          href={`/subscriptions/${sub.id}`}
                          className="text-primary-dark underline"
                        >
                          {custName}
                        </Link>
                      </td>
                      <td>{sub.site?.name ?? "-"}</td>
                      <td>
                        {sub.dueDate
                          ? new Date(sub.dueDate).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className={`font-semibold ${statusColor}`}>
                        {statusLabel}
                      </td>
                    </tr>
                  );
                })}
                {upcomingDue.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-ink-muted">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white border border-border p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-ink">Notifikasi Terbaru</h2>
            <Link
              href="/notifications"
              className="text-xs text-primary-dark underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentNotifs.map((n) => {
                  const custName =
                    n.subscription.customer?.name ??
                    n.subscription.site.customer.name;
                  const statusColor =
                    n.status === "SENT"
                      ? "text-status-active"
                      : n.status === "FAILED"
                        ? "text-status-overdue"
                        : "text-ink-muted";

                  return (
                    <tr key={n.id}>
                      <td>{custName}</td>
                      <td>{n.triggerType ?? n.type}</td>
                      <td className={`font-semibold ${statusColor}`}>
                        {n.status}
                      </td>
                      <td>
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
                {recentNotifs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-ink-muted">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
