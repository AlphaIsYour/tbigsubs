import { db } from "@/lib/db";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const page = Number(sp.page ?? "1");
  const pageSize = 20;

  const where = search
    ? {
        OR: [
          {
            invoice: {
              invoiceNumber: { contains: search, mode: "insensitive" as const },
            },
          },
          {
            subscription: {
              customer: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
          },
          {
            subscription: {
              site: {
                customer: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            },
          },
        ],
      }
    : {};

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { paidAt: "desc" },
      include: {
        invoice: { include: { subscription: { include: { customer: true } } } },
        subscription: {
          include: { customer: true, site: { include: { customer: true } } },
        },
      },
    }),
    db.payment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <Breadcrumb items={[{ label: "Pembayaran" }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h1 className="text-lg font-bold text-ink">Riwayat Pembayaran</h1>
        <Link
          href="/payments/new"
          className="bg-primary-dark text-white text-sm px-4 py-2 text-center"
        >
          CATAT PEMBAYARAN
        </Link>
      </div>

      <form className="mb-4 flex flex-col sm:flex-row gap-2" method="get">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Cari no. invoice atau nama pelanggan..."
          className="border border-border px-3 py-2 text-sm w-full sm:w-80"
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
            <th>Tanggal Bayar</th>
            <th>No. Invoice</th>
            <th>Pelanggan</th>
            <th>Jumlah</th>
            <th>Metode</th>
            <th>Referensi</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{new Date(p.paidAt).toLocaleString("id-ID")}</td>
              <td>{p.invoice?.invoiceNumber ?? p.code}</td>
              <td>
                {p.invoice?.subscription.customer?.name ??
                  p.subscription.customer?.name ??
                  p.subscription.site.customer.name}
              </td>
              <td>Rp {Number(p.amount).toLocaleString("id-ID")}</td>
              <td>{p.method ?? "-"}</td>
              <td>{p.reference ?? "-"}</td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-ink-muted">
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
        basePath="/payments"
        searchParams={search ? { search } : {}}
      />
    </div>
  );
}
