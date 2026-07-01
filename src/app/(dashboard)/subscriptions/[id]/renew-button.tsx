"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RenewButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRenew() {
    setLoading(true);
    const res = await fetch(`/api/subscriptions/${subscriptionId}/renew`, {
      method: "POST",
    });
    setLoading(false);

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleRenew}
      disabled={loading}
      className="bg-primary-dark text-white text-sm px-4 py-2 font-semibold"
    >
      {loading ? "MEMPROSES..." : "PERPANJANG 30 HARI"}
    </button>
  );
}
