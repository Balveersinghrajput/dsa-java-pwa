"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Lock,
  Merge,
  Split,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Lightbulb,
  ListChecks,
  PlayCircle,
  Search,
  Target,
  Timer,
} from "lucide-react";
import { plan } from "@/data/curriculum";
import { videos, thumb } from "@/data/videos";
import { exercises } from "@/data/practice";
import { fmtDate, fmtMinutes } from "@/lib/schedule";
import { level, scheduleTotal, useDerived } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import { Badge, Button, Card, Confetti, EmptyState, Tabs, cardCls, st } from "@/components/ui";
import { TASKS } from "@/components/dashboard/tasks";
import CodeBlock from "./CodeBlock";
import Celebration from "./Celebration";
import ProblemRow from "./ProblemRow";
import MyResources from "./MyResources";
import dynamic from "next/dynamic";
import Select from "@/components/ui/Select";
import { VISUAL_TITLES } from "./visuals/titles";

const VisualHost = dynamic(() => import("./visuals/host"), { ssr: false, loading: () => <div className="skeleton h-64" /> });
import type { TopicContent, VisualKind } from "@/data/content";

type TabId = "lesson" | "explanation" | "code" | "visual" | "problems" | "notes" | "resources";
const TAB_ALIASES: Record<string, TabId> = { lesson: "lesson", explanation: "explanation", code: "code", visual: "visual", visualisation: "visual", problems: "problems", notes: "notes", resources: "resources" };

function Section({ icon, title, children, i = 0 }: { icon: ReactNode; title: string; children: ReactNode; i?: number }) {
  return (
    <section className={`rise p-5 ${cardCls}`} style={st(i)}>
      <h3 className="flex items-center gap-2 text-[15px] font-bold">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">{icon}</span>
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

const List = ({ items, tone = "primary" }: { items: string[]; tone?: "primary" | "amber" }) => (
  <ul className="space-y-2">
    {items.map((x) => (
      <li key={x} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-2">
        <span className={`mt-2 h-1.5 w-1.5 flex-none rounded-full ${tone === "amber" ? "bg-amber" : "bg-primary"}`} />
        {x}
      </li>
    ))}
  </ul>
);

/** Loads a topic's lesson content on demand (keeps the lesson page bundle small). */
function useTopicContent(topicId: string | undefined) {
  const [content, setContent] = useState<TopicContent | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    setContent(undefined);
    if (!topicId) return;
    import("@/data/content").then((m) => alive && setContent(m.getContent(topicId)));
    return () => {
      alive = false;
    };
  }, [topicId]);
  return content;
}

