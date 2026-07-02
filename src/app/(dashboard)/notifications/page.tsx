import { db } from "@/lib/db";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-ink-muted",
  SENT: "text-status-active",
  FAILED: "text-status-overdue",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const page = Number(sp.page ?? "1");
  const pageSize = 30;

  const where = search
    ? { recipient: { contains: search, mode: "insensitive" as const } }
    : {};

  const [logs, total] = await Promise.all([
    db.notificationLog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { sentAt: "desc" },
      include: {
        subscription: {
          include: { customer: true, site: { include: { customer: true } } },
        },
      },
    }),
    db.notificationLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className="text-lg font-bold text-ink mb-4">Riwayat Notifikasi</h1>

      <form className="mb-4 flex flex-col sm:flex-row gap-2" method="get">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Cari email penerima..."
          className="border border-border px-3 py-2 text-sm w-full sm:w-72"
        />
        <button
          type="submit"
          className="bg-primary text-white text-sm px-4 py-2"
        >
          CARI
        </button>
      </form>

      <div className="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Pelanggan</th>
            <th>Tipe Trigger</th>
            <th>Penerima</th>
            <th>Channel</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>
                {log.sentAt
                  ? new Date(log.sentAt).toLocaleString("id-ID")
                  : "-"}
              </td>
              <td>
                {log.subscription.customer?.name ??
                  log.subscription.site.customer.name}
              </td>
              <td>{log.triggerType ?? log.type}</td>
              <td>{log.recipient ?? "-"}</td>
              <td>{log.channel}</td>
              <td className={STATUS_COLOR[log.status]}>{log.status}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-ink-muted">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      <div className="mt-4 text-xs text-ink-muted">
        Halaman {page} dari {totalPages || 1} ({total} data)
      </div>
    </div>
  );
}
