"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { Alert, AuthCard, PasswordInput, PasswordRules, post } from "@/components/auth/ui";

function Reset() {
  const token = useSearchParams().get("token") ?? "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) return setError("The two passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      await post("/api/auth/reset", { token, password: pw });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!token)
    return (
      <AuthCard title="Reset password">
        <Alert tone="error">This link is missing its token. Request a new reset email.</Alert>
        <p className="mt-4 text-[13px]"><Link href="/forgot" className="font-semibold text-primary">Request a new link</Link></p>
      </AuthCard>
    );
  if (done)
    return (
      <AuthCard title="Password updated">
        <Alert tone="ok">Your new password is saved. All other devices were signed out.</Alert>
        <Link href="/login" className="press mt-5 flex h-12 items-center justify-center rounded-xl bg-primary font-semibold text-white">Sign in</Link>
      </AuthCard>
    );

  return (
    <AuthCard title="Choose a new password" subtitle="The link works once and expires 15 minutes after it was sent.">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <div>
          <PasswordInput id="new" label="New password" value={pw} onChange={setPw} autoComplete="new-password" />
          <PasswordRules pw={pw} />
        </div>
        <PasswordInput id="confirm" label="Confirm new password" value={pw2} onChange={setPw2} autoComplete="new-password" />
        <button disabled={busy} className="press flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14.5px] font-semibold text-white hover:bg-primary-strong disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Update password
        </button>
      </form>
    </AuthCard>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <Reset />
    </Suspense>
  );
}
