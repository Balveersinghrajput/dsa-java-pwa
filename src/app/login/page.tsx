"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { Alert, AuthCard, PasswordInput, field, post } from "@/components/auth/ui";

function Login() {
  const nextParam = useSearchParams().get("next") ?? "";
  // Only same-site paths (no open redirects).
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") && !nextParam.startsWith("/api/") ? nextParam : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await post("/api/auth/login", { email, password, remember });
      window.location.replace(next); // full load so every page sees the new session
    } catch (err) {
      setError((err as Error).message);
      setPassword("");
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Welcome back 👋" subtitle="Sign in to continue your DSA journey.">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus required placeholder="you@example.com" className={field} />
        </label>
        <PasswordInput id="pw" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-[13px] text-ink-2">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
            Keep me signed in
          </label>
          <Link href="/forgot" className="text-[13px] font-semibold text-primary hover:underline">Forgot password?</Link>
        </div>
        <button disabled={busy} className="press flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14.5px] font-semibold text-white shadow-[0_10px_24px_-10px_rgb(79_70_229/0.8)] hover:bg-primary-strong disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Sign in
        </button>
        <p className="text-center text-[12px] text-muted">After 5 failed attempts, sign-in pauses for 15 minutes.</p>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
