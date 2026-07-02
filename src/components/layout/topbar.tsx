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
  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-3 sm:px-4 shrink-0">
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
        <span className="text-sm text-ink-muted hidden sm:inline">
          Sistem Pengingat Langganan dan Penagihan
        </span>
        <span className="text-sm text-ink-muted sm:hidden">
          Penagihan
        </span>
      </div>
      <div className="text-sm text-ink">
        <span className="font-semibold">{userName}</span>
        <span className="text-ink-muted hidden sm:inline"> ({userRole})</span>
      </div>
    </header>
  );
}
