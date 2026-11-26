"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckSquare2, Printer, Square } from "lucide-react";
import { phases, plan } from "@/data/curriculum";
import { getContent } from "@/data/content";
import { useAppState } from "@/lib/store";
import { Button, PageHeader } from "@/components/ui";
import Select from "@/components/ui/Select";

/**
 * Printable revision sheets: one page per phase with every topic's key points,
 * complexities, must-solve problems and the learner's own notes.
 * Use the browser's Print → "Save as PDF" to keep a copy.
 */
export default function RevisionPage() {
  return (
    <Suspense>
      <Revision />
    </Suspense>
  );
}

function Revision() {
  const { state } = useAppState();
  const params = useSearchParams();
  const router = useRouter();
  const sel = params.get("phase") ?? "all";
  const shown = sel === "all" ? phases : phases.filter((p) => String(p.id) === sel);
  const solved = useMemo(() => new Set(state.solved), [state.solved]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="print-hide">
        <PageHeader
          title="Revision sheets"
          subtitle="One printable page per phase: key points, complexities, must-solve problems and your notes. Print or save as PDF."
          action={
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print {sel === "all" ? `all ${phases.length} phases` : "this phase"}
            </Button>
          }
        />
        <div className="mb-5 max-w-sm">
          <Select
            value={sel}
            onChange={(v) => router.replace(v === "all" ? "/revision" : `/revision?phase=${v}`, { scroll: false })}
            options={[{ value: "all", label: "All phases" }, ...phases.map((p) => ({ value: String(p.id), label: `Phase ${p.id} · ${p.title}` }))]}
            label="Phase to print"
          />
        </div>
      </div>

      <div className="space-y-6 print:space-y-0">
        {shown.map((ph) => {
          const days = plan.filter((d) => d.phase.id === ph.id);
          const done = days.filter((d) => state.doneDays.includes(d.day)).length;
          const notes = days.map((d) => ({ day: d.day, text: state.notes[`lesson:${d.day}`]?.text?.trim() })).filter((n) => n.text);
          return (
            <article key={ph.id} className="rev-sheet rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-7">
              <header className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-primary pb-2">
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-primary uppercase">Phase {ph.id} · Revision sheet</p>
                  <h2 className="text-[22px] leading-tight font-extrabold tracking-tight">{ph.title}</h2>
                </div>
                <p className="text-[12px] text-muted">
                  Days {days[0]?.day ?? "–"}–{days[days.length - 1]?.day ?? "–"} · {done}/{days.length} done
                </p>
              </header>

              <div className="rev-cols mt-4">
                {ph.topics.map((t) => {
                  const c = getContent(t.id);
                  const points = c?.revision?.length ? c.revision : t.concepts;
                  return (
                    <section key={t.id} className="rev-topic mb-4">
                      <h3 className="text-[14px] font-bold text-ink">{t.title}</h3>
                      {c?.summary && <p className="mt-0.5 text-[12px] text-muted italic">{c.summary}</p>}
                      <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[12.5px] leading-snug text-ink-2">
                        {points.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                      {!!c?.complexity?.length && (
                        <table className="mt-2 w-full text-[11.5px]">
                          <thead>
                            <tr className="text-left text-muted"><th className="font-semibold">Operation</th><th className="font-semibold">Time</th><th className="font-semibold">Space</th></tr>
                          </thead>
                          <tbody>
                            {c.complexity.map((r, i) => (
                              <tr key={i} className="border-t border-line"><td className="py-0.5 pr-2">{r.op}</td><td className="pr-2 font-mono">{r.time}</td><td className="font-mono">{r.space}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {!!c?.mistakes?.length && (
                        <p className="mt-1.5 text-[11.5px] text-rose"><b>Watch out:</b> {c.mistakes.slice(0, 2).join(" · ")}</p>
                      )}
                      {!!t.problems.length && (
                        <ul className="mt-1.5 grid grid-cols-1 gap-x-3 text-[11.5px] sm:grid-cols-2 print:grid-cols-2">
                          {t.problems.map((p) => (
                            <li key={p.slug} className="flex items-center gap-1 truncate">
                              {solved.has(p.slug) ? <CheckSquare2 className="h-3 w-3 flex-none text-green" /> : <Square className="h-3 w-3 flex-none text-muted" />}
                              <span className="truncate">{p.title}</span>
                              <span className="text-muted">({p.difficulty[0]})</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  );
                })}
              </div>

              {notes.length > 0 && (
                <section className="rev-topic mt-2 rounded-xl bg-primary-faint p-3">
                  <h3 className="text-[13px] font-bold">My notes</h3>
                  {notes.map((n) => (
                    <p key={n.day} className="mt-1 text-[12px] whitespace-pre-wrap text-ink-2"><b>Day {n.day}:</b> {n.text}</p>
                  ))}
                </section>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
