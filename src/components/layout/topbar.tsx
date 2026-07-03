"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

interface TopbarProps {
  userName: string;
  userRole: string;
  onMobileMenuToggle: () => void;
  onDesktopToggle: () => void;
  desktopCollapsed: boolean;
}

export function Topbar({
  userName,
  userRole,
  onMobileMenuToggle,
}: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-3 sm:px-4 shrink-0 relative">
      <div className="flex items-center gap-3">
        {/* Hamburger button - only visible on mobile */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden flex items-center justify-center w-8 h-8 hover:bg-surface-muted"
          title="Toggle menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M2 4h14M2 9h14M2 14h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </button>
        <span className="text-sm text-ink font-semibold">
          TBIG Subs
        </span>
      </div>

      {/* Admin Profile & Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 hover:bg-surface-muted px-3 py-1.5 border border-transparent hover:border-border cursor-pointer select-none transition-colors"
        >
          <div className="text-right">
            <div className="text-xs font-semibold text-ink leading-tight">{userName}</div>
            <div className="text-[10px] text-ink-muted leading-tight uppercase font-medium">{userRole}</div>
          </div>
          <svg
            className={`w-3 h-3 text-ink-muted transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            {/* Click backdrop to close */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />

            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-border shadow-lg z-20 animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="px-4 py-2 border-b border-border bg-surface-muted">
                <p className="text-[10px] text-ink-muted uppercase font-semibold">Pengguna</p>
                <p className="text-xs font-bold text-ink truncate mt-0.5">{userName}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-status-overdue hover:bg-status-overdue/5 font-semibold text-left transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Keluar / Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
