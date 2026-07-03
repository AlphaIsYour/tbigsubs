"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClientBreadcrumb } from "@/components/ui/client-breadcrumb";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface CustomerOption {
  id: string;
  name: string;
}

export default function SiteDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [form, setForm] = useState({
    customerId: "",
    name: "",
    address: "",
    city: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/customers?pageSize=200").then((res) => res.json()),
      fetch(`/api/sites/${id}`).then((res) => res.json()),
    ])
      .then(([customersData, siteData]) => {
        if (customersData.success) setCustomers(customersData.data.items);

        if (!siteData.success) {
          setError("Data site tidak ditemukan");
          return;
        }

        setForm({
          customerId: siteData.data.customerId ?? "",
          name: siteData.data.name ?? "",
          address: siteData.data.address ?? "",
          city: siteData.data.city ?? "",
          notes: siteData.data.notes ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/sites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(JSON.stringify(data.error));
      return;
    }

    router.push("/sites");
  }

  async function executeDelete() {
    setShowDeleteConfirm(false);
    const res = await fetch(`/api/sites/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(JSON.stringify(data.error));
      return;
    }

    router.push("/sites");
  }

  if (loading) return <p className="text-sm text-ink-muted">Memuat...</p>;

  return (
    <div className="max-w-xl">
      <ClientBreadcrumb items={[{ label: "Lokasi/Site", href: "/sites" }, { label: "Detail" }]} />
      <h1 className="text-lg font-bold text-ink mb-4">Detail Lokasi/Site</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-border p-6">
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
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
          required
        />

        <label className="block text-xs text-ink-muted mb-1">Alamat</label>
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

        <label className="block text-xs text-ink-muted mb-1">Kota</label>
        <input
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

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-dark text-white px-4 py-2 text-sm font-semibold"
          >
            {saving ? "MENYIMPAN..." : "SIMPAN"}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="border border-status-overdue text-status-overdue px-4 py-2 text-sm font-semibold"
          >
            HAPUS
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Hapus Lokasi/Site"
        message="Apakah Anda yakin ingin menghapus data lokasi/site ini? Data langganan yang dikaitkan dengan site ini mungkin terpengaruh."
        confirmText="HAPUS"
        isDanger
        onConfirm={executeDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
