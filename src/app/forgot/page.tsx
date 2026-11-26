"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Alert, AuthCard, field, post } from "@/components/auth/ui";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await post("/api/auth/forgot", { email });
      setMsg({ tone: "ok", text: r.message });
    } catch (err) {
      setMsg({ tone: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Forgot password" subtitle="Enter your email and we'll send a one-time reset link.">
      <form onSubmit={submit} className="space-y-4">
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required className={field} />
        </label>
        <button disabled={busy} className="press flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14.5px] font-semibold text-white hover:bg-primary-strong disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send reset link
        </button>
        <p className="text-center text-[13px]"><Link href="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link></p>
      </form>
    </AuthCard>
  );
}
