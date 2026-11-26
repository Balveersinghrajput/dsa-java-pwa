"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Eye, Loader2, UserPlus } from "lucide-react";
import { Alert, AuthCard, PasswordInput, PasswordRules, field, post } from "@/components/auth/ui";

function Signup() {
  const code = useSearchParams().get("code") ?? "";
  const [valid, setValid] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return setValid(false);
    fetch(`/api/auth/signup?code=${encodeURIComponent(code)}`)
      .then(async (r) => {
        setValid(r.ok);
        if (!r.ok) setError(((await r.json().catch(() => ({}))) as { error?: string }).error ?? "This invite link isn't valid.");
      })
      .catch(() => setValid(false));
  }, [code]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) return setError("The passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      await post("/api/auth/signup", { code, name, email, password });
      window.location.replace("/"); // full load so the app opens with the new account
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  if (valid === false) {
    return (
      <AuthCard title="Invite needed" subtitle="Accounts are created with an invite link from the admin.">
        <div className="space-y-4">
          <Alert tone="error">{error ?? "This page needs an invite link. Ask the admin to send you one."}</Alert>
          <Link href="/login" className="press flex h-12 w-full items-center justify-center rounded-xl border border-line text-[14px] font-semibold hover:bg-surface-2">Already have an account? Sign in</Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Start your DSA journey 🚀" subtitle="You've been invited. Create your own account: your progress is separate from everyone else's.">
      {valid === null ? (
        <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <label className="block">
            <span className="text-[13px] font-semibold text-ink-2">Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoFocus required maxLength={40} placeholder="e.g. Rahul" className={field} />
          </label>
          <label className="block">
            <span className="text-[13px] font-semibold text-ink-2">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required placeholder="you@example.com" className={field} />
          </label>
          <div>
            <PasswordInput id="pw" label="Password" value={password} onChange={setPassword} autoComplete="new-password" />
            <PasswordRules pw={password} />
          </div>
          <PasswordInput id="pw2" label="Confirm password" value={password2} onChange={setPassword2} autoComplete="new-password" />
          <p className="flex gap-2 rounded-xl bg-primary-faint p-3 text-[12.5px] leading-snug text-ink-2">
            <Eye className="mt-0.5 h-4 w-4 flex-none text-primary" />
            <span>Other learners can&apos;t see your data. The admin who invited you can <b>view</b> your progress and notes (never your password) to help you stay on track.</span>
          </p>
          <button disabled={busy} className="press flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14.5px] font-semibold text-white shadow-[0_10px_24px_-10px_rgb(79_70_229/0.8)] hover:bg-primary-strong disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Create account
          </button>
          <p className="text-center text-[13px] text-muted">
            Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <Signup />
    </Suspense>
  );
}
