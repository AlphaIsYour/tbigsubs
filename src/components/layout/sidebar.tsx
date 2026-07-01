import Link from "next/link";

const MENU = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pelanggan", href: "/customers" },
  { label: "Lokasi/Site", href: "/sites" },
  { label: "Kontraktor", href: "/contractors" },
  { label: "Langganan", href: "/subscriptions" },
  { label: "Pembayaran", href: "/payments" },
  { label: "Log Audit", href: "/audit-logs" },
];

export function Sidebar() {
  return (
    <aside className="w-60 bg-primary-dark text-white min-h-screen">
      <div className="px-4 py-4 border-b border-white/20">
        <span className="font-bold text-sm tracking-wide">
          SISTEM PENAGIHAN
        </span>
      </div>
      <nav className="py-2">
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2 text-sm hover:bg-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