export default function LessonView({ day }: { day: number }) {
  const params = useSearchParams();
  const { state, toggleDay, toggleTask, toggleBookmark, setNote, splitDay } = useAppState();
  const d = useDerived();
  const lesson = plan[day - 1] as (typeof plan)[number] | undefined;
  const content = useTopicContent(lesson?.topic.id);
  // Tabs switch instantly in local state; the URL is updated without a server round trip.
  const [tab, setTabState] = useState<TabId>(TAB_ALIASES[params.get("tab") ?? ""] ?? "lesson");
  const setTab = (t: TabId) => {
    setTabState(t);
    window.history.replaceState(null, "", `/lessons/${day}${t === "lesson" ? "" : `?tab=${t}`}`);
  };
  const [burst, setBurst] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [visual, setVisual] = useState<VisualKind | null>(null);
  const [splitOpen, setSplitOpen] = useState(false);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-[22px] font-bold">Day {day} isn&apos;t in your plan</h1>
        <p className="mt-2 text-muted">Your plan currently has {plan.length} days.</p>
        <Link href="/lessons" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-semibold text-white">All lessons</Link>
      </div>
    );
  }

  const locked = d.isLocked(day);

  const done = state.doneDays.includes(day);
  const tasks = state.tasks[day] ?? [];
  const solvedN = lesson.problems.filter((p) => state.solved.includes(p.slug)).length;
  const bkey = `lesson:${day}`;
  const marked = state.bookmarks.includes(bkey);
  const total = scheduleTotal(state.schedule);
  const topicVideos = videos.filter((v) => v.topic === lesson.topic.id);
  const webs = lesson.topic.resources.filter((r) => r.kind === "web");
  const ytSearch = lesson.topic.resources.filter((r) => r.kind === "video");
  const related = exercises.filter((e) => e.topic === lesson.topic.id);
  const noteKey = `lesson:${day}`;
  const kind: VisualKind | undefined = visual ?? content?.visual;
  const isToday = day === d.today;

  const tabs: { id: TabId; label: string }[] = [
    { id: "lesson", label: "Lesson" },
    { id: "explanation", label: "Explanation" },
    { id: "code", label: "Java Code" },
    { id: "visual", label: "Visualisation" },
    { id: "problems", label: `Practice Problems (${lesson.problems.length})` },
    { id: "notes", label: "Notes" },
    { id: "resources", label: "Resources" },
  ];

  const complete = () => {
    if (!done) {
      setBurst((b) => b + 1);
      setCelebrate(true);
    }
    toggleDay(day);
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* breadcrumb + nav */}
      <div className="rise flex flex-wrap items-center gap-2 text-[13px]" style={st(0)}>
        <Link href="/lessons" className="font-semibold text-muted hover:text-ink">All Lessons</Link>
        <span className="text-muted">/</span>
        <Link href={`/roadmap#phase-${lesson.phase.id}`} className="font-semibold text-muted hover:text-ink">Phase {lesson.phase.id} · {lesson.phase.title}</Link>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" href={day > 1 ? `/lessons/${day - 1}` : undefined} disabled={day <= 1} aria-label="Previous lesson">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Previous</span>
          </Button>
          <Button variant="outline" size="sm" href={day < plan.length ? `/lessons/${day + 1}` : undefined} disabled={day >= plan.length} aria-label="Next lesson">
            <span className="hidden sm:inline">Next</span> <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {locked && (
        <div className="rise mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-amber/30 bg-amber-soft p-4">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-amber text-white"><Lock className="h-5 w-5" /></span>
          <p className="min-w-[200px] flex-1 basis-[60%] text-[13.5px]">
            <b className="block text-ink">Preview mode — Day {day} is locked</b>
            <span className="text-ink-2">You can read everything here, but you can&apos;t complete it until you finish your {d.missed.length} missed days. Next up: Day {d.firstUndone}.</span>
          </p>
          <Button size="sm" className="w-full sm:w-auto" href={`/lessons/${d.firstUndone}`}>Go to Day {d.firstUndone}</Button>
        </div>
      )}

      {/* header card */}
      <Card i={1} className="mt-4 overflow-hidden">
        <div className="relative bg-gradient-to-br from-[#0b1437] via-[#1b1f6b] to-[#4338ca] p-5 text-white sm:p-7">
          <div className="pointer-events-none absolute -top-10 -right-6 font-mono text-[160px] leading-none font-bold text-white/5 select-none">{"{}"}</div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-white/15 px-2.5 py-1 text-[12px] font-bold">Day {day} of {plan.length}</span>
            {isToday && <span className="rounded-lg bg-amber px-2.5 py-1 text-[12px] font-bold text-[#1a1a1a]">Today</span>}
            {done && <span className="rounded-lg bg-green px-2.5 py-1 text-[12px] font-bold">Completed ✓</span>}
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[12px] font-semibold">{level(lesson)}</span>
          </div>
          <h1 className="mt-3 max-w-3xl text-[24px] leading-tight font-extrabold tracking-tight sm:text-[30px]">{lesson.topic.title}</h1>
          <p className="mt-1.5 text-[13.5px] text-white/75">
            {fmtDate(d.calendar[day - 1])} · <Clock className="mb-0.5 inline h-3.5 w-3.5" /> {fmtMinutes(total)}
            {lesson.topic.days > 1 ? ` · Part ${lesson.part} of ${lesson.topic.days}` : ""}
            {lesson.sub ? ` · Split ${lesson.sub.index}/${lesson.sub.of}` : ""} · {solvedN}/{lesson.problems.length} problems solved
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={complete}
              disabled={locked}
              title={locked ? `Finish Day ${d.firstUndone} first` : undefined}
              className={`press relative inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${done ? "bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/20" : "bg-white text-[#1e1b4b] hover:bg-white/90"}`}
            >
              <Confetti burst={burst} />
              {locked ? <><Lock className="h-5 w-5" /> Locked — preview only</> : done ? <><CheckCircle2 className="check-pop h-5 w-5 text-green" /> Completed · undo</> : <><Check className="h-5 w-5" /> Mark lesson complete</>}
            </button>
            <button onClick={() => toggleBookmark(bkey)} aria-pressed={marked} className="press inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-4 text-[14px] font-semibold ring-1 ring-white/20 hover:bg-white/15">
              <Bookmark className={`h-4 w-4 ${marked ? "fill-current" : ""}`} /> {marked ? "Bookmarked" : "Bookmark"}
            </button>
            {lesson.sub ? (
              <button onClick={() => splitDay(`${lesson.topic.id}#${lesson.part}`, 1)} className="press inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-4 text-[14px] font-semibold ring-1 ring-white/20 hover:bg-white/15">
                <Merge className="h-4 w-4" /> Merge back into one day
              </button>
            ) : (
              lesson.concepts.length + lesson.problems.length >= 2 && (
                <div className="relative">
                  <button onClick={() => setSplitOpen((o) => !o)} aria-expanded={splitOpen} className="press inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-4 text-[14px] font-semibold ring-1 ring-white/20 hover:bg-white/15">
                    <Split className="h-4 w-4" /> Split this day
                  </button>
                  {splitOpen && (
                    <div className="scale-in absolute left-0 z-30 mt-2 w-64 rounded-2xl border border-line bg-surface p-2 text-ink shadow-pop">
                      <p className="px-2 py-1.5 text-[12px] text-muted">Too much for one day? Spread these concepts and problems across more days. Later days move back.</p>
                      {[2, 3].map((n) => (
                        <button
                          key={n}
                          onClick={() => {
                            setSplitOpen(false);
                            splitDay(`${lesson.topic.id}#${lesson.part}`, n);
                          }}
                          disabled={lesson.concepts.length + lesson.problems.length < n}
                          className="press flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold hover:bg-primary-soft disabled:opacity-40"
                        >
                          Split into {n} days <span className="text-[12px] font-medium text-muted">Days {day}–{day + n - 1}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
        {/* activity checklist */}
        <div className="grid grid-cols-2 gap-2 p-4 lg:grid-cols-4">
          {TASKS.map((t) => {
            const on = tasks.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggleTask(day, t.id)} disabled={locked} aria-pressed={on} className={`press flex disabled:cursor-not-allowed disabled:opacity-50 items-center gap-2.5 rounded-xl border p-2.5 text-left ${on ? "border-primary-faint bg-primary-soft/50" : "border-line hover:border-primary-faint"}`}>
                <span className={`grid h-5 w-5 flex-none place-items-center rounded-md ${on ? "bg-primary text-white" : "ring-1 ring-line"}`}>{on && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                <span className={`grid h-8 w-8 flex-none place-items-center rounded-lg ${t.tone}`}>{t.icon}</span>
                <span className="min-w-0">
                  <span className={`block truncate text-[12.5px] font-semibold ${on ? "text-muted line-through" : ""}`}>{t.title}</span>
                  <span className="block text-[11.5px] text-muted">{state.schedule[t.id]} min</span>
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Tabs tabs={tabs} value={tab} onChange={setTab} className="sticky top-[calc(56px+env(safe-area-inset-top))] z-20 mt-5 bg-bg/90 backdrop-blur lg:top-[69px]" />

      <div key={tab} className="fade mt-5 space-y-4">
        {/* ---------------- Lesson ---------------- */}
        {tab === "lesson" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <Section icon={<Target className="h-4 w-4" />} title="Learning objectives" i={0}>
                {content ? <List items={content.objectives} /> : <List items={lesson.concepts.length ? lesson.concepts.map((c) => `Understand: ${c}`) : ["Revise and practise this topic"]} />}
              </Section>
              <Section icon={<ListChecks className="h-4 w-4" />} title={`Today's concepts${lesson.topic.days > 1 ? ` (part ${lesson.part})` : ""}`} i={1}>
                {lesson.concepts.length ? (
                  <ol className="space-y-2">
                    {lesson.concepts.map((c, k) => (
                      <li key={c} className="flex gap-3 rounded-xl bg-surface-2 p-3 text-[14px]">
                        <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-[11px] font-bold text-white">{k + 1}</span>
                        {c}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-[14px] text-ink-2">Practice day: revise the concepts from the earlier part(s) of this topic and push through the problems.</p>
                )}
              </Section>
              {content && (
                <div className="rise flex gap-3 rounded-2xl border border-amber/25 bg-amber-soft p-5" style={st(2)}>
                  <Lightbulb className="h-6 w-6 flex-none text-amber" />
                  <div>
                    <p className="text-[13px] font-bold text-amber">Real-world analogy</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink">{content.analogy}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Section icon={<GraduationCap className="h-4 w-4" />} title="Prerequisites" i={1}>
                {content ? <List items={content.prerequisites} /> : <p className="text-[13.5px] text-muted">{lesson.topic.custom ? "Set by you." : "Loading…"}</p>}
              </Section>
              <Section icon={<Timer className="h-4 w-4" />} title="How to spend today" i={2}>
                <ul className="space-y-2 text-[13.5px]">
                  {TASKS.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2">
                      <span>{t.title}</span>
                      <b className="tabular-nums">{state.schedule[t.id]} min</b>
                    </li>
                  ))}
                  <li className="flex items-center justify-between px-3 pt-1 font-bold"><span>Total</span><span>{fmtMinutes(total)}</span></li>
                </ul>
                <p className="mt-3 text-[12.5px] text-muted">Type every snippet yourself. Stuck on a problem for 25 minutes? Watch the explanation, close it, re-code from memory.</p>
              </Section>
              {content && (
                <Section icon={<FileText className="h-4 w-4" />} title="Summary" i={3}>
                  <p className="text-[14px] leading-relaxed text-ink-2">{content.summary}</p>
                  <Button variant="soft" size="sm" className="mt-3" onClick={() => setTab("explanation")}>Read the full explanation <ArrowRight className="h-3.5 w-3.5" /></Button>
                </Section>
              )}
            </div>
          </div>
        )}

        {/* ---------------- Explanation ---------------- */}
        {(tab === "explanation" || tab === "code") && !content && (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title={lesson.topic.custom ? "Your own topic" : "Loading lesson…"}
            text={lesson.topic.custom ? `This is a topic you created. Its concepts are: ${lesson.concepts.join(", ") || "none yet"}. Add concepts or notes to build it out.` : "Fetching the explanation and code."}
          />
        )}
        {tab === "explanation" && content && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <Section icon={<FileText className="h-4 w-4" />} title="Explanation" i={0}>
                <div className="space-y-3">
                  {content.explanation.map((p) => <p key={p} className="text-[14.5px] leading-[1.75] text-ink-2">{p}</p>)}
                </div>
              </Section>
              <Section icon={<ListChecks className="h-4 w-4" />} title="Step-by-step example" i={1}>
                <ol className="relative space-y-4 border-l-2 border-primary-faint pl-5">
                  {content.steps.map((s, k) => (
                    <li key={s.title} className="relative">
                      <span className="absolute top-0 -left-[31px] grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white ring-4 ring-surface">{k + 1}</span>
                      <p className="text-[14px] font-semibold text-ink">{s.title}</p>
                      <p className="mt-0.5 text-[13.5px] text-ink-2">{s.detail}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            </div>
            <div className="space-y-4">
              <Section icon={<Clock className="h-4 w-4" />} title="Complexity" i={1}>
                <div className="overflow-hidden rounded-xl border border-line">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-surface-2 text-[12px] text-muted"><tr><th className="px-3 py-2 font-semibold">Operation</th><th className="px-3 py-2 font-semibold">Time</th><th className="px-3 py-2 font-semibold">Space</th></tr></thead>
                    <tbody className="divide-y divide-line">
                      {content.complexity.map((c) => (
                        <tr key={c.op}><td className="px-3 py-2">{c.op}</td><td className="px-3 py-2 font-mono font-semibold text-primary">{c.time}</td><td className="px-3 py-2 font-mono text-ink-2">{c.space}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
              <div className="rise rounded-2xl border border-rose/20 bg-rose-soft p-5" style={st(2)}>
                <p className="flex items-center gap-2 text-[14px] font-bold text-rose"><AlertTriangle className="h-4 w-4" /> Common mistakes</p>
                <ul className="mt-3 space-y-2">
                  {content.mistakes.map((m) => <li key={m} className="flex gap-2.5 text-[13.5px] text-ink"><span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-rose" />{m}</li>)}
                </ul>
              </div>
              <Section icon={<CheckCircle2 className="h-4 w-4" />} title="Revision notes" i={3}>
                <List items={content.revision} />
              </Section>
            </div>
          </div>
        )}

        {/* ---------------- Code ---------------- */}
        {tab === "code" && content && (
          <div className="space-y-4">
            {content.code.map((c, k) => (
              <div key={c.title} className="rise" style={st(k)}>
                <CodeBlock code={c.java} title={c.title} />
              </div>
            ))}
            <p className="text-[13px] text-muted">Every example here compiles and runs. Open it in the Practice Arena to run it, change it and save your own version.</p>
          </div>
        )}

        {/* ---------------- Visualisation ---------------- */}
        {tab === "visual" && (
          <Card i={0} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[16px] font-bold">{kind ? VISUAL_TITLES[kind] : "Visualisations"}</h3>
              <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-2">
                Explore
                <Select<string> label="Choose a visualiser" size="sm" className="w-60" value={kind ?? ""} onChange={(v) => setVisual(v as VisualKind)} options={[...(kind ? [] : [{ value: "", label: "Choose a visualiser…" }]), ...(Object.keys(VISUAL_TITLES) as VisualKind[]).map((k) => ({ value: k, label: VISUAL_TITLES[k] }))]} />
              </label>
            </div>
            {!content?.visual && !visual && <p className="mt-2 text-[13px] text-muted">This topic is mostly reasoning rather than a data structure, so it has no dedicated animation. Pick any visualiser above to explore related ideas.</p>}
            <div className="mt-5">{kind ? <VisualHost key={kind} kind={kind} /> : null}</div>
          </Card>
        )}

        {/* ---------------- Problems ---------------- */}
        {tab === "problems" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[14px] text-ink-2"><b>{solvedN}</b> of {lesson.problems.length} solved · spend about {state.schedule.practice} minutes</p>
              <Button variant="outline" size="sm" href={`/problems?topic=${lesson.phase.id}`}>All {lesson.phase.short} problems</Button>
            </div>
            {lesson.problems.length ? (
              <ul className="space-y-2">{lesson.problems.map((p) => <ProblemRow key={p.slug} p={p} day={day} />)}</ul>
            ) : (
              <EmptyState icon={<ListChecks className="h-5 w-5" />} title="No new problems today" text="Use the time to re-solve problems from the earlier parts of this topic." />
            )}
            {related.length > 0 && (
              <Card className="p-5">
                <h3 className="text-[15px] font-bold">Also practise in the Java Playground</h3>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {related.map((e) => (
                    <li key={e.id}>
                      <Link href={`/practice?ex=${e.id}`} className="press flex items-center gap-3 rounded-xl border border-line p-3 hover:border-primary-faint">
                        <Badge tone={e.difficulty === "Easy" ? "green" : e.difficulty === "Medium" ? "amber" : "rose"}>{e.difficulty}</Badge>
                        <span className="flex-1 text-[13.5px] font-semibold">{e.title}</span>
                        <ArrowRight className="h-4 w-4 text-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

        {/* ---------------- Notes ---------------- */}
        {tab === "notes" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Card i={0} className="p-5">
              <h3 className="text-[15px] font-bold">My notes for Day {day}</h3>
              <p className="text-[12.5px] text-muted">Saved automatically on this device{state.notes[noteKey] ? ` · last edited ${new Date(state.notes[noteKey].updated).toLocaleString()}` : ""}.</p>
              <textarea
                value={state.notes[noteKey]?.text ?? ""}
                onChange={(e) => setNote(noteKey, e.target.value)}
                rows={12}
                placeholder={"What clicked today?\nWhich edge cases tripped you up?\nOne-line summary of the pattern…"}
                className="mt-3 w-full resize-y rounded-xl border border-line bg-surface-2 p-4 font-mono text-[13.5px] leading-relaxed outline-none focus:border-primary"
              />
            </Card>
            <Card i={1} className="p-5">
              <h3 className="text-[15px] font-bold">Problem notes</h3>
              <ul className="mt-3 space-y-2">
                {lesson.problems.map((p) => (
                  <li key={p.slug} className="rounded-xl bg-surface-2 p-3">
                    <p className="text-[13px] font-semibold">{p.title}</p>
                    <p className="mt-0.5 text-[12.5px] text-muted">{state.notes[`problem:${p.slug}`]?.text || "No note yet — add one from Practice Problems."}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* ---------------- Resources ---------------- */}
        {tab === "resources" && (
          <div className="space-y-5">
            <MyResources dayKey={lesson.key} />
            <section>
              <h3 className="mb-3 text-[15px] font-bold">Videos</h3>
              {topicVideos.length ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {topicVideos.map((v, k) => (
                    <Link key={v.id} href={`/resources/videos/${v.id}`} className={`rise lift group overflow-hidden ${cardCls}`} style={st(k)}>
                      <span className="relative block aspect-video overflow-hidden bg-surface-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb(v.id)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <span className="absolute right-2 bottom-2 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[11px] text-white">{v.duration}</span>
                        <PlayCircle className="absolute inset-0 m-auto h-12 w-12 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
                      </span>
                      <span className="block p-3">
                        <span className="line-clamp-2 text-[13.5px] font-semibold">{v.title}</span>
                        <span className="mt-1 block text-[12px] text-muted">{v.channel}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-muted">No verified video for this topic yet. Use the YouTube searches below.</p>
              )}
            </section>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="p-5">
                <h3 className="text-[15px] font-bold">Read</h3>
                <ul className="mt-3 space-y-2">
                  {content && (
                    <li>
                      <Link href={`/resources/articles/${lesson.topic.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-primary-faint">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="flex-1 text-[13.5px] font-semibold">{lesson.topic.title} — complete guide</span>
                        <ArrowRight className="h-4 w-4 text-muted" />
                      </Link>
                    </li>
                  )}
                  {webs.map((r) => (
                    <li key={r.url}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-primary-faint">
                        <ExternalLink className="h-5 w-5 text-ink-2" />
                        <span className="flex-1 text-[13.5px] font-semibold">{r.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-5">
                <h3 className="text-[15px] font-bold">Search YouTube</h3>
                <p className="text-[12.5px] text-muted">Opens a YouTube search for more explanations of this topic.</p>
                <ul className="mt-3 space-y-2">
                  {ytSearch.map((r) => (
                    <li key={r.url}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-primary-faint">
                        <Search className="h-5 w-5 text-rose" />
                        <span className="flex-1 text-[13.5px] font-semibold">{r.label}</span>
                        <ExternalLink className="h-4 w-4 text-muted" />
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* prev / next footer */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {day > 1 ? (
          <Link href={`/lessons/${day - 1}`} className={`press lift flex items-center gap-3 p-4 ${cardCls}`}>
            <ArrowLeft className="h-5 w-5 text-muted" />
            <span className="min-w-0"><span className="block text-[12px] text-muted">Previous · Day {day - 1}</span><span className="block truncate text-[14px] font-semibold">{plan[day - 2].topic.title}</span></span>
          </Link>
        ) : <span />}
        {day < plan.length && (
          <Link href={`/lessons/${day + 1}`} className={`press lift flex items-center justify-end gap-3 p-4 text-right ${cardCls}`}>
            <span className="min-w-0"><span className="block text-[12px] text-muted">Next · Day {day + 1}</span><span className="block truncate text-[14px] font-semibold">{plan[day].topic.title}</span></span>
            <ArrowRight className="h-5 w-5 text-muted" />
          </Link>
        )}
      </div>
      {celebrate && (
        <Celebration
          day={day}
          // streak/count already include today (state updates before this renders)
          streak={d.streak}
          doneCount={state.doneDays.length}
          onClose={() => setCelebrate(false)}
        />
      )}
    </div>
  );
}
