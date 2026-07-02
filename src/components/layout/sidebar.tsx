"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const MENU = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pelanggan", href: "/customers" },
  { label: "Lokasi/Site", href: "/sites" },
  { label: "Kontraktor", href: "/contractors" },
  { label: "Langganan", href: "/subscriptions" },
  { label: "Pembayaran", href: "/payments" },
  { label: "Notifikasi", href: "/notifications" },
  { label: "Log Audit", href: "/audit-logs" },
];

interface SidebarProps {
  mobileOpen: boolean;
  desktopCollapsed: boolean;
  onMobileClose: () => void;
  onDesktopToggle: () => void;
}

export function Sidebar({
  mobileOpen,
  desktopCollapsed,
  onMobileClose,
  onDesktopToggle,
}: SidebarProps) {
  const pathname = usePathname();

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        suppressHydrationWarning
        className={`
          fixed top-0 left-0 z-50 h-full w-60
          bg-[#11499E] text-white flex flex-col shrink-0
          transition-transform duration-200 ease-in-out
          lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/20 h-14">
          <span className="font-bold text-xs tracking-wide uppercase truncate">
            Sistem Penagihan
          </span>
          <button
            onClick={onMobileClose}
            className="ml-auto flex items-center justify-center w-8 h-8 hover:bg-white/10 shrink-0"
            title="Tutup sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
        <nav className="py-1 flex-1 overflow-y-auto">
          {MENU.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center h-10 text-sm px-3 gap-3 ${
                  isActive ? "bg-[#1E99D5] font-semibold" : "hover:bg-white/10"
                }`}
              >
                <MenuIcon href={item.href} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside
        suppressHydrationWarning
        className={`
          hidden lg:flex flex-col shrink-0
          bg-[#11499E] text-white
          sticky top-0 h-screen overflow-y-auto
          transition-all duration-200 ease-in-out
          ${desktopCollapsed ? "w-14" : "w-60"}
        `}
      >
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/20 h-14">
          {!desktopCollapsed && (
            <span className="font-bold text-xs tracking-wide uppercase truncate">
              Sistem Penagihan
            </span>
          )}
          <button
            onClick={onDesktopToggle}
            className="ml-auto flex items-center justify-center w-8 h-8 hover:bg-white/10 shrink-0"
            title={desktopCollapsed ? "Buka sidebar" : "Tutup sidebar"}
          >
            {desktopCollapsed ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4h12M2 8h12M2 12h12"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 2L4 8l6 6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
            )}
          </button>
        </div>
        <nav className="py-1 flex-1 overflow-y-auto">
          {MENU.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={desktopCollapsed ? item.label : undefined}
                className={`flex items-center h-10 text-sm px-3 gap-3 ${
                  isActive ? "bg-[#1E99D5] font-semibold" : "hover:bg-white/10"
                }`}
              >
                <MenuIcon href={item.href} />
                {!desktopCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function MenuIcon({ href }: { href: string }) {
  const icons: Record<string, React.ReactNode> = {
    "/dashboard": (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5" height="5" stroke="white" strokeWidth="1.3" />
        <rect x="9" y="1" width="5" height="5" stroke="white" strokeWidth="1.3" />
        <rect x="1" y="9" width="5" height="5" stroke="white" strokeWidth="1.3" />
        <rect x="9" y="9" width="5" height="5" stroke="white" strokeWidth="1.3" />
      </svg>
    ),
    "/customers": (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="5" r="3" stroke="white" strokeWidth="1.3" />
        <path d="M1 14c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="white" strokeWidth="1.3" strokeLinecap="square" />
      </svg>
    ),
    "/sites": (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 13V6l5.5-4L13 6v7H9.5v-4h-3v4H2z" stroke="white" strokeWidth="1.3" strokeLinejoin="miter" />
      </svg>
    ),
    "/contractors": (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="5" y="1" width="5" height="3" stroke="white" strokeWidth="1.3" />
        <rect x="1" y="4" width="13" height="9" stroke="white" strokeWidth="1.3" />
        <path d="M1 8h13" stroke="white" strokeWidth="1.3" />
      </svg>
    ),
    "/subscriptions": (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="13" height="13" stroke="white" strokeWidth="1.3" />
        <path d="M1 5h13M5 5v9" stroke="white" strokeWidth="1.3" />
      </svg>
    ),
    "/payments": (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="3" width="13" height="9" stroke="white" strokeWidth="1.3" />
        <path d="M1 6h13" stroke="white" strokeWidth="1.3" />
      </svg>
    ),
    "/notifications": (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 1a4.5 4.5 0 0 1 4.5 4.5c0 2.5.5 4 1.5 5H1.5C2.5 9.5 3 8 3 5.5A4.5 4.5 0 0 1 7.5 1z" stroke="white" strokeWidth="1.3" />
        <path d="M6 10.5c0 .83.67 1.5 1.5 1.5S9 11.33 9 10.5" stroke="white" strokeWidth="1.3" />
      </svg>
    ),
    "/audit-logs": (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="2" y="1" width="11" height="13" stroke="white" strokeWidth="1.3" />
        <path d="M5 4h5M5 7h5M5 10h3" stroke="white" strokeWidth="1.3" strokeLinecap="square" />
      </svg>
    ),
  };

  return <span className="shrink-0">{icons[href] ?? null}</span>;
}
