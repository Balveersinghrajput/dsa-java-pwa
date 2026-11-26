"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Code,
  ExternalLink,
  FileText,
  Flame,
  Gauge,
  Layers,
  ListChecks,
  Play,
  Target,
  Workflow,
  Coffee,
  FileCode2,
  BookMarked,
  Library,
} from "lucide-react";
import { phases, plan, totalProblems } from "@/data/curriculum";
import { getContent } from "@/data/content";
import { videos } from "@/data/videos";
import { quickResources } from "@/data/resources";
import { toISODate } from "@/lib/schedule";
import { hm, type Derived } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import type { TaskId } from "@/types";
import { TASKS } from "./tasks";
import { Card, CardHeader, DiffBadge, LinkMore, st, useCountUp } from "@/components/ui";
import { LeetIcon, YouTubeIcon } from "@/components/shell/nav";
import { StudyTimeCard } from "@/components/timer/StudyTimer";

/* ---------------- stat cards ---------------- */

function StatTile({ i, label, children, sub, icon, tone }: { i: number; label: string; children: ReactNode; sub: string; icon: ReactNode; tone: "primary" | "green" | "amber" | "rose" }) {
  const t = {
    primary: "bg-gradient-to-br from-[#5b50f0] via-[#4f46e5] to-[#4338ca] text-white border-transparent shadow-[0_14px_30px_-12px_rgb(79_70_229/0.7)]",
    green: "bg-green-soft border-green/15",
    amber: "bg-amber-soft border-amber/20",
    rose: "bg-rose-soft border-rose/15",
  }[tone];
  const labelCls = { primary: "text-white/85", green: "text-green", amber: "text-amber", rose: "text-rose" }[tone];
  const iconCls = {
    primary: "bg-white/15 text-white ring-1 ring-white/25",
    green: "bg-green/10 text-green",
    amber: "bg-amber text-white",
    rose: "bg-rose text-white",
  }[tone];
  return (
    <div className={`rise lift relative overflow-hidden rounded-2xl border p-4 2xl:p-5 ${t}`} style={st(i)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-[12.5px] leading-tight font-semibold sm:text-[13px] ${labelCls}`}>{label}</p>
          <div className={`mt-2.5 text-[24px] leading-none font-extrabold tracking-tight whitespace-nowrap tabular-nums 2xl:text-[26px] ${tone === "primary" ? "text-white" : "text-ink"}`}>{children}</div>
          <p className={`mt-3 text-[12.5px] whitespace-nowrap ${tone === "primary" ? "text-white/80" : "text-ink-2"}`}>{sub}</p>
        </div>
        <span className={`grid h-10 w-10 flex-none place-items-center rounded-full 2xl:h-11 2xl:w-11 ${iconCls}`}>{icon}</span>
      </div>
    </div>
  );
}

export function StatCards({ d }: { d: Derived }) {
  const { state } = useAppState();
  const phase = plan[d.focus - 1].phase;
  const dayN = useCountUp(d.focus);
  const solvedN = useCountUp(state.solved.length);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatTile i={1} tone="primary" label="Day" sub={`${d.pct.toFixed(1)}% Completed`} icon={<CalendarDays className="h-5 w-5" />}>
        {Math.round(dayN)} <span className="text-[16px] font-semibold text-white/85">/ {plan.length}</span>
      </StatTile>
      <StatTile i={2} tone="green" label="Phase" sub={phase.short} icon={<Layers className="h-6 w-6" />}>
        {phase.id} <span className="text-[16px] font-semibold text-ink-2">/ {phases[phases.length - 1].id}</span>
      </StatTile>
      <StatTile i={3} tone="amber" label="Problems Solved" sub={`${((state.solved.length / totalProblems) * 100).toFixed(1)}% of total`} icon={<Check className="h-5 w-5" strokeWidth={3} />}>
        {Math.round(solvedN)} <span className="text-[16px] font-semibold text-ink-2">/ {totalProblems}</span>
      </StatTile>
      <StudyTimeCard i={4} totalMinutes={d.totalStudied} />
    </div>
  );
}

/* ---------------- today's plan ---------------- */


export function TodayPlan({ d }: { d: Derived }) {
  const { state, toggleTask } = useAppState();
  const day = plan[d.focus - 1];
  const done = state.tasks[d.focus] ?? [];
  const sub: Record<TaskId, string> = {
    learn: day.topic.title,
    implement: "Code today's concepts in Java",
    practice: `${day.problems.length} related LeetCode problems`,
    revise: d.focus > 1 ? `Day ${d.focus - 1}: ${plan[d.focus - 2].topic.title}` : "Set up your dsa-java GitHub repo",
  };
  return (
    <Card i={6} className="flex flex-col p-5">
      <CardHeader title="Today's Plan" action={<span className="text-[13px] font-semibold text-primary">Est. {hm(d.dayMinutes)}</span>} />
      <ul className="mt-4 flex-1 space-y-2.5">
        {TASKS.map((t, i) => {
          const isDone = done.includes(t.id);
          return (
            <li key={t.id}>
              <button
                onClick={() => toggleTask(d.focus, t.id)}
                aria-pressed={isDone}
                className={`press group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${isDone ? "border-primary-faint bg-primary-soft/50" : "border-line hover:border-primary-faint"}`}
              >
                <span className={`grid h-6 w-6 flex-none place-items-center rounded-md text-[12px] font-bold ${isDone ? "bg-primary text-white" : "bg-surface-2 text-ink-2 ring-1 ring-line"}`}>
                  {isDone ? <Check className="check-pop h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className={`grid h-9 w-9 flex-none place-items-center rounded-lg ${t.tone}`}>{t.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[13.5px] font-semibold ${isDone ? "text-muted line-through" : "text-ink"}`}>{t.title}</span>
                  <span className="block truncate text-[12px] text-muted">{sub[t.id]}</span>
                </span>
                <span className="text-[12.5px] font-semibold whitespace-nowrap text-ink-2">{state.schedule[t.id]} min</span>
              </button>
            </li>
          );
        })}
      </ul>
      <SickLeaveBar d={d} />
      <div className="mt-3 text-center">
        <LinkMore href="/roadmap">View Full Plan</LinkMore>
      </div>
    </Card>
  );
}

