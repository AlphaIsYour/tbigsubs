"use client";

import { useState } from "react";

export function RemindButton({ subscriptionId }: { subscriptionId: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/remind`, {
        method: "POST",
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Gagal mengirim pengingat.");
      }
    } catch (err) {
      setLoading(false);
      setStatus("error");
      setErrorMsg("Koneksi gagal.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-primary text-white text-xs px-4 py-2 font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {loading ? "MENGIRIM..." : "KIRIM PENGINGAT MANUAL"}
        </button>
      </div>

      {status === "success" && (
        <span className="text-[11px] font-semibold text-status-active">
          ✔ Email pengingat berhasil dikirim ke pelanggan!
        </span>
      )}
      {status === "error" && (
        <span className="text-[11px] font-semibold text-status-overdue">
          ❌ {errorMsg}
        </span>
      )}
    </div>
  );
}
