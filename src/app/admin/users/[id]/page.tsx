"use client";

import { use, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpenText, CheckCircle2, Clock, Eye, NotebookPen, Trophy } from "lucide-react";
import { apiJson } from "@/lib/api";
import { hm } from "@/lib/derive";
import { phases, plan } from "@/data/curriculum";
import { Badge, Bar, Button, Card, PageHeader } from "@/components/ui";
import { Alert } from "@/components/auth/ui";
import type { AppState } from "@/types";

interface Data {
  user: { id: string; name: string; email: string; created: number; disabled: boolean };
  summary: { daysDone: number; totalDays: number; solved: number; minutes: number; notes: number; startDate: string | null; lastCompleted: string | null; lastSync: number | null };
  state: Partial<AppState> | null;
}

const problemTitles = () => new Map(plan.flatMap((d) => d.problems.map((p) => [p.slug, p.title] as const)));

/** Read-only view of one friend's journey. Nothing here can change their data. */
export default function FriendView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    apiJson<Data>(`/api/admin/users/${id}`).then(setData).catch((e) => setError((e as Error).message));
  }, [id]);

  const s = data?.state ?? {};
  const done = useMemo(() => new Set(s.doneDays ?? []), [s.doneDays]);
  const titles = useMemo(problemTitles, []);

  // Last 14 days of study time.
  const last14 = useMemo(() => {
    const out: { day: string; min: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({ day: iso, min: s.studyLog?.[iso] ?? 0 });
    }
    return out;
  }, [s.studyLog]);
  const maxMin = Math.max(30, ...last14.map((x) => x.min));

  if (error) return <div className="mx-auto max-w-4xl"><Alert tone="error">{error}</Alert></div>;
  if (!data) return <div className="mx-auto max-w-4xl space-y-4"><div className="skeleton h-24" /><div className="skeleton h-64" /></div>;

  const { user, summary } = data;
  const notes = Object.entries(s.notes ?? {}).sort((a, b) => (b[1].updated ?? "").localeCompare(a[1].updated ?? ""));
  const custom = (s.customTopics?.length ?? 0) > 0 || Object.keys(s.splits ?? {}).length > 0;

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" size="sm" href="/admin" className="mb-2"><ArrowLeft className="h-4 w-4" /> Friends</Button>
      <PageHeader
        title={`${user.name}'s journey`}
        subtitle={<>{user.email} · started {summary.startDate ?? "—"} · last synced {summary.lastSync ? new Date(summary.lastSync).toLocaleString() : "never"}</>}
        action={<Badge tone="muted"><Eye className="mr-1 inline h-3.5 w-3.5" /> Read-only</Badge>}
      />
      {!data.state && <Alert tone="error">{user.name} hasn&apos;t synced any progress yet. It appears here after they use the app while online.</Alert>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: <BookOpenText className="h-4 w-4" />, label: "Days done", value: `${summary.daysDone} / ${summary.totalDays}` },
          { icon: <CheckCircle2 className="h-4 w-4" />, label: "Problems solved", value: String(summary.solved) },
          { icon: <Clock className="h-4 w-4" />, label: "Study time", value: hm(summary.minutes) },
          { icon: <Trophy className="h-4 w-4" />, label: "Last lesson", value: summary.lastCompleted ?? "—" },
        ].map((x, i) => (
          <Card key={x.label} i={i} className="min-w-0 p-4">
            <p className="flex items-center gap-1.5 text-[12px] text-muted">{x.icon} {x.label}</p>
            <p className="mt-1 text-[20px] font-extrabold">{x.value}</p>
          </Card>
        ))}
      </div>

      <Card i={4} className="mt-5 min-w-0 p-4 sm:p-6">
        <h2 className="text-[16px] font-bold">Study time · last 14 days</h2>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {last14.map((x) => (
            <div key={x.day} className="flex min-w-0 flex-1 flex-col items-center gap-1" title={`${x.day}: ${hm(x.min)}`}>
              <div className="w-full rounded-t-md bg-primary" style={{ height: `${Math.max(3, (x.min / maxMin) * 100)}%`, opacity: x.min ? 1 : 0.15 }} />
              <span className="text-[9.5px] text-muted">{x.day.slice(8)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card i={5} className="mt-5 min-w-0 p-4 sm:p-6">
        <h2 className="text-[16px] font-bold">Progress by phase</h2>
        {custom && <p className="mt-1 text-[12px] text-muted">{user.name} customised their plan, so day numbers may differ slightly from the standard plan shown here.</p>}
        <div className="mt-4 space-y-3">
          {phases.filter((p) => !p.custom).map((ph) => {
            const days = plan.filter((d) => d.phase.id === ph.id);
            const n = days.filter((d) => done.has(d.day)).length;
            return (
              <div key={ph.id}>
                <div className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="truncate font-semibold">Phase {ph.id} · {ph.title}</span>
                  <span className="flex-none text-muted">{n}/{days.length}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {days.map((d) => (
                    <span key={d.day} title={`Day ${d.day}: ${d.topic.title}`} className={`h-3.5 w-3.5 rounded-[4px] ${done.has(d.day) ? "bg-green" : "bg-line"}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card i={6} className="min-w-0 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-bold"><CheckCircle2 className="h-5 w-5 text-green" /> Solved problems ({s.solved?.length ?? 0})</h2>
          <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto text-[13px]">
            {(s.solved ?? []).map((slug) => <li key={slug} className="truncate">✓ {titles.get(slug) ?? slug}</li>)}
            {!s.solved?.length && <li className="text-muted">None yet.</li>}
          </ul>
        </Card>
        <Card i={7} className="min-w-0 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-bold"><NotebookPen className="h-5 w-5 text-primary" /> Notes ({notes.length})</h2>
          <ul className="mt-3 max-h-80 space-y-3 overflow-y-auto">
            {notes.map(([k, n]) => (
              <li key={k} className="rounded-xl bg-surface-2 p-3 ring-1 ring-line">
                <p className="text-[11.5px] font-semibold text-muted">{k.startsWith("lesson:") ? `Day ${k.slice(7)}` : k.startsWith("problem:") ? titles.get(k.slice(8)) ?? k : k}</p>
                <p className="mt-1 text-[13px] whitespace-pre-wrap">{n.text}</p>
              </li>
            ))}
            {!notes.length && <li className="text-[13px] text-muted">No notes yet.</li>}
          </ul>
        </Card>
      </div>

      {!!s.quizResults?.length && (
        <Card i={8} className="mt-5 min-w-0 p-4 sm:p-6">
          <h2 className="text-[16px] font-bold">Mock tests</h2>
          <ul className="mt-3 space-y-2">
            {s.quizResults.slice(-10).reverse().map((q, i) => (
              <li key={i} className="flex items-center gap-3 text-[13px]">
                <span className="w-28 flex-none truncate text-muted">{new Date(q.at).toLocaleDateString()}</span>
                <Bar pct={(q.score / q.total) * 100} className="flex-1" />
                <span className="w-14 flex-none text-right font-semibold">{q.score}/{q.total}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
