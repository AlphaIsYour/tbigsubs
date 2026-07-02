"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

/* ── Subscription Status Donut ── */
interface StatusData {
  name: string;
  value: number;
  color: string;
}

export function SubscriptionStatusChart({ data }: { data: StatusData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white border border-border p-4 sm:p-6">
      <h2 className="text-sm font-bold text-ink mb-4">Status Langganan</h2>
      {total === 0 ? (
        <p className="text-xs text-ink-muted text-center py-8">Belum ada data</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #d6d9dd" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ── Monthly Payments Bar Chart ── */
interface MonthlyPayment {
  month: string;
  total: number;
}

export function MonthlyPaymentsChart({ data }: { data: MonthlyPayment[] }) {
  return (
    <div className="bg-white border border-border p-4 sm:p-6">
      <h2 className="text-sm font-bold text-ink mb-4">
        Pembayaran 6 Bulan Terakhir
      </h2>
      {data.length === 0 ? (
        <p className="text-xs text-ink-muted text-center py-8">Belum ada data</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) =>
                v >= 1_000_000
                  ? `${(v / 1_000_000).toFixed(0)}jt`
                  : v >= 1_000
                    ? `${(v / 1_000).toFixed(0)}rb`
                    : String(v)
              }
            />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #d6d9dd" }}
              formatter={(value) => [
                `Rp ${Number(value).toLocaleString("id-ID")}`,
                "Total",
              ]}
            />
            <Bar dataKey="total" fill="#11499E" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ── Notifications Trend Area Chart ── */
interface NotifTrend {
  month: string;
  sent: number;
  failed: number;
}

export function NotificationTrendChart({ data }: { data: NotifTrend[] }) {
  return (
    <div className="bg-white border border-border p-4 sm:p-6">
      <h2 className="text-sm font-bold text-ink mb-4">
        Tren Notifikasi 6 Bulan
      </h2>
      {data.length === 0 ? (
        <p className="text-xs text-ink-muted text-center py-8">Belum ada data</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #d6d9dd" }}
            />
            <Area
              type="monotone"
              dataKey="sent"
              name="Terkirim"
              stroke="#1e7a4c"
              fill="#1e7a4c"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="failed"
              name="Gagal"
              stroke="#b3261e"
              fill="#b3261e"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ── Subscription Type Pie ── */
export function SubscriptionTypeChart({ data }: { data: StatusData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white border border-border p-4 sm:p-6">
      <h2 className="text-sm font-bold text-ink mb-4">Tipe Langganan</h2>
      {total === 0 ? (
        <p className="text-xs text-ink-muted text-center py-8">Belum ada data</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #d6d9dd" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
