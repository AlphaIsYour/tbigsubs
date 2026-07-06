"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientBreadcrumb } from "@/components/ui/client-breadcrumb";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password baru minimal harus 8 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Gagal mengubah password.");
        return;
      }

      setSuccess("Password Anda berhasil diperbarui!");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError("Terjadi kesalahan koneksi internet.");
    }
  }

  return (
    <div className="max-w-md">
      <ClientBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Ganti Password" },
        ]}
      />
      <h1 className="text-lg font-bold text-ink mb-4">Ganti Password</h1>

      <div className="bg-white border border-border p-6 shadow-sm">
        <p className="text-xs text-ink-muted mb-4">
          Silakan masukkan password saat ini dan password baru Anda di bawah ini untuk memperbarui kata sandi akun admin Anda.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Password Saat Ini
            </label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm({ ...form, currentPassword: e.target.value })
              }
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-dark"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Password Baru
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-dark"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-dark"
              required
            />
          </div>

          {error && (
            <div className="bg-status-overdue/10 border border-status-overdue text-status-overdue p-3 text-xs mb-4 font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-status-active/10 border border-status-active text-status-active p-3 text-xs mb-4 font-semibold">
              {success}
            </div>
          )}

          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 border border-border text-xs text-ink font-semibold hover:bg-surface-muted transition-colors cursor-pointer"
            >
              BATAL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-dark text-white text-xs font-semibold hover:bg-primary transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "MEMPROSES..." : "GANTI PASSWORD"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
