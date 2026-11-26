"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookOpenText, CalendarDays, CheckCircle2, Clock, Flame, KeyRound, Laptop, Loader2, LogOut, Mail, Pencil, Settings, ShieldCheck, Smartphone, Trophy } from "lucide-react";
import { plan, totalProblems } from "@/data/curriculum";
import { hm, useDerived } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import { parseISODate } from "@/lib/schedule";
import { useAccount, signOut } from "@/hooks/useAccount";
import { Button, Card, Ring, cardCls, st } from "@/components/ui";
import { Alert, PasswordInput, PasswordRules } from "@/components/auth/ui";
import { apiJson } from "@/lib/api";
import { InitialAvatar } from "@/components/shell/bits";

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function ProfilePage() {
  const { state, update } = useAppState();
  const d = useDerived();
  const account = useAccount();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(state.name);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [next2, setNext2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [leaving, setLeaving] = useState(false);

  const saveName = () => {
    update((s) => ({ ...s, name: name.trim() || "Learner" }));
    setEditing(false);
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== next2) return setPwMsg({ tone: "error", text: "The new passwords don't match." });
    setPwBusy(true);
    setPwMsg(null);
    try {
      await apiJson("/api/auth/password", { current: cur, next });
      setCur("");
      setNext("");
      setNext2("");
      setPwMsg({ tone: "ok", text: "Password changed. Other devices were signed out." });
    } catch (err) {
      setPwMsg({ tone: "error", text: (err as Error).message });
    } finally {
      setPwBusy(false);
    }
  };

  const stats = [
    { icon: <BookOpenText className="h-4 w-4" />, label: "Lessons done", value: `${state.doneDays.length} / ${plan.length}` },
    { icon: <CheckCircle2 className="h-4 w-4" />, label: "Problems solved", value: `${state.solved.length} / ${totalProblems}` },
    { icon: <Clock className="h-4 w-4" />, label: "Study time", value: hm(d.totalStudied) },
    { icon: <Flame className="h-4 w-4" />, label: "Current streak", value: `${d.streak} days` },
    { icon: <CalendarDays className="h-4 w-4" />, label: "Started", value: fmt(parseISODate(d.startDate)) },
    { icon: <Trophy className="h-4 w-4" />, label: d.targetFinish ? "Target finish" : "Expected finish", value: fmt(d.targetFinish ?? d.expectedFinish) },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* header */}
      <section className="rise relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1437] via-[#1f2470] to-[#4f46e5] px-5 py-6 text-white sm:p-8" style={st(0)}>
        <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <Ring pct={d.pct} size={104} stroke={6} track="rgb(255 255 255 / .15)" color="#a5b4fc">
            <InitialAvatar name={state.name} size={82} />
          </Ring>
          <div className="min-w-0 flex-1">
            {editing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveName();
                }}
                className="flex flex-wrap items-center justify-center gap-2 sm:justify-start"
              >
                <input autoFocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)} aria-label="Your name" className="h-11 min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3.5 text-[16px] font-semibold text-white outline-none placeholder:text-white/50 focus:border-white/50 sm:max-w-xs" />
                <button className="press h-11 rounded-xl bg-white px-4 text-[13.5px] font-semibold text-[#1e1b4b]">Save</button>
                <button type="button" onClick={() => { setName(state.name); setEditing(false); }} className="press h-11 rounded-xl px-3 text-[13.5px] font-semibold text-white/80 hover:bg-white/10">Cancel</button>
              </form>
            ) : (
              <h1 className="flex items-center justify-center gap-2 text-[24px] font-extrabold tracking-tight sm:justify-start sm:text-[28px]">
                <span className="truncate">{state.name}</span>
                <button onClick={() => setEditing(true)} aria-label="Edit name" className="press grid h-8 w-8 flex-none place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"><Pencil className="h-4 w-4" /></button>
              </h1>
            )}
            <p className="mt-1 flex items-center justify-center gap-1.5 text-[13.5px] text-white/75 sm:justify-start sm:text-[14px]">
              <Mail className="h-4 w-4 flex-none" /> <span className="min-w-0 break-all">{account?.email ?? "Loading…"}</span>
            </p>
            <p className="mt-3 text-[13px] text-white/70">Day {d.focus} of {plan.length} · {d.pct.toFixed(1)}% complete</p>
          </div>
        </div>
      </section>

      {/* stats */}
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
        {stats.map((x, k) => (
          <div key={x.label} className={`rise min-w-0 p-3.5 sm:p-4 ${cardCls}`} style={st(k + 1)}>
            <p className="flex items-center gap-2 text-[11.5px] leading-tight font-semibold text-muted sm:text-[12px]"><span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-primary-soft text-primary">{x.icon}</span><span className="min-w-0">{x.label}</span></p>
            <p className="mt-2 truncate text-[16px] font-bold tracking-tight sm:text-[19px]">{x.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* account */}
        <Card i={8} className="min-w-0 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-bold"><ShieldCheck className="h-5 w-5 text-primary" /> Account</h2>
          <dl className="mt-4 space-y-3 text-[14px]">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3.5 py-3 ring-1 ring-line">
              <dt className="flex-none text-muted">Email</dt>
              <dd className="min-w-0 text-right font-semibold break-all">{account?.email ?? "…"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3.5 py-3 ring-1 ring-line">
              <dt className="text-muted">Password</dt>
              <dd className="font-semibold tracking-widest">••••••••</dd>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3.5 py-3 ring-1 ring-line">
              <dt className="text-muted">Signed in until</dt>
              <dd className="font-semibold">{account?.sessionExpires ? new Date(account.sessionExpires).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "…"}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12px] text-muted">Your password is stored only as a secure hash, so it can&apos;t be shown — you can change it here.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button variant="outline" href="/settings"><Settings className="h-4 w-4" /> Study settings</Button>
            <Button
              variant="danger"
              disabled={leaving}
              onClick={() => {
                setLeaving(true);
                signOut();
              }}
            >
              {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} Sign out
            </Button>
          </div>
        </Card>

        {/* password */}
        <Card i={9} className="min-w-0 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-bold"><KeyRound className="h-5 w-5 text-primary" /> Change password</h2>
          <form onSubmit={changePw} className="mt-4 space-y-4">
            {pwMsg && <Alert tone={pwMsg.tone}>{pwMsg.text}</Alert>}
            <PasswordInput id="cur" label="Current password" value={cur} onChange={setCur} autoComplete="current-password" />
            <div>
              <PasswordInput id="next" label="New password" value={next} onChange={setNext} autoComplete="new-password" />
              <PasswordRules pw={next} />
            </div>
            <PasswordInput id="next2" label="Confirm new password" value={next2} onChange={setNext2} autoComplete="new-password" />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/forgot" className="text-[13px] font-semibold text-primary hover:underline">Forgot current password?</Link>
              <Button type="submit" className="w-full sm:w-auto" disabled={pwBusy}>{pwBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Update password</Button>
            </div>
          </form>
        </Card>
      </div>

      <Sessions />
    </div>
  );
}

interface DeviceSession {
  id: string;
  ua: string;
  ip: string;
  created: number;
  lastUsed: number;
  expires: number;
  current: boolean;
}

function describe(ua: string) {
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  return { label: `${browser} on ${os}`, mobile: /Android|iPhone|iPad|Mobile/.test(ua) };
}

/** Signed-in devices: each has its own rotating refresh token and can be revoked. */
function Sessions() {
  const [list, setList] = useState<DeviceSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    apiJson<{ sessions: DeviceSession[] }>("/api/auth/sessions")
      .then((r) => setList(r.sessions))
      .catch((e) => setError((e as Error).message));
  }, []);
  useEffect(load, [load]);

  const revoke = async (body: { id?: string; others?: boolean }) => {
    try {
      await apiJson("/api/auth/sessions", body, "DELETE");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const others = list?.filter((s) => !s.current).length ?? 0;

  return (
    <Card i={10} className="mt-5 min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[16px] font-bold"><Laptop className="h-5 w-5 text-primary" /> Signed-in devices</h2>
        {others > 0 && <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => revoke({ others: true })}>Sign out {others} other device{others > 1 ? "s" : ""}</Button>}
      </div>
      <p className="mt-1 text-[12.5px] text-muted">Each device keeps a 15-minute access token that renews automatically. Removing a device signs it out right away.</p>
      {error && <div className="mt-3"><Alert tone="error">{error}</Alert></div>}
      <ul className="mt-4 space-y-2">
        {!list && <li className="skeleton h-14" />}
        {list?.map((s) => {
          const dsc = describe(s.ua);
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 p-3 ring-1 ring-line">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary-soft text-primary">{dsc.mobile ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] font-semibold">
                  <span>{dsc.label}</span>
                  {s.current && <span className="rounded-md bg-green-soft px-1.5 py-0.5 text-[10.5px] font-bold text-green">This device</span>}
                </span>
                <span className="block text-[12px] leading-snug text-muted">Active {new Date(s.lastUsed).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · signed in {fmt(new Date(s.created))}</span>
              </span>
              {!s.current && <Button variant="ghost" size="sm" className="text-rose" onClick={() => revoke({ id: s.id })}>Sign out</Button>}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