/** Quick sick-leave action for today (2 per 2 weeks). */
function SickLeaveBar({ d }: { d: Derived }) {
  const { state, takeLeave, cancelLeave } = useAppState();
  const kind = d.dayRules.kind(new Date());
  if (kind === "rest") return <p className="mt-3 rounded-xl bg-amber-soft px-3 py-2 text-center text-[12.5px] font-semibold text-amber">Today is your weekly holiday 🌴</p>;
  if (kind === "leave" || kind === "auto-leave")
    return (
      <p className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-amber-soft px-3 py-2 text-[12.5px] font-semibold text-amber">
        {kind === "leave" ? "Sick leave today — rest well" : "Leave day (unused leave, end of block)"}
        {kind === "leave" && <button onClick={() => cancelLeave(d.todayISO)} className="underline underline-offset-2">undo</button>}
      </p>
    );
  return (
    <button
      onClick={() => takeLeave(d.todayISO, d.startDate)}
      disabled={d.leave.left === 0}
      className="press mt-3 w-full rounded-xl border border-dashed border-line px-3 py-2 text-[12.5px] font-semibold text-muted hover:border-amber hover:text-amber disabled:opacity-50 disabled:hover:border-line disabled:hover:text-muted"
      title={state.autoLeave ? "Unused leave is taken at the end of each 2-week block" : undefined}
    >
      {d.leave.left > 0 ? `Not well today? Take sick leave (${d.leave.left} of 2 left this fortnight)` : "No sick leave left this fortnight"}
    </button>
  );
}

/* ---------------- today's topic ---------------- */

