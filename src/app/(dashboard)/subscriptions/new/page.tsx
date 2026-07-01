"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  name: string;
}

interface PlanOption {
  id: string;
  name: string;
  type: "PERMANENT" | "MONTHLY";
}

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Option[]>([]);
  const [sites, setSites] = useState<Option[]>([]);
  const [contractors, setContractors] = useState<Option[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [form, setForm] = useState({
    customerId: "",
    siteId: "",
    contractorId: "",
    planId: "",
    type: "MONTHLY" as "PERMANENT" | "MONTHLY",
    startDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    autoRenew: false,
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/customers?pageSize=200")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCustomers(d.data.items);
      });
    fetch("/api/sites?pageSize=200")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSites(d.data.items);
      });
    fetch("/api/contractors?pageSize=200")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setContractors(d.data.items);
      });
    fetch("/api/subscription-plans")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPlans(d.data);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      siteId: form.siteId || undefined,
      contractorId: form.contractorId || undefined,
      dueDate: form.dueDate || undefined,
    };

    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(JSON.stringify(data.error));
      return;
    }

    router.push("/subscriptions");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-lg font-bold text-ink mb-4">Tambah Langganan</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border p-6"
      >
        <label className="block text-xs text-ink-muted mb-1">Pelanggan</label>
        <select
          value={form.customerId}
          onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
          required
        >
          <option value="">-- Pilih Pelanggan --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="block text-xs text-ink-muted mb-1">Site</label>
        <select
          value={form.siteId}
          onChange={(e) => setForm({ ...form, siteId: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
          required
        >
          <option value="">-- Pilih Site --</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <label className="block text-xs text-ink-muted mb-1">
          Kontraktor (Opsional)
        </label>
        <select
          value={form.contractorId}
          onChange={(e) => setForm({ ...form, contractorId: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        >
          <option value="">-- Tidak Ada --</option>
          {contractors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="block text-xs text-ink-muted mb-1">
          Paket Langganan
        </label>
        <select
          value={form.planId}
          onChange={(e) => {
            const plan = plans.find((p) => p.id === e.target.value);
            setForm({
              ...form,
              planId: e.target.value,
              type: plan ? plan.type : form.type,
            });
          }}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
          required
        >
          <option value="">-- Pilih Paket --</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.type === "PERMANENT" ? "Permanen" : "Bulanan"})
            </option>
          ))}
        </select>

        <label className="block text-xs text-ink-muted mb-1">
          Tanggal Mulai
        </label>
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
          required
        />

        {form.type === "MONTHLY" && (
          <>
            <label className="block text-xs text-ink-muted mb-1">
              Tanggal Jatuh Tempo (kosongkan untuk otomatis 30 hari)
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm mb-3"
            />
          </>
        )}

        <label className="flex items-center text-xs text-ink-muted mb-3">
          <input
            type="checkbox"
            checked={form.autoRenew}
            onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })}
            className="mr-2"
          />
          Perpanjangan Otomatis
        </label>

        <label className="block text-xs text-ink-muted mb-1">Catatan</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
          rows={3}
        />

        {error && <p className="text-status-overdue text-xs mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary-dark text-white px-4 py-2 text-sm font-semibold"
        >
          {loading ? "MENYIMPAN..." : "SIMPAN"}
        </button>
      </form>
    </div>
  );
}
