"use client";

import { useState, type ReactNode } from "react";
import { Code, Eye, EyeOff } from "lucide-react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-navy px-4 py-10">
      {/* soft background glow */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-[#8b5cf6]/25 blur-3xl" />
      <div className="relative w-full max-w-[420px]">
        <div className="mb-6 flex items-center justify-center gap-3 text-white">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#4338ca] shadow-[0_8px_24px_-6px_rgb(99_102_241/0.8)]">
            <Code className="h-6 w-6" strokeWidth={2.4} />
          </span>
          <span>
            <span className="block text-[20px] leading-tight font-bold tracking-tight">DSA in Java</span>
            <span className="block text-[12.5px] text-white/65">From Beginner to Advanced</span>
          </span>
        </div>
        <div className="scale-in rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl sm:p-8">
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-[13.5px] text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-5 text-center text-[12px] text-white/50">Your progress stays private on this device.</p>
      </div>
    </div>
  );
}

export const field = "mt-1.5 h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[14px] outline-none transition-colors focus:border-primary focus:bg-surface";

export function PasswordInput({ value, onChange, label, autoComplete, id }: { value: string; onChange: (v: string) => void; label: string; autoComplete: string; id: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block" htmlFor={id}>
      <span className="text-[13px] font-semibold text-ink-2">{label}</span>
      <span className="relative block">
        <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required className={`${field} pr-11`} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute top-1/2 right-2 mt-0.75 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-ink">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}

export function Alert({ tone, children }: { tone: "error" | "ok"; children: ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`fade rounded-xl border px-3.5 py-2.5 text-[13px] ${tone === "error" ? "border-rose/25 bg-rose-soft text-rose" : "border-green/25 bg-green-soft text-green"}`}>
      {children}
    </p>
  );
}

/** Live checklist for the password policy enforced by the server. */
export function PasswordRules({ pw }: { pw: string }) {
  const rules = [
    { ok: pw.length >= 8, t: "8+ characters" },
    { ok: /[A-Z]/.test(pw) && /[a-z]/.test(pw), t: "Upper & lower case" },
    { ok: /\d/.test(pw), t: "A number" },
    { ok: /[^A-Za-z0-9]/.test(pw), t: "A symbol" },
  ];
  return (
    <ul className="mt-2 grid grid-cols-2 gap-1 text-[12px]">
      {rules.map((r) => (
        <li key={r.t} className={r.ok ? "text-green" : "text-muted"}>{r.ok ? "✓" : "○"} {r.t}</li>
      ))}
    </ul>
  );
}

export async function post(url: string, data: unknown, method = "POST") {
  const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json;
}
