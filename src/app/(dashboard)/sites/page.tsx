import Link from "next/link";
import { db } from "@/lib/db";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default async function SitesPage({
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
            { code: { contains: search, mode: "insensitive" as const } },
            { operatorSiteId: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [sites, total] = await Promise.all([
    db.site.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    db.site.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <Breadcrumb items={[{ label: "Lokasi/Site" }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h1 className="text-lg font-bold text-ink">Data Lokasi/Site</h1>
        <Link
          href="/sites/new"
          className="bg-primary-dark text-white text-sm px-4 py-2 text-center"
        >
          TAMBAH SITE
        </Link>
      </div>

      <form className="mb-4 flex flex-col sm:flex-row gap-2" method="get">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Cari nama site..."
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
            <th>Site ID</th>
            <th>Site ID Operator</th>
            <th>Nama Site</th>
            <th>PIC PMO CME</th>
            <th>Progress Tower</th>
            <th>Daya PLN</th>
            <th>ID Pelanggan PLN</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((s) => (
            <tr key={s.id}>
              <td><span className="font-semibold text-ink">{s.code}</span></td>
              <td>{s.operatorSiteId ?? "-"}</td>
              <td>{s.name}</td>
              <td>{s.picPmoCme ?? "-"}</td>
              <td>{s.progressTower ?? "-"}</td>
              <td>{s.dayaPln ? `${s.dayaPln} kVA` : "-"}</td>
              <td>{s.plnCustomerId ?? "-"}</td>
              <td>
                <Link
                  href={`/sites/${s.id}`}
                  className="text-primary-dark text-xs underline font-semibold"
                >
                  Detail
                </Link>
              </td>
            </tr>
          ))}
          {sites.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-ink-muted">
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
        basePath="/sites"
        searchParams={search ? { search } : {}}
      />
    </div>
  );
}
