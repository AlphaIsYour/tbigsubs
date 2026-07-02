import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <div className="mt-4 text-xs text-ink-muted">
        {totalItems} data
      </div>
    );
  }

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  // Build page numbers to show
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <span className="text-xs text-ink-muted">
        Halaman {currentPage} dari {totalPages} ({totalItems} data)
      </span>
      <div className="flex items-center gap-1">
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className="px-2 py-1 text-xs border border-border hover:bg-surface-muted"
          >
            ‹ Prev
          </Link>
        ) : (
          <span className="px-2 py-1 text-xs border border-border text-ink-muted opacity-50">
            ‹ Prev
          </span>
        )}

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dot-${i}`} className="px-2 py-1 text-xs text-ink-muted">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              className={`px-2 py-1 text-xs border ${
                p === currentPage
                  ? "bg-primary-dark text-white border-primary-dark font-semibold"
                  : "border-border hover:bg-surface-muted"
              }`}
            >
              {p}
            </Link>
          ),
        )}

        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className="px-2 py-1 text-xs border border-border hover:bg-surface-muted"
          >
            Next ›
          </Link>
        ) : (
          <span className="px-2 py-1 text-xs border border-border text-ink-muted opacity-50">
            Next ›
          </span>
        )}
      </div>
    </div>
  );
}
