"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Check, ChevronDown, ExternalLink, History, NotebookPen } from "lucide-react";
import type { Problem } from "@/types";
import { useAppState } from "@/lib/store";
import { DiffBadge } from "@/components/ui";

export default function ProblemRow({ p, day, topic, showDay = false }: { p: Problem; day: number; topic?: string; showDay?: boolean }) {
  const { state, toggleSolved, logAttempt, setNote, toggleBookmark } = useAppState();
  const [open, setOpen] = useState(false);
  const solved = state.solved.includes(p.slug);
  const attempts = state.attempts[p.slug] ?? [];
  const note = state.notes[`problem:${p.slug}`]?.text ?? "";
  const bkey = `problem:${p.slug}`;
  const marked = state.bookmarks.includes(bkey);
  const status = solved ? "Solved" : attempts.length ? "Attempted" : "Unsolved";

  return (
    <li className={`rounded-xl border transition-colors ${solved ? "border-green/25 bg-green-soft/40" : "border-line bg-surface"}`}>
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={() => toggleSolved(p.slug)}
          aria-label={solved ? `Mark ${p.title} unsolved` : `Mark ${p.title} solved`}
          aria-pressed={solved}
          className={`press mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full border-2 ${solved ? "border-green bg-green text-white" : "border-line hover:border-green"}`}
        >
          {solved && <Check className="check-pop h-4 w-4" strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <a href={p.url} target="_blank" rel="noopener noreferrer" className={`min-w-0 flex-1 text-[14px] leading-snug font-semibold hover:text-primary ${solved ? "text-ink-2" : "text-ink"}`}>
              {p.title} <ExternalLink className="mb-0.5 inline h-3.5 w-3.5 text-muted" />
            </a>
            <DiffBadge d={p.difficulty} className="mt-0.5 flex-none" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-[12px] text-muted">
              {showDay && <><Link href={`/lessons/${day}`} className="font-semibold text-primary hover:underline">Day {day}</Link> · </>}
              {topic && <>{topic} · </>}
              <span className={solved ? "font-semibold text-green" : attempts.length ? "font-semibold text-amber" : ""}>{status}</span>
              {attempts.length > 0 && <> · {attempts.length} attempt{attempts.length > 1 ? "s" : ""}</>}
              {note && <> · <NotebookPen className="mb-0.5 inline h-3 w-3" /> note</>}
            </p>
            <button onClick={() => toggleBookmark(bkey)} aria-label={marked ? "Remove bookmark" : "Bookmark problem"} aria-pressed={marked} className={`press -my-1 grid h-8 w-8 flex-none place-items-center rounded-lg hover:bg-surface-2 ${marked ? "text-primary" : "text-muted"}`}>
              <Bookmark className={`h-4 w-4 ${marked ? "fill-current" : ""}`} />
            </button>
            <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Notes and attempts" className="press -my-1 grid h-8 w-8 flex-none place-items-center rounded-lg text-muted hover:bg-surface-2">
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>
      <div className="accordion" data-open={open}>
        <div>
          <div className="space-y-3 border-t border-line p-3">
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-2">Pattern note</span>
              <textarea
                value={note}
                onChange={(e) => setNote(`problem:${p.slug}`, e.target.value)}
                rows={2}
                placeholder="e.g. HashMap of value → index; check complement before inserting"
                className="mt-1 w-full resize-y rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-primary"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => logAttempt(p.slug)} className="press inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] font-semibold hover:border-amber hover:text-amber">
                <History className="h-3.5 w-3.5" /> Log an attempt
              </button>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="press inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-white hover:bg-primary-strong">
                Solve on LeetCode <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            {attempts.length > 0 && (
              <ul className="space-y-1 text-[12px] text-muted">
                {[...attempts].reverse().slice(0, 6).map((a, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${a.result === "solved" ? "bg-green" : "bg-amber"}`} />
                    {a.result === "solved" ? "Solved" : "Attempted"} · {new Date(a.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
