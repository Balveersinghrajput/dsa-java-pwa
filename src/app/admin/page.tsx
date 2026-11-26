"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Ban, Check, Copy, Eye, Link2, Loader2, Trash2, UserCheck, Users } from "lucide-react";
import { apiJson } from "@/lib/api";
import { hm } from "@/lib/derive";
import { Badge, Bar, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { Alert, field } from "@/components/auth/ui";

interface Friend {
  id: string;
  name: string;
  email: string;
  created: number;
  disabled: boolean;
  devices: number;
  lastSeen: number | null;
  daysDone: number;
  totalDays: number;
  solved: number;
  minutes: number;
  lastCompleted: string | null;
}
interface InviteRow {
  id: string;
  note: string;
  created: number;
  expires: number;
  usedAt: number | null;
  usedByName: string | null;
  status: "open" | "used" | "expired";
}

const ago = (t: number | null) => {
  if (!t) return "never";
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 2) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
};
const date = (t: number) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** Admin: invite friends, see how they're doing, turn access off or delete accounts. */
export default function AdminPage() {
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [invites, setInvites] = useState<InviteRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    apiJson<{ users: Friend[] }>("/api/admin/users").then((r) => setFriends(r.users)).catch((e) => setError((e as Error).message));
    apiJson<{ invites: InviteRow[] }>("/api/admin/invites").then((r) => setInvites(r.invites)).catch((e) => setError((e as Error).message));
  }, []);
  useEffect(load, [load]);

  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Friends" subtitle="Invite friends to start their own journey. Their data is separate from yours: you can view it, they can't see each other's or yours." />
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}

      <NewInvite onCreated={load} />

      <Card i={1} className="mt-5 min-w-0 p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-[16px] font-bold"><Users className="h-5 w-5 text-primary" /> Friends {friends && <span className="text-muted">({friends.length})</span>}</h2>
        {!friends ? (
          <div className="skeleton mt-4 h-24" />
        ) : friends.length === 0 ? (
          <div className="mt-4"><EmptyState icon={<Users className="h-6 w-6" />} title="No friends yet" text="Create an invite link above and send it to a friend. They'll appear here once they sign up." /></div>
        ) : (
          <ul className="mt-4 space-y-3">
            {friends.map((f) => {
              const pct = (f.daysDone / f.totalDays) * 100;
              return (
                <li key={f.id} className={`rounded-2xl bg-surface-2 p-4 ring-1 ring-line ${f.disabled ? "opacity-60" : ""}`}>
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-primary-soft text-[16px] font-bold text-primary">{f.name.slice(0, 1).toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold">
                        {f.name} {f.disabled && <Badge tone="rose">Disabled</Badge>}
                      </p>
                      <p className="truncate text-[12.5px] text-muted">{f.email} · joined {date(f.created)} · active {ago(f.lastSeen)}</p>
                    </div>
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                      <Button size="sm" href={`/admin/users/${f.id}`}><Eye className="h-4 w-4" /> View</Button>
                      <Button size="sm" variant="outline" onClick={() => act(() => apiJson("/api/admin/users", { id: f.id, disabled: !f.disabled }, "PATCH"))}>
                        {f.disabled ? <><UserCheck className="h-4 w-4" /> Enable</> : <><Ban className="h-4 w-4" /> Disable</>}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose"
                        onClick={() => confirm(`Delete ${f.name}'s account and ALL their progress? This can't be undone.`) && act(() => apiJson("/api/admin/users", { id: f.id }, "DELETE"))}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[12.5px] sm:grid-cols-4">
                    <Stat label="Days done" value={`${f.daysDone} / ${f.totalDays}`} />
                    <Stat label="Problems solved" value={String(f.solved)} />
                    <Stat label="Study time" value={hm(f.minutes)} />
                    <Stat label="Last lesson" value={f.lastCompleted ?? "—"} />
                  </div>
                  <Bar pct={pct} className="mt-3" />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card i={2} className="mt-5 min-w-0 p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-[16px] font-bold"><Link2 className="h-5 w-5 text-primary" /> Invite links</h2>
        <p className="mt-1 text-[12.5px] text-muted">Each link works once. For security the link is only shown when it&apos;s created; make a new one if you lose it.</p>
        <ul className="mt-4 space-y-2">
          {!invites && <li className="skeleton h-12" />}
          {invites?.length === 0 && <li className="text-[13px] text-muted">No invites yet.</li>}
          {invites?.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 p-3 ring-1 ring-line">
              <Badge tone={i.status === "open" ? "green" : i.status === "used" ? "primary" : "muted"}>{i.status}</Badge>
              <span className="min-w-0 flex-1 text-[13px]">
                <b>{i.note || "Invite"}</b>
                <span className="block text-[12px] text-muted">
                  {i.status === "used" ? `Used by ${i.usedByName} · ${date(i.usedAt!)}` : i.status === "open" ? `Expires ${date(i.expires)}` : `Expired ${date(i.expires)}`}
                </span>
              </span>
              {i.status === "open" && <Button size="sm" variant="ghost" className="text-rose" onClick={() => act(() => apiJson("/api/admin/invites", { id: i.id }, "DELETE"))}>Revoke</Button>}
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-5 text-center text-[12px] text-muted">
        Friends sign in at the same address. Passwords are stored only as hashes, so nobody (including you) can see them. <Link href="/profile" className="font-semibold text-primary">Your profile</Link>
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2 ring-1 ring-line">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function NewInvite({ onCreated }: { onCreated: () => void }) {
  const [note, setNote] = useState("");
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const r = await apiJson<{ link: string }>("/api/admin/invites", { note, days });
      setLink(r.link);
      setNote("");
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
  };
  const share = () => link && navigator.share?.({ title: "Join me on DSA in Java", text: "Start your DSA journey with this invite link:", url: link }).catch(() => {});

  return (
    <Card i={0} className="min-w-0 p-4 sm:p-6">
      <h2 className="text-[16px] font-bold">Invite a friend</h2>
      <form onSubmit={create} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-end">
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Who is it for? (optional)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} placeholder="e.g. Balveer from college" className={field} />
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Valid for</span>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={field}>
            {[1, 3, 7, 14, 30].map((d) => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}
          </select>
        </label>
        <Button type="submit" disabled={busy} className="h-11">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />} Create link</Button>
      </form>
      {error && <div className="mt-3"><Alert tone="error">{error}</Alert></div>}
      {link && (
        <div className="mt-4 rounded-xl bg-green-soft p-3">
          <p className="text-[13px] font-semibold text-green">Invite link ready: send it to your friend (works once).</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={link} onFocus={(e) => e.target.select()} className={`${field} mt-0 font-mono text-[12.5px]`} />
            <div className="flex gap-2">
              <Button type="button" onClick={copy} className="h-11 flex-1 sm:flex-none">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}</Button>
              {typeof navigator !== "undefined" && "share" in navigator && <Button type="button" variant="outline" onClick={share} className="h-11 flex-1 sm:flex-none">Share</Button>}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
