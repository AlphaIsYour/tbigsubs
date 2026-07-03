"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClientBreadcrumb } from "@/components/ui/client-breadcrumb";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function ContractorDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    picName: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetch(`/api/contractors/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError("Data kontraktor tidak ditemukan");
          return;
        }

        setForm({
          name: data.data.name ?? "",
          email: data.data.email ?? "",
          phone: data.data.phone ?? "",
          picName: data.data.picName ?? "",
          notes: data.data.notes ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/contractors/${id}`, {
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

    router.push("/contractors");
  }

  async function executeDelete() {
    setShowDeleteConfirm(false);
    const res = await fetch(`/api/contractors/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(JSON.stringify(data.error));
      return;
    }

    router.push("/contractors");
  }

  if (loading) return <p className="text-sm text-ink-muted">Memuat...</p>;

  return (
    <div className="max-w-xl">
      <ClientBreadcrumb items={[{ label: "Kontraktor", href: "/contractors" }, { label: "Detail" }]} />
      <h1 className="text-lg font-bold text-ink mb-4">Detail Kontraktor</h1>

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

        <label className="block text-xs text-ink-muted mb-1">Nama PIC</label>
        <input
          value={form.picName}
          onChange={(e) => setForm({ ...form, picName: e.target.value })}
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
        title="Hapus Kontraktor"
        message="Apakah Anda yakin ingin menghapus data kontraktor ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="HAPUS"
        isDanger
        onConfirm={executeDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
