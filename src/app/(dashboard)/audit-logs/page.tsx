import { db } from "@/lib/db";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const entityType = sp.entityType ?? "";
  const page = Number(sp.page ?? "1");
  const pageSize = 30;

  const where = entityType ? { entityType } : {};

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    db.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <Breadcrumb items={[{ label: "Log Audit" }]} />
      <h1 className="text-lg font-bold text-ink mb-4">Log Audit</h1>

      <form className="mb-4 flex flex-col sm:flex-row gap-2" method="get">
        <select
          name="entityType"
          defaultValue={entityType}
          className="border border-border px-3 py-2 text-sm w-full sm:w-auto"
        >
          <option value="">Semua Entitas</option>
          <option value="Customer">Pelanggan</option>
          <option value="Site">Site</option>
          <option value="Contractor">Kontraktor</option>
          <option value="Subscription">Langganan</option>
          <option value="Invoice">Invoice</option>
          <option value="Payment">Pembayaran</option>
          <option value="SubscriptionPlan">Paket Langganan</option>
        </select>
        <button
          type="submit"
          className="bg-primary text-white text-sm px-4 py-2"
        >
          FILTER
        </button>
      </form>

      <div className="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Pengguna</th>
            <th>Aksi</th>
            <th>Entitas</th>
            <th>ID Entitas</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.createdAt).toLocaleString("id-ID")}</td>
              <td>{log.user?.name ?? "Sistem"}</td>
              <td>{log.action}</td>
              <td>{log.entityType}</td>
              <td className="text-xs">{log.entityId ?? "-"}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-ink-muted">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        basePath="/audit-logs"
        searchParams={entityType ? { entityType } : {}}
      />
    </div>
  );
}
