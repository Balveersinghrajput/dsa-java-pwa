"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, BookOpenText, CalendarClock, CheckCircle2, Clock, Flame, Repeat, Trophy } from "lucide-react";
import { phases, plan, totalProblems } from "@/data/curriculum";
import { toISODate, fmtShort } from "@/lib/schedule";
import { hm, REVISION_GAPS, useDerived } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import { Bar as ProgressBar, Button, Card, CardHeader, EmptyState, PageHeader, cardCls, st, useCountUp } from "@/components/ui";

const tip = { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 12, color: "var(--ink)" };
const axis = { fontSize: 11, fill: "var(--muted)" };

function Stat({ i, icon, label, value, sub }: { i: number; icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className={`rise p-4 ${cardCls}`} style={st(i)}>
      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-muted"><span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">{icon}</span>{label}</div>
      <p className="mt-2 text-[24px] leading-none font-extrabold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12px] text-muted">{sub}</p>
    </div>
  );
}

export default function ProgressPage() {
  const { state, markRevised } = useAppState();
  const d = useDerived();
  const now = new Date();

  const daily = useMemo(
    () =>
      Array.from({ length: 14 }, (_, k) => {
        const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13 + k);
        const iso = toISODate(dt);
        return { day: dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), hours: +((state.studyLog[iso] ?? 0) / 60).toFixed(2) };
      }),
    [state.studyLog], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const weekly = useMemo(() => {
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    return Array.from({ length: 12 }, (_, k) => {
      const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - (11 - k) * 7);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
      const s = toISODate(start);
      const e = toISODate(end);
      const lessons = Object.values(state.doneAt).filter((iso) => iso >= s && iso < e).length;
      const solved = Object.values(state.attempts).filter((a) => a.some((x) => x.result === "solved" && x.at.slice(0, 10) >= s && x.at.slice(0, 10) < e)).length;
      return { week: fmtShort(start), lessons, solved };
    });
  }, [state.doneAt, state.attempts]); // eslint-disable-line react-hooks/exhaustive-deps

  const diff = (["Easy", "Medium", "Hard"] as const).map((k) => {
    const seen = new Set<string>();
    let total = 0;
    let solved = 0;
    for (const dd of plan)
      for (const p of dd.problems)
        if (p.difficulty === k && !seen.has(p.slug)) {
          seen.add(p.slug);
          total++;
          if (d.solved.has(p.slug)) solved++;
        }
    return { name: k, total, solved };
  });
  const diffColors = ["#22c55e", "#f59e0b", "#e11d48"];

  // Monthly heatmap for the current month
  const y = now.getFullYear();
  const m = now.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysIn = new Date(y, m + 1, 0).getDate();
  const maxMin = Math.max(60, ...Object.values(state.studyLog));

  // Longest streak (consecutive completed plan days)
  let longest = 0;
  let run = 0;
  for (let k = 1; k <= plan.length; k++) {
    run = d.done.has(k) ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  const studiedN = useCountUp(d.totalStudied);
  const studyDays = Object.values(state.studyLog).filter((v) => v > 0).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Progress & Analytics" subtitle={`${state.doneDays.length} of ${plan.length} lessons completed · ${state.solved.length} of ${totalProblems} problems solved`} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat i={1} icon={<BookOpenText className="h-4 w-4" />} label="Lessons completed" value={`${state.doneDays.length}`} sub={`${d.pct.toFixed(1)}% of the course`} />
        <Stat i={2} icon={<CheckCircle2 className="h-4 w-4" />} label="Problems solved" value={`${state.solved.length}`} sub={`${((state.solved.length / totalProblems) * 100).toFixed(1)}% of ${totalProblems}`} />
        <Stat i={3} icon={<Clock className="h-4 w-4" />} label="Study time" value={hm(studiedN)} sub={studyDays ? `${hm(d.totalStudied / studyDays)} per active day` : "Logged when you complete lessons"} />
        <Stat i={4} icon={<Flame className="h-4 w-4" />} label="Streak" value={`${d.streak} days`} sub={`Longest: ${longest} days`} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card i={5} className="p-5">
          <CardHeader title="Daily study hours" action={<span className="text-[12px] text-muted">Last 14 days</span>} />
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ left: -20, right: 4 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="day" tick={axis} interval={1} tickLine={false} axisLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals />
                <Tooltip contentStyle={tip} cursor={{ fill: "var(--primary-soft)" }} formatter={(v) => [`${v} h`, "Studied"]} />
                <Bar dataKey="hours" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card i={6} className="p-5">
          <CardHeader title="Weekly activity" action={<span className="text-[12px] text-muted">Last 12 weeks</span>} />
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly} margin={{ left: -20, right: 4 }}>
                <defs>
                  <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4f46e5" stopOpacity={0.35} /><stop offset="1" stopColor="#4f46e5" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="week" tick={axis} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tip} />
                <Area type="monotone" dataKey="lessons" name="Lessons" stroke="#4f46e5" strokeWidth={2.5} fill="url(#gl)" />
                <Area type="monotone" dataKey="solved" name="Problems solved" stroke="#a5b4fc" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card i={7} className="p-5">
          <CardHeader title="Monthly activity" action={<span className="text-[12px] font-semibold text-ink-2">{now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>} />
          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted">
            {["M", "T", "W", "T", "F", "S", "S"].map((w, k) => <span key={k}>{w}</span>)}
            {Array.from({ length: offset }, (_, k) => <span key={`e${k}`} />)}
            {Array.from({ length: daysIn }, (_, k) => {
              const iso = toISODate(new Date(y, m, k + 1));
              const min = state.studyLog[iso] ?? 0;
              const lvl = min === 0 ? 0 : Math.min(4, Math.ceil((min / maxMin) * 4));
              const bg = ["bg-surface-2", "bg-primary/20", "bg-primary/45", "bg-primary/70", "bg-primary"][lvl];
              const plannedDay = d.dateMap.get(iso);
              return (
                <span key={iso} title={`${iso}: ${hm(min)}${plannedDay ? ` · Day ${plannedDay}` : ""}`} className={`pop grid aspect-square place-items-center rounded-lg text-[11px] font-semibold ${bg} ${lvl >= 3 ? "text-white" : "text-ink-2"} ${iso === d.todayISO ? "ring-2 ring-primary ring-offset-1 ring-offset-surface" : ""}`} style={st(k * 0.3)}>
                  {k + 1}
                </span>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted">Less {[0, 1, 2, 3, 4].map((l) => <i key={l} className={`h-3 w-3 rounded ${["bg-surface-2", "bg-primary/20", "bg-primary/45", "bg-primary/70", "bg-primary"][l]}`} />)} More</div>
        </Card>

        <Card i={8} className="p-5">
          <CardHeader title="Solved by difficulty" />
          <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-44 w-44 flex-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={diff.map((x) => ({ name: x.name, value: x.solved || 0.0001 }))} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
                    {diff.map((_, k) => <Cell key={k} fill={diffColors[k]} />)}
                  </Pie>
                  <Tooltip contentStyle={tip} formatter={(v) => [Math.round(Number(v)), "Solved"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3">
              {diff.map((x, k) => (
                <div key={x.name}>
                  <div className="flex justify-between text-[13px]"><span className="font-semibold" style={{ color: diffColors[k] }}>{x.name}</span><span className="text-ink-2 tabular-nums">{x.solved} / {x.total}</span></div>
                  <ProgressBar pct={(x.solved / x.total) * 100} className="mt-1.5" color={["bg-green", "bg-amber", "bg-rose"][k]} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card i={9} className="p-5">
          <CardHeader title="Phase completion" />
          <ul className="mt-4 space-y-3">
            {phases.map((ph) => {
              const days = plan.filter((x) => x.phase.id === ph.id);
              const n = days.filter((x) => d.done.has(x.day)).length;
              return (
                <li key={ph.id}>
                  <Link href={`/roadmap#phase-${ph.id}`} className="group block">
                    <div className="flex justify-between text-[13px]"><span className="font-semibold group-hover:text-primary">{ph.id}. {ph.title}</span><span className="text-muted tabular-nums">{n}/{days.length}</span></div>
                    <ProgressBar pct={(n / days.length) * 100} className="mt-1.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card i={10} className="p-5">
            <CardHeader title="Weak topics" />
            {d.weak.length === 0 ? (
              <p className="mt-3 flex items-center gap-2 text-[13.5px] text-muted"><Trophy className="h-4 w-4 text-amber" /> No weak topics yet. Keep solving the scheduled problems.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {d.weak.slice(0, 6).map((w) => (
                  <li key={w.phase.id} className="flex items-center gap-3 rounded-xl border border-amber/25 bg-amber-soft p-3">
                    <AlertTriangle className="h-4 w-4 flex-none text-amber" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold">{w.phase.title}</span>
                      <span className="block text-[12px] text-ink-2">{w.solvedN}/{w.total} scheduled problems solved{w.quizPct !== null ? ` · quiz ${Math.round(w.quizPct * 100)}%` : ""}</span>
                    </span>
                    <Button size="sm" variant="outline" href={`/problems?topic=${w.phase.id}`}>Practise</Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card i={11} className="p-5">
            <div id="revision" className="scroll-mt-24" />
            <CardHeader title="Revision planner" action={<span className="text-[12px] text-muted">Reviews at +{REVISION_GAPS.join(", +")} days</span>} />
            {d.revisionsDue.length === 0 ? (
              <div className="mt-3"><EmptyState icon={<Repeat className="h-5 w-5" />} title="Nothing to revise yet" text="Completed lessons appear here when their next review is due." /></div>
            ) : (
              <ul className="mt-3 space-y-2">
                {d.revisionsDue.slice(0, 8).map((r) => {
                  const due = toISODate(r.due) <= d.todayISO;
                  return (
                    <li key={r.day} className={`flex items-center gap-3 rounded-xl border p-3 ${due ? "border-primary-faint bg-primary-soft/50" : "border-line"}`}>
                      <CalendarClock className={`h-4 w-4 flex-none ${due ? "text-primary" : "text-muted"}`} />
                      <Link href={`/lessons/${r.day}`} className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold">Day {r.day}: {plan[r.day - 1].topic.title}</span>
                        <span className="block text-[12px] text-muted">Review {r.count + 1} of {REVISION_GAPS.length} · {due ? "due now" : `due ${fmtShort(r.due)}`}</span>
                      </Link>
                      {due && <Button size="sm" onClick={() => markRevised(r.day)}>Mark revised</Button>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
