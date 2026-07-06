import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { RenewButton } from "./renew-button";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktif",
  DUE_SOON: "Akan Jatuh Tempo",
  OVERDUE: "Lewat Jatuh Tempo",
  SUSPENDED: "Ditangguhkan",
  CANCELLED: "Dibatalkan",
};

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const subscription = await db.subscription.findFirst({
    where: { id, deletedAt: null },
    include: {
      customer: true,
      site: { include: { customer: true } },
      contractor: true,
      plan: true,
      invoices: { include: { payments: true }, orderBy: { createdAt: "desc" } },
      notifications: { orderBy: { sentAt: "desc" }, take: 20 },
    },
  });

  if (!subscription) notFound();

  return (
    <div>
      <Breadcrumb items={[{ label: "Langganan", href: "/subscriptions" }, { label: "Detail" }]} />
      <h1 className="text-lg font-bold text-ink mb-4">Detail Langganan</h1>

      <div className="bg-white border border-border p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-ink-muted text-xs block font-medium">Pelanggan</span>
            <span className="text-ink font-semibold">{subscription.customer?.name ?? subscription.site.customer.name}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Site ID / Nama</span>
            <span className="text-ink font-semibold">{subscription.site?.code} - {subscription.site?.name}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Site ID Operator</span>
            <span className="text-ink font-semibold">{subscription.site?.operatorSiteId ?? "-"}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Kontraktor / Mitra</span>
            <span className="text-ink font-semibold">{subscription.contractor?.name ?? "-"} ({subscription.contractor?.code ?? "-"})</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Email Mitra</span>
            <span className="text-ink font-semibold">{subscription.contractor?.email ?? "-"}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Paket</span>
            <span className="text-ink font-semibold">{subscription.plan.name}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Tipe</span>
            <span className="text-ink font-semibold">{subscription.type === "PERMANENT" ? "Permanen" : "Bulanan"}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Status</span>
            <span className="text-ink font-semibold">{STATUS_LABEL[subscription.status]}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Tanggal Mulai</span>
            <span className="text-ink font-semibold">{new Date(subscription.startDate).toLocaleDateString("id-ID")}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Tanggal Berakhir</span>
            <span className="text-ink font-semibold">
              {subscription.endDate
                ? new Date(subscription.endDate).toLocaleDateString("id-ID")
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Jatuh Tempo</span>
            <span className="text-ink font-semibold">
              {subscription.dueDate
                ? new Date(subscription.dueDate).toLocaleDateString("id-ID")
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">MG Type (Suplisi/Normal)</span>
            <span className="text-ink font-semibold">{subscription.mgSuplisiNormal ?? "-"}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Target PLN Permanen Konek</span>
            <span className="text-ink font-semibold">
              {subscription.targetPermanenKonek
                ? new Date(subscription.targetPermanenKonek).toLocaleDateString("id-ID")
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Daya PLN</span>
            <span className="text-ink font-semibold">{subscription.site?.dayaPln ? `${subscription.site.dayaPln} kVA` : "-"}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">ID Pelanggan PLN</span>
            <span className="text-ink font-semibold">{subscription.site?.plnCustomerId ?? "-"}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Tgl Nyala Permanen</span>
            <span className="text-ink font-semibold">
              {subscription.site?.tglNyalaPermanen
                ? new Date(subscription.site.tglNyalaPermanen).toLocaleDateString("id-ID")
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">PIC PMO CME</span>
            <span className="text-ink font-semibold">{subscription.site?.picPmoCme ?? "-"}</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs block font-medium">Progress Tower</span>
            <span className="text-ink font-semibold">{subscription.site?.progressTower ?? "-"}</span>
          </div>
        </div>

        {subscription.type === "MONTHLY" && (
          <div className="mt-4">
            <RenewButton subscriptionId={subscription.id} />
          </div>
        )}
      </div>

      <h2 className="text-base font-bold text-ink mb-2">Riwayat Tagihan</h2>
      <div className="table-responsive">
      <table className="mb-6">
        <thead>
          <tr>
            <th>No. Invoice</th>
            <th>Periode</th>
            <th>Jumlah</th>
            <th>Status</th>
            <th>Jatuh Tempo</th>
          </tr>
        </thead>
        <tbody>
          {subscription.invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoiceNumber}</td>
              <td>
                {new Date(inv.periodStart).toLocaleDateString("id-ID")} -{" "}
                {new Date(inv.periodEnd).toLocaleDateString("id-ID")}
              </td>
              <td>Rp {Number(inv.amount).toLocaleString("id-ID")}</td>
              <td>{inv.status}</td>
              <td>{new Date(inv.dueDate).toLocaleDateString("id-ID")}</td>
            </tr>
          ))}
          {subscription.invoices.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-ink-muted">
                Belum ada tagihan
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      <h2 className="text-base font-bold text-ink mb-2 mt-6">Riwayat Notifikasi</h2>
      <div className="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Tipe</th>
            <th>Penerima</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {subscription.notifications.map((n) => (
            <tr key={n.id}>
              <td>
                {n.sentAt ? new Date(n.sentAt).toLocaleString("id-ID") : "-"}
              </td>
              <td>{n.triggerType ?? n.type}</td>
              <td>{n.recipient ?? "-"}</td>
              <td>{n.status}</td>
            </tr>
          ))}
          {subscription.notifications.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-ink-muted">
                Belum ada notifikasi
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
