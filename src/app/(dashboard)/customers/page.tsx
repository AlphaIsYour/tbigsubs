import Link from "next/link";
import { db } from "@/lib/db";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const page = Number(sp.page ?? "1");
  const pageSize = 20;

  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    db.customer.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-ink">Data Pelanggan</h1>
        <Link
          href="/customers/new"
          className="bg-primary-dark text-white text-sm px-4 py-2"
        >
          TAMBAH PELANGGAN
        </Link>
      </div>

      <form className="mb-4" method="get">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Cari nama atau email..."
          className="border border-border px-3 py-2 text-sm w-72"
        />
        <button
          type="submit"
          className="ml-2 bg-primary text-white text-sm px-4 py-2"
        >
          CARI
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Telepon</th>
            <th>Tipe</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email ?? "-"}</td>
              <td>{c.phone ?? "-"}</td>
              <td>{c.isPermanent ? "Permanen" : "Reguler"}</td>
              <td>
                <Link
                  href={`/customers/${c.id}`}
                  className="text-primary-dark text-xs underline"
                >
                  Detail
                </Link>
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-ink-muted">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 text-xs text-ink-muted">
        Halaman {page} dari {totalPages || 1} ({total} data)
      </div>
    </div>
  );
}
