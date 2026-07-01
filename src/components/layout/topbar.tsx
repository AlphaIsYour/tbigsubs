interface TopbarProps {
  userName: string;
  userRole: string;
}

export function Topbar({ userName, userRole }: TopbarProps) {
  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4">
      <span className="text-sm text-ink-muted">
        Sistem Pengingat Langganan dan Penagihan
      </span>
      <div className="text-sm text-ink">
        <span className="font-semibold">{userName}</span>
        <span className="text-ink-muted"> ({userRole})</span>
      </div>
    </header>
  );
}
