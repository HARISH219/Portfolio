"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(next);
        router.refresh();
      } else {
        setError(data.error || "Login failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08070c] px-4 text-[#ece9f1]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-[#ec4899]/[0.1] blur-[130px]" />
        <div className="absolute bottom-0 right-1/3 h-96 w-96 rounded-full bg-[#a855f7]/[0.08] blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#ec4899] to-[#a855f7] text-lg font-bold text-white shadow-lg shadow-[#ec4899]/25">
            HB
          </span>
          <h1 className="mt-4 text-lg font-semibold text-white">Portfolio Administration</h1>
          <p className="mt-1 text-xs text-[#8b8797]">Private control center — authorized access only</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl">
          {error && (
            <div className="mb-4 rounded-lg border border-[#fb7185]/25 bg-[#fb7185]/10 px-3 py-2 text-xs text-[#fb7185]">
              {error}
            </div>
          )}

          <label className="mb-1.5 block text-[11px] font-medium text-[#a5a1b3]">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="mb-4 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#5a5766] focus:border-[#ec4899]/50"
            placeholder="Enter username"
          />

          <label className="mb-1.5 block text-[11px] font-medium text-[#a5a1b3]">Password</label>
          <div className="relative mb-5">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-[#5a5766] focus:border-[#ec4899]/50"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#8b8797] hover:text-white"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 8 10 8a9.7 9.7 0 0 0 5.39-1.61" /><path d="m2 2 20 20" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-r from-[#ec4899] to-[#a855f7] py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ec4899]/20 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] text-[#5a5766]">
          Protected area. All access attempts are logged.
        </p>
      </div>
    </div>
  );
}
