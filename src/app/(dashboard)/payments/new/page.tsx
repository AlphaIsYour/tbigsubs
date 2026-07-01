"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface InvoiceOption {
  id: string;
  invoiceNumber: string;
  amount: string;
  status: string;
  subscription: { customer: { name: string } };
}

export default function NewPaymentPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [form, setForm] = useState({
    invoiceId: "",
    amount: "",
    method: "",
    reference: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/invoices?status=open&pageSize=200")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        setInvoices(
          d.data.items.map((inv: InvoiceOption) => ({
            ...inv,
            subscription: {
              customer: {
                name:
                  inv.subscription.customer?.name ??
                  (
                    inv.subscription as InvoiceOption["subscription"] & {
                      site?: { customer?: { name?: string } };
                    }
                  ).site?.customer?.name ??
                  "-",
              },
            },
          })),
        );
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(JSON.stringify(data.error));
      return;
    }

    router.push("/payments");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-lg font-bold text-ink mb-4">Catat Pembayaran</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border p-6"
      >
        <label className="block text-xs text-ink-muted mb-1">Invoice</label>
        <select
          value={form.invoiceId}
          onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
          required
        >
          <option value="">-- Pilih Invoice --</option>
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.invoiceNumber} - {inv.subscription.customer.name} (Rp{" "}
              {Number(inv.amount).toLocaleString("id-ID")})
            </option>
          ))}
        </select>

        <label className="block text-xs text-ink-muted mb-1">
          Jumlah Bayar
        </label>
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
          required
          min="0"
          step="0.01"
        />

        <label className="block text-xs text-ink-muted mb-1">
          Metode Pembayaran
        </label>
        <input
          type="text"
          value={form.method}
          onChange={(e) => setForm({ ...form, method: e.target.value })}
          placeholder="Transfer Bank / Tunai / dll"
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

        <label className="block text-xs text-ink-muted mb-1">
          No. Referensi
        </label>
        <input
          type="text"
          value={form.reference}
          onChange={(e) => setForm({ ...form, reference: e.target.value })}
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
