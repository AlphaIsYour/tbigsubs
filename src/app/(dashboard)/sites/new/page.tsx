"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CustomerOption {
  id: string;
  name: string;
}

export default function NewSitePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [form, setForm] = useState({
    customerId: "",
    name: "",
    address: "",
    city: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/customers?pageSize=200")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomers(data.data.items);
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(JSON.stringify(data.error));
      return;
    }

    router.push("/sites");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-lg font-bold text-ink mb-4">Tambah Lokasi/Site</h1>

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

        <label className="block text-xs text-ink-muted mb-1">Nama Site</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
          required
        />

        <label className="block text-xs text-ink-muted mb-1">Alamat</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

        <label className="block text-xs text-ink-muted mb-1">Kota</label>
        <input
          type="text"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

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
