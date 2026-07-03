"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClientBreadcrumb } from "@/components/ui/client-breadcrumb";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError("Data pelanggan tidak ditemukan");
          return;
        }

        setForm({
          name: data.data.name ?? "",
          email: data.data.email ?? "",
          phone: data.data.phone ?? "",
          address: data.data.address ?? "",
          picName: data.data.picName ?? "",
          isPermanent: data.data.isPermanent ?? false,
          notes: data.data.notes ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/customers/${id}`, {
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

    router.refresh();
    router.push("/customers");
  }

  async function executeDelete() {
    setShowDeleteConfirm(false);
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(JSON.stringify(data.error));
      return;
    }

    router.push("/customers");
  }

  if (loading) return <p className="text-sm text-ink-muted">Memuat...</p>;

  return (
    <div className="max-w-xl">
      <ClientBreadcrumb items={[{ label: "Pelanggan", href: "/customers" }, { label: "Detail" }]} />
      <h1 className="text-lg font-bold text-ink mb-4">Detail Pelanggan</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-border p-6">
        <label className="block text-xs text-ink-muted mb-1">Nama</label>
        <input
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
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

        <label className="block text-xs text-ink-muted mb-1">Alamat</label>
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

        <label className="block text-xs text-ink-muted mb-1">Nama PIC</label>
        <input
          value={form.picName}
          onChange={(e) => setForm({ ...form, picName: e.target.value })}
          className="w-full border border-border px-3 py-2 text-sm mb-3"
        />

        <label className="flex items-center text-xs text-ink-muted mb-3">
          <input
            type="checkbox"
            checked={form.isPermanent}
            onChange={(e) => setForm({ ...form, isPermanent: e.target.checked })}
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
        title="Hapus Pelanggan"
        message="Apakah Anda yakin ingin menghapus data pelanggan ini? Semua data terkait pelanggan ini akan terpengaruh."
        confirmText="HAPUS"
        isDanger
        onConfirm={executeDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
