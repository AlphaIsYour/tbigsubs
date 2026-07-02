import Link from "next/link";
import { db } from "@/lib/db";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktif",
  DUE_SOON: "Akan Jatuh Tempo",
  OVERDUE: "Lewat Jatuh Tempo",
  SUSPENDED: "Ditangguhkan",
  CANCELLED: "Dibatalkan",
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "text-status-active",
  DUE_SOON: "text-status-dueSoon",
  OVERDUE: "text-status-overdue",
  SUSPENDED: "text-ink-muted",
  CANCELLED: "text-ink-muted",
};

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const type = sp.type ?? "";
  const page = Number(sp.page ?? "1");
  const pageSize = 20;

  const where = {
    deletedAt: null,
    ...(status
      ? {
          status: status as
            | "ACTIVE"
            | "DUE_SOON"
            | "OVERDUE"
            | "SUSPENDED"
            | "CANCELLED",
        }
      : {}),
    ...(type ? { type: type as "PERMANENT" | "MONTHLY" } : {}),
    ...(search
      ? {
          customer: {
            name: { contains: search, mode: "insensitive" as const },
          },
        }
      : {}),
  };

  const [subs, total] = await Promise.all([
    db.subscription.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { dueDate: "asc" },
      include: { customer: true, site: { include: { customer: true } }, plan: true },
    }),
    db.subscription.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h1 className="text-lg font-bold text-ink">Data Langganan</h1>
        <Link
          href="/subscriptions/new"
          className="bg-primary-dark text-white text-sm px-4 py-2 text-center"
        >
          TAMBAH LANGGANAN
        </Link>
      </div>

      <form className="mb-4 flex flex-col sm:flex-row gap-2 flex-wrap" method="get">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Cari nama pelanggan..."
          className="border border-border px-3 py-2 text-sm w-full sm:w-64">
        </input>
        <select
          name="status"
          defaultValue={status}
          className="border border-border px-3 py-2 text-sm"
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="DUE_SOON">Akan Jatuh Tempo</option>
          <option value="OVERDUE">Lewat Jatuh Tempo</option>
          <option value="SUSPENDED">Ditangguhkan</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
        <select
          name="type"
          defaultValue={type}
          className="border border-border px-3 py-2 text-sm"
        >
          <option value="">Semua Tipe</option>
          <option value="PERMANENT">Permanen</option>
          <option value="MONTHLY">Bulanan</option>
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
            <th>Pelanggan</th>
            <th>Site</th>
            <th>Paket</th>
            <th>Tipe</th>
            <th>Jatuh Tempo</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id}>
              <td>{s.customer?.name ?? s.site.customer.name}</td>
              <td>{s.site?.name ?? "-"}</td>
              <td>{s.plan.name}</td>
              <td>{s.type === "PERMANENT" ? "Permanen" : "Bulanan"}</td>
              <td>
                {s.dueDate
                  ? new Date(s.dueDate).toLocaleDateString("id-ID")
                  : "-"}
              </td>
              <td className={STATUS_COLOR[s.status]}>
                {STATUS_LABEL[s.status]}
              </td>
              <td>
                <Link
                  href={`/subscriptions/${s.id}`}
                  className="text-primary-dark text-xs underline"
                >
                  Detail
                </Link>
              </td>
            </tr>
          ))}
          {subs.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-ink-muted">
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
