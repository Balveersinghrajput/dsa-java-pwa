"use client";

import Select from "@/components/ui/Select";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { phases, plan, planVersion, type Difficulty, type Problem } from "@/data/curriculum";
import { useAppState } from "@/lib/store";
import { Bar, EmptyState, PageHeader, Segmented, cardCls, st } from "@/components/ui";
import ProblemRow from "@/components/lessons/ProblemRow";
import { LeetIcon } from "@/components/shell/nav";

type Status = "all" | "solved" | "attempted" | "unsolved";
type Entry = { p: Problem; day: number; phase: number; topic: string };

function buildAll(): Entry[] {
  const seen = new Set<string>();
  const out: Entry[] = [];
  for (const d of plan)
    for (const p of d.problems) {
      if (seen.has(p.slug)) continue;
      seen.add(p.slug);
      out.push({ p, day: d.day, phase: d.phase.id, topic: d.topic.title });
    }
  return out;
}

const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];
const PAGE = 30;

function ProblemsInner() {
  const params = useSearchParams();
  const { state } = useAppState();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [phase, setPhase] = useState<number | "all">(params.get("topic") ? Number(params.get("topic")) : "all");
  const [day] = useState<number | null>(params.get("day") ? Number(params.get("day")) : null);
  const [diff, setDiff] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<Status>("all");
  const [dayFilter, setDayFilter] = useState(day);

  // Only render a page of rows at a time — rendering all 357 at once made the page slow.
  const [shown, setShown] = useState<Record<Difficulty, number>>({ Easy: PAGE, Medium: PAGE, Hard: PAGE });
  useEffect(() => setShown({ Easy: PAGE, Medium: PAGE, Hard: PAGE }), [q, phase, diff, status, dayFilter]);
  const version = planVersion();
  const ALL = useMemo(() => buildAll(), [version]); // eslint-disable-line react-hooks/exhaustive-deps
  const solved = new Set(state.solved);
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return ALL.filter(({ p, phase: ph, day: dd, topic }) => {
      if (dayFilter && dd !== dayFilter) return false;
      if (phase !== "all" && ph !== phase) return false;
      if (diff !== "all" && p.difficulty !== diff) return false;
      const isSolved = solved.has(p.slug);
      const attempted = !isSolved && (state.attempts[p.slug]?.length ?? 0) > 0;
      if (status === "solved" && !isSolved) return false;
      if (status === "attempted" && !attempted) return false;
      if (status === "unsolved" && (isSolved || attempted)) return false;
      return !query || `${p.title} ${topic}`.toLowerCase().includes(query);
    });
  }, [q, phase, diff, status, dayFilter, state.solved, state.attempts, ALL]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = DIFFS.map((dd) => {
    const all = ALL.filter((e) => e.p.difficulty === dd);
    return { d: dd, total: all.length, solved: all.filter((e) => solved.has(e.p.slug)).length };
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="LeetCode Problems" subtitle={`${ALL.length} hand-picked problems, every link checked against LeetCode · ${state.solved.length} solved`} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s, k) => (
          <button key={s.d} onClick={() => setDiff(diff === s.d ? "all" : s.d)} className={`rise press p-4 text-left ${cardCls} ${diff === s.d ? "ring-2 ring-primary" : ""}`} style={st(k + 1)}>
            <div className="flex items-center justify-between">
              <span className={`text-[13px] font-bold ${s.d === "Easy" ? "text-green" : s.d === "Medium" ? "text-amber" : "text-rose"}`}>{s.d}</span>
              <span className="text-[13px] font-semibold text-ink-2 tabular-nums">{s.solved}/{s.total}</span>
            </div>
            <Bar pct={(s.solved / s.total) * 100} className="mt-3" color={s.d === "Easy" ? "bg-green" : s.d === "Medium" ? "bg-amber" : "bg-rose"} />
          </button>
        ))}
      </div>

      <div className="rise mt-5 flex flex-col gap-3 lg:flex-row lg:items-center" style={st(4)}>
        <label className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-4 shadow-card focus-within:border-primary lg:w-auto lg:flex-1">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problems or topics…" className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted" />
          {q && <button onClick={() => setQ("")} aria-label="Clear search"><X className="h-4 w-4 text-muted" /></button>}
        </label>
        <Select<number | "all"> label="Filter by topic" className="w-full sm:w-64" value={phase} onChange={setPhase} options={[{ value: "all" as const, label: "All topics" }, ...phases.map((p) => ({ value: p.id, label: p.title }))]} />
        <Segmented options={[{ id: "all", label: "All" }, { id: "solved", label: "Solved" }, { id: "attempted", label: "Attempted" }, { id: "unsolved", label: "Unsolved" }]} value={status} onChange={setStatus} />
      </div>
      {dayFilter && (
        <p className="mt-3 text-[13px]">
          Showing Day {dayFilter} only · <button onClick={() => setDayFilter(null)} className="font-semibold text-primary hover:underline">show all days</button>
        </p>
      )}

      {list.length === 0 ? (
        <div className="mt-6"><EmptyState icon={<LeetIcon className="h-5 w-5" />} title="No problems match" text="Change the filters or clear the search." /></div>
      ) : (
        <div className="mt-6 space-y-6">
          {DIFFS.filter((dd) => diff === "all" || dd === diff).map((dd) => {
            const group = list.filter((e) => e.p.difficulty === dd);
            if (!group.length) return null;
            return (
              <section key={dd}>
                <h2 className={`mb-2 text-[14px] font-bold ${dd === "Easy" ? "text-green" : dd === "Medium" ? "text-amber" : "text-rose"}`}>{dd} · {group.length}</h2>
                <ul className="space-y-2">
                  {group.slice(0, shown[dd]).map((e) => <ProblemRow key={e.p.slug} p={e.p} day={e.day} topic={e.topic} showDay />)}
                </ul>
                {group.length > shown[dd] && (
                  <button onClick={() => setShown((x) => ({ ...x, [dd]: x[dd] + PAGE }))} className="press mt-3 w-full rounded-xl border border-dashed border-line py-2.5 text-[13px] font-semibold text-primary hover:border-primary-faint hover:bg-primary-soft/40">
                    Show {Math.min(PAGE, group.length - shown[dd])} more of {group.length - shown[dd]} remaining
                  </button>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense>
      <ProblemsInner />
    </Suspense>
  );
}
