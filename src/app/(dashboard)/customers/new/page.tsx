"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    picName: "",
    isPermanent: false,
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/customers", {
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

    router.push("/customers");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-lg font-bold text-ink mb-4">Tambah Pelanggan</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border p-6"
      >
        <label className="block text-xs text-ink-muted mb-1">Nama</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
          required
        />

        <label className="block text-xs text-ink-muted mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

        <label className="block text-xs text-ink-muted mb-1">Telepon</label>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

        <label className="block text-xs text-ink-muted mb-1">Alamat</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

        <label className="block text-xs text-ink-muted mb-1">Nama PIC</label>
        <input
          type="text"
          value={form.picName}
          onChange={(e) => setForm({ ...form, picName: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

        <label className="flex items-center text-xs text-ink-muted mb-3">
          <input
            type="checkbox"
            checked={form.isPermanent}
            onChange={(e) =>
              setForm({ ...form, isPermanent: e.target.checked })
            }
            className="mr-2"
          />
          Pelanggan Permanen
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
