"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}

export function DashboardShell({
  children,
  userName,
  userRole,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen" suppressHydrationWarning>
      <Sidebar
        mobileOpen={mobileOpen}
        desktopCollapsed={desktopCollapsed}
        onMobileClose={() => setMobileOpen(false)}
        onDesktopToggle={() => setDesktopCollapsed((prev) => !prev)}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen" suppressHydrationWarning>
        <Topbar
          userName={userName}
          userRole={userRole}
          onMobileMenuToggle={() => setMobileOpen((prev) => !prev)}
          onDesktopToggle={() => setDesktopCollapsed((prev) => !prev)}
          desktopCollapsed={desktopCollapsed}
        />
        <main className="p-3 sm:p-6 flex-1 bg-surface-muted">{children}</main>
      </div>
    </div>
  );
}