export function TodayTopic({ d }: { d: Derived }) {
  const { state } = useAppState();
  const day = plan[d.focus - 1];
  const content = getContent(day.topic.id);
  const done = state.tasks[d.focus] ?? [];
  const pct = d.done.has(d.focus) ? 100 : Math.round((TASKS.filter((t) => done.includes(t.id)).reduce((a, t) => a + state.schedule[t.id], 0) / d.dayMinutes) * 100);
  const tabs = [
    { id: "lesson", label: "Lesson" },
    { id: "notes", label: "Notes" },
    { id: "code", label: "Code" },
    { id: "resources", label: "Resources" },
    { id: "problems", label: `Problems (${day.problems.length})` },
  ];
  return (
    <Card i={7} className="flex flex-col p-5">
      <CardHeader title="Today's Topic" action={<span className="rounded-lg bg-primary-soft px-2.5 py-1 text-[12px] font-bold text-primary">Day {d.focus}</span>} />
      <h3 className="mt-3 text-[18px] leading-snug font-bold tracking-tight text-ink">{day.topic.title}</h3>
      <p className="mt-2 line-clamp-2 text-[13.5px] text-ink-2">{content?.summary ?? day.concepts.join(" · ")}</p>
      <p className="mt-4 text-[12.5px] font-semibold text-ink-2">{pct}% Completed</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-soft">
        <div className="grow-x h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-5 mb-5 grid grid-cols-2 gap-3">
        <Link href={`/lessons/${d.focus}`} className="press inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-[13.5px] font-semibold text-white shadow-[0_8px_18px_-8px_rgb(79_70_229/0.7)] hover:bg-primary-strong">
          <Play className="h-4 w-4 fill-current" /> Continue Learning
        </Link>
        <Link href={`/lessons/${d.focus}?tab=explanation`} className="press inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line text-[13.5px] font-semibold text-ink hover:border-primary-faint hover:bg-primary-soft/40">
          <BookOpen className="h-4 w-4" /> View Lesson
        </Link>
      </div>
      {day.concepts.length > 0 && (
        <div className="mt-5">
          <p className="text-[11.5px] font-semibold tracking-wide text-muted uppercase">In this lesson</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {day.concepts.slice(0, 3).map((c) => (
              <span key={c} className="max-w-full truncate rounded-lg bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-ink-2 ring-1 ring-line">{c.split(/[:;—(]/)[0].trim()}</span>
            ))}
          </div>
        </div>
      )}
      <nav className="no-scrollbar mt-auto -mb-1 flex gap-1 overflow-x-auto border-t border-line pt-3 sm:justify-between">
        {tabs.map((t, i) => (
          <Link key={t.id} href={`/lessons/${d.focus}?tab=${t.id}`} className={`relative shrink-0 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors ${i === 0 ? "text-primary" : "text-muted hover:text-ink"}`}>
            {t.label}
            {i === 0 && <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary" />}
          </Link>
        ))}
      </nav>
    </Card>
  );
}

/* ---------------- LeetCode problems ---------------- */

export function ProblemsCard({ d }: { d: Derived }) {
  const { state } = useAppState();
  const list: { p: (typeof plan)[number]["problems"][number]; day: number }[] = [];
  for (let k = d.focus; k <= plan.length && list.length < 4; k++) for (const p of plan[k - 1].problems) if (list.length < 4 && !list.some((x) => x.p.slug === p.slug)) list.push({ p, day: k });
  const todayCount = plan[d.focus - 1].problems.length;
  return (
    <Card i={8} className="p-5">
      <CardHeader title="LeetCode Problems" action={<LinkMore href={`/problems?day=${d.focus}`}>View All ({todayCount})</LinkMore>} />
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
        {list.map(({ p, day }) => {
          const solved = d.solved.has(p.slug);
          const attempted = !solved && (state.attempts[p.slug]?.length ?? 0) > 0;
          return (
            <li key={p.slug} className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2">
              <DiffBadge d={p.difficulty} className="w-16 justify-center" />
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink hover:text-primary" title={`Day ${day}`}>
                {p.title}
              </a>
              <span className={`text-[11.5px] font-semibold ${solved ? "text-green" : attempted ? "text-amber" : "text-muted"}`}>{solved ? "Solved" : attempted ? "Attempted" : "Unsolved"}</span>
              {solved ? <CircleCheck className="h-[18px] w-[18px] text-green" /> : <Link href={`/problems?q=${encodeURIComponent(p.title)}`} aria-label={`Open ${p.title}`}><ChevronRight className="h-4 w-4 text-muted" /></Link>}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------------- recommended ---------------- */

export function Recommended({ d }: { d: Derived }) {
  const day = plan[d.focus - 1];
  const video = videos.find((v) => v.topic === day.topic.id) ?? videos.find((v) => plan.some((p) => p.phase.id === day.phase.id && p.topic.id === v.topic));
  const visual = day.topic.resources.find((r) => r.kind === "web" && /visualgo|cp-algorithms/.test(r.url));
  const rows = [
    video && { key: "yt", icon: <YouTubeIcon className="h-6 w-6" />, kind: "YouTube", text: video.title, href: `/resources/videos/${video.id}`, external: false },
    getContent(day.topic.id) && { key: "ar", icon: <FileText className="h-[18px] w-[18px] text-primary" />, kind: "Article", text: `${day.topic.title} — complete guide`, href: `/resources/articles/${day.topic.id}`, external: false },
    {
      key: "vi",
      icon: <Workflow className="h-[18px] w-[18px] text-[#9333ea]" />,
      kind: "Visualizer",
      text: visual ? visual.label : "Interactive visualisation in today's lesson",
      href: visual ? visual.url : `/lessons/${d.focus}?tab=visual`,
      external: !!visual,
    },
  ].filter(Boolean) as { key: string; icon: ReactNode; kind: string; text: string; href: string; external: boolean }[];
  return (
    <Card i={9} className="p-5">
      <CardHeader title="Recommended for You" action={<LinkMore href="/resources">View All</LinkMore>} />
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
        {rows.map((r) => {
          const inner = (
            <>
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-surface-2">{r.icon}</span>
              <span className="w-[72px] flex-none text-[12.5px] font-semibold text-ink">{r.kind}</span>
              <span className="line-clamp-2 min-w-0 flex-1 text-[12.5px] text-ink-2">{r.text}</span>
              {r.external ? <ExternalLink className="h-4 w-4 flex-none text-muted" /> : <ChevronRight className="h-4 w-4 flex-none text-muted" />}
            </>
          );
          return (
            <li key={r.key}>
              {r.external ? (
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2">{inner}</a>
              ) : (
                <Link href={r.href} className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2">{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------------- right rail: calendar ---------------- */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarCard({ d, i = 0 }: { d: Derived; i?: number }) {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const offset = (cursor.getDay() + 6) % 7;
  const start = new Date(y, m, 1 - offset);
  const cells = Array.from({ length: 42 }, (_, k) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + k));
  const rows = cells[35].getMonth() !== m ? 5 : 6;
  return (
    <Card i={i} className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold">Calendar</h2>
        <div className="flex items-center gap-1">
          <span className="mr-2 text-[13px] font-semibold">{cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          <button aria-label="Previous month" onClick={() => setCursor(new Date(y, m - 1, 1))} className="press grid h-7 w-7 place-items-center rounded-lg hover:bg-surface-2"><ChevronLeft className="h-4 w-4" /></button>
          <button aria-label="Next month" onClick={() => setCursor(new Date(y, m + 1, 1))} className="press grid h-7 w-7 place-items-center rounded-lg hover:bg-surface-2"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-medium text-muted">
        {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
      </div>
      <div key={`${y}-${m}`} className="grid grid-cols-7 gap-y-1 text-center">
        {cells.slice(0, rows * 7).map((c, k) => {
          const iso = toISODate(c);
          const day = d.dateMap.get(iso);
          const inMonth = c.getMonth() === m;
          const isToday = iso === d.todayISO;
          const doneDay = day ? d.done.has(day) : false;
          const kind = d.dayRules.kind(c);
          const body = (
            <span className="pop relative mx-auto grid h-9 w-9 place-items-center" style={st(k * 0.25)}>
              <span className={`grid h-8 w-8 place-items-center rounded-full text-[12.5px] font-semibold tabular-nums transition-colors ${isToday ? "bg-primary text-white shadow-[0_6px_14px_-6px_rgb(79_70_229/0.8)]" : !inMonth ? "text-muted/50" : kind === "rest" ? "text-muted/70" : "text-ink hover:bg-primary-soft"}`}>
                {c.getDate()}
              </span>
              {doneDay && !isToday && <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-green" />}
              {inMonth && kind !== "study" && kind !== "rest" && <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-amber" title="Leave" />}
            </span>
          );
          return day ? (
            <Link key={iso} href={`/lessons/${day}`} title={`Day ${day}: ${plan[day - 1].topic.title}${doneDay ? " ✓" : ""}`}>{body}</Link>
          ) : (
            <span key={iso} title={kind === "rest" ? "Weekly holiday" : kind === "study" ? undefined : "Leave day"}>{body}</span>
          );
        })}
      </div>
      <div className="mt-2 flex justify-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-green" />Done</span>
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-amber" />Leave</span>
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-muted/40" />Holiday (faded)</span>
      </div>
    </Card>
  );
}

/* ---------------- right rail: streak ---------------- */

export function StreakCard({ d, i = 0 }: { d: Derived; i?: number }) {
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const week = ["M", "T", "W", "T", "F", "S", "S"].map((label, k) => {
    const dt = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + k);
    const iso = toISODate(dt);
    const day = d.dateMap.get(iso);
    return { label, iso, day, done: day ? d.done.has(day) : false, isToday: iso === d.todayISO };
  });
  return (
    <Card i={i} className="p-5">
      <div className="flex items-start gap-3">
        <Flame className="flicker h-11 w-11 flex-none fill-[#fb923c] text-[#ea580c]" strokeWidth={1.5} />
        <div>
          <h2 className="text-[18px] font-bold">{d.streak} Day Streak</h2>
          <p className="mt-0.5 text-[12.5px] text-muted">{d.streak > 0 ? "Keep it up! Consistency is the key." : "Complete today's lesson to start a streak."}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 text-center">
        {week.map((w, k) => (
          <div key={w.iso} className="flex flex-col items-center gap-2">
            <span
              className={`pop grid h-7 w-7 place-items-center rounded-full ${w.done ? "bg-primary text-white" : w.isToday ? "border-2 border-primary" : "border-2 border-line"}`}
              style={st(k + 2)}
              title={w.day ? `Day ${w.day}` : "Rest day"}
            >
              {w.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <span className="text-[11px] font-semibold text-ink-2">{w.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- right rail: up next ---------------- */

const upIcons = [
  { icon: <BookMarked className="h-[18px] w-[18px]" />, tone: "bg-primary-soft text-primary" },
  { icon: <FileCode2 className="h-[18px] w-[18px]" />, tone: "bg-[#e0f2fe] text-[#0284c7] dark:bg-[#0c2a3d] dark:text-[#7dd3fc]" },
  { icon: <Coffee className="h-[18px] w-[18px]" />, tone: "bg-amber-soft text-amber" },
];

export function UpNext({ d, i = 0 }: { d: Derived; i?: number }) {
  const { state, toggleBookmark } = useAppState();
  const next = [d.focus + 1, d.focus + 2, d.focus + 3].filter((n) => n <= plan.length).map((n) => plan[n - 1]);
  return (
    <Card i={i} className="p-5">
      <CardHeader title="Up Next" action={<LinkMore href="/lessons">View All</LinkMore>} />
      {next.length === 0 ? (
        <p className="mt-4 text-[13px] text-muted">You&apos;ve reached the end of the plan. 🎉</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {next.map((p, k) => {
            const key = `lesson:${p.day}`;
            const marked = state.bookmarks.includes(key);
            return (
              <li key={p.day} className="group flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
                <span className={`grid h-10 w-10 flex-none place-items-center rounded-xl ${upIcons[k % 3].tone}`}>{upIcons[k % 3].icon}</span>
                <Link href={`/lessons/${p.day}`} className={`min-w-0 flex-1 ${d.isLocked(p.day) ? "opacity-60" : ""}`}>
                  <span className="block text-[12.5px] font-semibold text-primary">Day {p.day}{d.isLocked(p.day) && " · 🔒 preview"}</span>
                  <span className="block truncate text-[13.5px] font-semibold text-ink">{p.topic.title}</span>
                </Link>
                <button onClick={() => toggleBookmark(key)} aria-label={marked ? "Remove bookmark" : "Bookmark lesson"} aria-pressed={marked} className={`press grid h-8 w-8 place-items-center rounded-lg ${marked ? "text-primary" : "text-muted opacity-60 group-hover:opacity-100"} hover:bg-surface`}>
                  <Bookmark className={`h-[18px] w-[18px] ${marked ? "fill-current" : ""}`} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/* ---------------- right rail: quick resources ---------------- */

const resIcons = [ListChecks, Code, BookOpen, LeetIcon, Gauge];

export function QuickResources({ i = 0 }: { i?: number }) {
  return (
    <Card i={i} className="p-5">
      <CardHeader title="Quick Resources" action={<LinkMore href="/resources">View All</LinkMore>} />
      <ul className="mt-3 space-y-0.5">
        {quickResources.map((r, k) => {
          const I = resIcons[k % resIcons.length];
          return (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg px-1.5 py-2 hover:bg-surface-2" title={r.note}>
                <I className="h-[18px] w-[18px] text-ink-2" />
                <span className="flex-1 text-[13px] font-semibold text-primary group-hover:text-primary-strong">{r.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted" />
              </a>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------------- bottom strip ---------------- */

export function BottomStats({ d }: { d: Derived }) {
  const items = [
    { icon: <CalendarDays className="h-5 w-5" />, value: String(plan.length), label: "Days Planned" },
    { icon: <Layers className="h-5 w-5" />, value: String(phases.length), label: "Phases" },
    { icon: <Code className="h-5 w-5" />, value: String(totalProblems), label: "Total Problems" },
    { icon: <Clock className="h-5 w-5" />, value: `~${Math.round((d.dayMinutes / 60) * 10) / 10} Hrs`, label: "Daily Commitment" },
    { icon: <Library className="h-5 w-5" />, value: `${Math.round((d.dayMinutes * plan.length) / 60)} Hrs`, label: "Total Study Time" },
    { icon: <Target className="h-5 w-5" />, value: (d.targetFinish ?? d.expectedFinish).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), label: d.targetFinish ? `Target Finish${d.onTrack === false ? " · behind" : ""}` : "Expected Finish", flip: true },
  ];
  return (
    <Card i={12} className="grid grid-cols-2 gap-y-4 p-4 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-line lg:p-5">
      {items.map((x) => (
        <div key={x.label} className="flex items-center gap-3 px-2 lg:px-4">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-surface-2 text-ink-2 ring-1 ring-line">{x.icon}</span>
          <span className="min-w-0">
            {x.flip ? (
              <>
                <span className="block text-[11.5px] text-muted">{x.label}</span>
                <span className="block truncate text-[14px] font-bold text-primary">{x.value}</span>
              </>
            ) : (
              <>
                <span className="block text-[16px] font-bold text-ink">{x.value}</span>
                <span className="block text-[11.5px] text-muted">{x.label}</span>
              </>
            )}
          </span>
        </div>
      ))}
    </Card>
  );
}

