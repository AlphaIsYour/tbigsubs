"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <div className="bg-white border border-border p-8 w-full max-w-80">
        <div className="flex flex-col items-center mb-6 text-center">
          <Image src="/tbigsubs.png" alt="SPARK Logo" width={48} height={48} className="object-contain mb-2" />
          <h1 className="text-lg font-bold text-ink">SPARK</h1>
          <p className="text-[11px] text-ink-muted mt-1">Monitoring Temporary Power</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-xs text-ink-muted mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border px-3 py-2 text-sm mb-3"
            required
          />

          <label className="block text-xs text-ink-muted mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border px-3 py-2 text-sm mb-3"
            required
          />

          {error && <p className="text-status-overdue text-xs mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-dark text-white py-2 text-sm font-semibold"
          >
            {loading ? "MEMPROSES..." : "MASUK"}
          </button>
        </form>
      </div>
    </div>
  );
}
