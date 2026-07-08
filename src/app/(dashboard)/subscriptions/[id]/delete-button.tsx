"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export function DeleteSubscriptionButton({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "DELETE",
      });
      setLoading(false);

      if (res.ok) {
        setShowConfirm(false);
        router.push("/subscriptions");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menghapus langganan.");
      }
    } catch (err) {
      setLoading(false);
      setError("Kesalahan koneksi internet.");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="border border-status-overdue text-status-overdue hover:bg-status-overdue/5 text-xs px-4 py-2 font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          {loading ? "MENGHAPUS..." : "HAPUS LANGGANAN"}
        </button>

        {error && (
          <span className="text-[11px] font-semibold text-status-overdue">
            ❌ {error}
          </span>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Hapus Data Langganan"
        message="Apakah Anda yakin ingin menghapus data langganan PLN Multiguna ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="HAPUS"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
