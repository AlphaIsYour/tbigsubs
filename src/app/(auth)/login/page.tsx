"use client";

import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("@/components/auth/login-form"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted">
      <div className="bg-white border border-border p-8 w-80">
        <p className="text-sm text-ink-muted">Memuat...</p>
      </div>
    </div>
  ),
});

export default function LoginPage() {
  return <LoginForm />;
}
