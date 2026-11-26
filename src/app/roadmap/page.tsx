"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Flag, Lock, Settings2 } from "lucide-react";
import { phases, plan } from "@/data/curriculum";
import { getContent } from "@/data/content";
import { fmtShort, fmtMinutes } from "@/lib/schedule";
import { phaseLevel, useDerived } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import { Badge, Button, Card, CardHeader, PageHeader, Ring, cardCls, st } from "@/components/ui";
import Journey from "@/components/dashboard/Journey";
import { AddTopicCard, TopicConcepts } from "@/components/roadmap/Customise";

export default function RoadmapPage() {
  const { state } = useAppState();
  const d = useDerived();
  const currentPhase = plan[d.focus - 1].phase.id;
  const [open, setOpen] = useState<Set<number>>(() => new Set([currentPhase]));

  useEffect(() => {
    const m = /^#phase-(\d+)$/.exec(window.location.hash);
    if (m) {
      const id = Number(m[1]);
      setOpen((o) => new Set([...o, id]));
      setTimeout(() => document.getElementById(`phase-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Roadmap"
        subtitle={<>{plan.length} days · {phases.length} phases · expected finish <b className="text-ink">{d.expectedFinish.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</b>{d.missed.length > 0 && <> · <span className="text-rose">{d.missed.length} missed day{d.missed.length > 1 ? "s" : ""}</span></>}</>}
        action={<Button variant="outline" href="/settings"><Settings2 className="h-4 w-4" /> Adjust schedule</Button>}
      />

      <Card i={1} className="p-5">
        <CardHeader title={`Your ${plan.length}-Day Journey`} action={<span className="text-[13px] font-semibold text-muted">{state.doneDays.length}/{plan.length} days · {d.pct.toFixed(1)}%</span>} />
        <div className="no-scrollbar -mx-5 mt-2 overflow-x-auto px-5"><div className="min-w-[620px]"><Journey d={d} /></div></div>
      </Card>

      <div className="mt-6"><AddTopicCard /></div>

      <div className="relative mt-6 space-y-3 pl-6 sm:pl-8">
        <span className="absolute top-2 bottom-2 left-[11px] w-0.5 rounded-full bg-line sm:left-[15px]" />
        {phases.map((ph, pi) => {
          const days = plan.filter((x) => x.phase.id === ph.id);
          const doneN = days.filter((x) => d.done.has(x.day)).length;
          const pct = (doneN / days.length) * 100;
          const isOpen = open.has(ph.id);
          const complete = doneN === days.length;
          const current = ph.id === currentPhase;
          const minutes = days.length * d.dayMinutes;
          return (
            <section key={ph.id} id={`phase-${ph.id}`} className="rise relative scroll-mt-24" style={st(Math.min(pi, 10) + 2)}>
              <span className={`absolute top-6 -left-6 grid h-6 w-6 place-items-center rounded-full ring-4 ring-bg sm:-left-8 sm:h-8 sm:w-8 ${complete ? "bg-primary text-white" : current ? "bg-primary-soft text-primary ring-primary-faint" : "bg-surface text-muted ring-line"}`}>
                {complete ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : current ? <Flag className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">{ph.id}</span>}
              </span>
              <div className={`overflow-hidden ${cardCls} ${current ? "ring-2 ring-primary-faint" : ""}`}>
                <button onClick={() => setOpen((o) => { const n = new Set(o); if (n.has(ph.id)) n.delete(ph.id); else n.add(ph.id); return n; })} aria-expanded={isOpen} className="flex w-full items-center gap-4 p-4 text-left hover:bg-surface-2/60 sm:p-5">
                  <Ring pct={pct} size={52} stroke={5}><span className="text-[11px] font-bold tabular-nums">{Math.round(pct)}%</span></Ring>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[16px] font-bold">Phase {ph.id} · {ph.title}</span>
                      {ph.custom && <Badge tone="primary">Yours</Badge>}
                      {current && <Badge>Current</Badge>}
                      {!ph.custom && <Badge tone="muted">{phaseLevel(ph.id)}</Badge>}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-muted">
                      {ph.topics.length} topics · {days.length} days · {fmtShort(d.calendar[days[0].day - 1])} – {fmtShort(d.calendar[days[days.length - 1].day - 1])} · {fmtMinutes(minutes)} · {doneN}/{days.length} done
                    </span>
                  </span>
                  <ChevronDown className={`h-5 w-5 flex-none text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className="accordion" data-open={isOpen}>
                  <div>
                    <div className="space-y-4 border-t border-line p-4 sm:p-5">
                      {ph.topics.map((t) => {
                        const tdays = days.filter((x) => x.topic.id === t.id);
                        const c = getContent(t.id);
                        return (
                          <div key={t.id}>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <h4 className="text-[14.5px] font-bold">{t.title}</h4>
                              <span className="text-[12px] text-muted">{t.days} day{t.days > 1 ? "s" : ""} · {t.problems.length} problems</span>
                            </div>
                            {c && <p className="mt-0.5 text-[12.5px] text-muted">{c.summary}</p>}
                            {t.custom && t.concepts.length > 0 && <p className="mt-0.5 text-[12.5px] text-muted">{t.concepts.join(" · ")}</p>}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {tdays.map((x) => {
                                const done = d.done.has(x.day);
                                const today = x.day === d.today;
                                const locked = d.isLocked(x.day);
                                return (
                                  <Link key={x.day} href={`/lessons/${x.day}`} className={`press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold ${done ? "bg-primary text-white" : today ? "bg-primary-soft text-primary ring-1 ring-primary" : x.day < d.today ? "bg-rose-soft text-rose" : "bg-surface-2 text-ink-2 ring-1 ring-line hover:ring-primary-faint"}`}>
                                    {done && <Check className="h-3 w-3" strokeWidth={3} />}{locked && <Lock className="h-3 w-3" />}Day {x.day}{x.sub ? ` (${x.sub.index}/${x.sub.of})` : ""} · {fmtShort(d.calendar[x.day - 1])}
                                  </Link>
                                );
                              })}
                            </div>
                            <TopicConcepts topicId={t.id} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
