import { db } from "@/lib/db";

export default async function DashboardPage() {
  const [activeCount, dueSoonCount, overdueCount, permanentCount] =
    await Promise.all([
      db.subscription.count({ where: { status: "ACTIVE", deletedAt: null } }),
      db.subscription.count({ where: { status: "DUE_SOON", deletedAt: null } }),
      db.subscription.count({ where: { status: "OVERDUE", deletedAt: null } }),
      db.customer.count({ where: { isPermanent: true, deletedAt: null } }),
    ]);

  const cards = [
    { label: "Langganan Aktif", value: activeCount },
    { label: "Akan Jatuh Tempo", value: dueSoonCount },
    { label: "Lewat Jatuh Tempo", value: overdueCount },
    { label: "Pelanggan Permanen", value: permanentCount },
  ];

  return (
    <div>
      <h1 className="text-lg font-bold text-ink mb-4">Ringkasan</h1>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-border p-4">
            <div className="text-xs text-ink-muted uppercase">{card.label}</div>
            <div className="text-2xl font-bold text-primary-dark mt-2">
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
