"use client";

import Select from "@/components/ui/Select";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BookOpenText, Bookmark, Check, Clock, Lock, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { phases, plan } from "@/data/curriculum";
import { fmtShort, fmtMinutes } from "@/lib/schedule";
import { level, useDerived } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import { EmptyState, PageHeader, Segmented, cardCls, st } from "@/components/ui";

type Status = "all" | "done" | "upcoming" | "missed";

function LessonsInner() {
  const { state, toggleBookmark } = useAppState();
  const d = useDerived();
  const [q, setQ] = useState("");
  const [phase, setPhase] = useState<number | "all">("all");
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>((["done", "upcoming", "missed"].includes(params.get("status") ?? "") ? params.get("status") : "all") as Status);

  // Start around today's lesson's page and render 24 cards at a time (152 at once was slow).
  const [limit, setLimit] = useState(() => Math.max(24, Math.ceil(d.focus / 24) * 24));
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setLimit(24); // a new search/filter starts from the top
  }, [q, phase, status]);
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return plan.filter((x) => {
      if (phase !== "all" && x.phase.id !== phase) return false;
      const done = d.done.has(x.day);
      if (status === "done" && !done) return false;
      if (status === "upcoming" && (done || x.day < d.today)) return false;
      if (status === "missed" && (done || x.day >= d.today)) return false;
      if (!query) return true;
      return `${x.topic.title} ${x.phase.title} ${x.concepts.join(" ")} day ${x.day}`.toLowerCase().includes(query);
    });
  }, [q, phase, status, d.done, d.today, plan.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="All Lessons" subtitle={`${plan.length} day-by-day lessons across ${phases.length} phases · ${state.doneDays.length} completed`} action={<a href="/roadmap#customise" className="press inline-flex h-10 items-center rounded-xl border border-line bg-surface px-4 text-[13.5px] font-semibold hover:border-primary-faint">+ Add your own topic</a>} />
      {d.catchUp && (
        <p className="rise mb-4 flex items-center gap-2 rounded-xl border border-amber/30 bg-amber-soft px-4 py-3 text-[13.5px]"><Lock className="h-4 w-4 flex-none text-amber" /> You have {d.missed.length} missed days, so lessons after Day {d.firstUndone} are locked until you catch up. You can still open them to preview.</p>
      )}

      <div className="rise flex flex-wrap items-center gap-2 sm:gap-3" style={st(1)}>
        <label className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-4 shadow-card focus-within:border-primary lg:w-auto lg:flex-1">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons, concepts…" className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted" />
        </label>
        <Select<number | "all"> label="Filter by phase" className="w-full sm:w-72" value={phase} onChange={setPhase} options={[{ value: "all" as const, label: "All phases" }, ...phases.map((p) => ({ value: p.id, label: `Phase ${p.id} · ${p.title}` }))]} />
        <Segmented options={[{ id: "all", label: "All" }, { id: "done", label: "Done" }, { id: "upcoming", label: "Upcoming" }, { id: "missed", label: "Missed" }]} value={status} onChange={setStatus} />
      </div>

      {list.length === 0 ? (
        <div className="mt-6"><EmptyState icon={<BookOpenText className="h-5 w-5" />} title="No lessons match" text="Try a different search or filter." /></div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.slice(0, limit).map((x, k) => {
            const done = d.done.has(x.day);
            const isToday = x.day === d.today;
            const missed = !done && x.day < d.today;
            const locked = d.isLocked(x.day);
            const solved = x.problems.filter((p) => d.solved.has(p.slug)).length;
            const key = `lesson:${x.day}`;
            const marked = state.bookmarks.includes(key);
            return (
              <div key={x.day} className={`rise lift relative flex flex-col p-4 ${cardCls} ${isToday ? "ring-2 ring-primary" : ""}`} style={st(Math.min(k, 12) * 0.6)}>
                <div className="flex items-center gap-2">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl text-[12px] font-bold ${done ? "bg-primary text-white" : isToday ? "bg-primary-soft text-primary ring-1 ring-primary" : missed ? "bg-rose-soft text-rose" : "bg-surface-2 text-ink-2 ring-1 ring-line"}`}>
                    {done ? <Check className="h-4 w-4" strokeWidth={3} /> : x.day}
                  </span>
                  <div className="min-w-0 flex-1 text-[12px] text-muted">
                    <span className="font-semibold text-ink-2">Day {x.day}</span> · {fmtShort(d.calendar[x.day - 1])}
                    {isToday && <span className="ml-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">TODAY</span>}
                    {missed && <span className="ml-1.5 rounded bg-rose-soft px-1.5 py-0.5 text-[10px] font-bold text-rose">MISSED</span>}
                  </div>
                  <button onClick={() => toggleBookmark(key)} aria-pressed={marked} aria-label={marked ? "Remove bookmark" : "Bookmark lesson"} className={`press grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2 ${marked ? "text-primary" : "text-muted"}`}>
                    <Bookmark className={`h-4 w-4 ${marked ? "fill-current" : ""}`} />
                  </button>
                </div>
                {locked && <span className="absolute top-3 right-12 inline-flex items-center gap-1 rounded-md bg-amber-soft px-1.5 py-0.5 text-[10.5px] font-bold text-amber"><Lock className="h-3 w-3" />LOCKED</span>}
                <Link href={`/lessons/${x.day}`} className="mt-3 block flex-1" title={locked ? "Preview — complete your missed days to unlock" : undefined}>
                  <span className="block text-[15px] leading-snug font-bold text-ink hover:text-primary">{x.topic.title}{x.topic.days > 1 && <span className="font-medium text-muted"> · part {x.part}/{x.topic.days}</span>}{x.sub && <span className="font-medium text-primary"> · split {x.sub.index}/{x.sub.of}</span>}{x.topic.custom && <span className="ml-1.5 rounded bg-primary-soft px-1.5 py-0.5 align-middle text-[10px] font-bold text-primary">CUSTOM</span>}</span>
                  <span className="mt-1 line-clamp-2 text-[12.5px] text-muted">{x.concepts.join(" · ") || "Practice & revision day"}</span>
                </Link>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 text-[12px] text-ink-2">
                  <span className="rounded-md bg-surface-2 px-2 py-0.5 font-semibold">{x.phase.short}</span>
                  <span>{level(x)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{fmtMinutes(d.dayMinutes)}</span>
                  <span className="ml-auto font-semibold">{solved}/{x.problems.length} solved</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {list.length > limit && (
        <button onClick={() => setLimit((n) => n + 24)} className="press mt-4 w-full rounded-xl border border-dashed border-line py-3 text-[13.5px] font-semibold text-primary hover:border-primary-faint hover:bg-primary-soft/40">
          Show {Math.min(24, list.length - limit)} more lessons ({list.length - limit} remaining)
        </button>
      )}
    </div>
  );
}

export default function LessonsPage() {
  return (
    <Suspense>
      <LessonsInner />
    </Suspense>
  );
}
