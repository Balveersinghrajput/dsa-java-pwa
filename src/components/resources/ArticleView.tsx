"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Bookmark, CheckCircle2, Clock, ExternalLink, Lightbulb, NotebookPen } from "lucide-react";
import { guides } from "@/data/articles";
import { plan } from "@/data/curriculum";
import { phaseLevel } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import { Badge, Button, cardCls } from "@/components/ui";
import CodeBlock from "@/components/lessons/CodeBlock";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "objectives", label: "What you'll learn" },
  { id: "analogy", label: "Real-world analogy" },
  { id: "walkthrough", label: "Step-by-step example" },
  { id: "java", label: "Java implementation" },
  { id: "complexity", label: "Complexity" },
  { id: "mistakes", label: "Common mistakes" },
  { id: "revision", label: "Revision notes" },
  { id: "further", label: "Further reading" },
];

export default function ArticleView({ id }: { id: string }) {
  const { state, toggleArticleDone, toggleBookmark, setNote } = useAppState();
  const idx = guides.findIndex((g) => g.id === id);
  const g = guides[idx];
  const c = g.content;
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("overview");
  const done = state.articlesDone.includes(g.id);
  const bkey = `article:${g.id}`;
  const marked = state.bookmarks.includes(bkey);
  const noteKey = `article:${g.id}`;
  const days = plan.filter((x) => x.topic.id === g.id);
  const webs = g.topic.resources.filter((r) => r.kind === "web");
  const nextG = guides[(idx + 1) % guides.length];

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("article-body");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setProgress(Math.min(1, Math.max(0, -r.top / Math.max(total, 1))));
      let cur = "overview";
      for (const s of SECTIONS) {
        const sec = document.getElementById(s.id);
        if (sec && sec.getBoundingClientRect().top < 140) cur = s.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      {/* reading progress */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
        <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      <Link href="/resources?tab=articles" className="rise inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Articles</Link>

      <header className="rise mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1437] via-[#1f2470] to-[#4f46e5] p-6 text-white sm:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-white/15 px-2.5 py-1 text-[12px] font-semibold">Phase {g.phase.id} · {g.phase.title}</span>
          <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[12px] font-semibold">{phaseLevel(g.phase.id)}</span>
        </div>
        <h1 className="mt-4 max-w-3xl text-[26px] leading-tight font-extrabold tracking-tight sm:text-[36px]">{g.title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] text-white/80">{c.summary}</p>
        <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/70">
          <span>By the DSA in Java course</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {g.minutes} min read</span>
          {days.length > 0 && <Link href={`/lessons/${days[0].day}`} className="underline underline-offset-2 hover:text-white">Lesson: Day {days[0].day}{days.length > 1 ? `–${days[days.length - 1].day}` : ""}</Link>}
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-0.5" aria-label="Table of contents">
            <p className="mb-2 text-[11.5px] font-bold tracking-wide text-muted uppercase">On this page</p>
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={`block rounded-lg border-l-2 px-3 py-1.5 text-[13px] transition-colors ${active === s.id ? "border-primary bg-primary-soft/50 font-semibold text-primary" : "border-transparent text-muted hover:text-ink"}`}>{s.label}</a>
            ))}
            <div className="mt-5 space-y-2 border-t border-line pt-4">
              <Button size="sm" variant={done ? "outline" : "primary"} className="w-full" onClick={() => toggleArticleDone(g.id)}><CheckCircle2 className={`h-4 w-4 ${done ? "text-green" : ""}`} /> {done ? "Completed" : "Mark as completed"}</Button>
              <Button size="sm" variant="outline" className="w-full" onClick={() => toggleBookmark(bkey)}><Bookmark className={`h-4 w-4 ${marked ? "fill-current text-primary" : ""}`} /> {marked ? "Bookmarked" : "Bookmark"}</Button>
            </div>
          </nav>
        </aside>

        <article id="article-body" className="prose-lite min-w-0 max-w-3xl">
          <details className="mb-4 rounded-xl border border-line bg-surface p-3 lg:hidden">
            <summary className="cursor-pointer text-[13px] font-semibold">Table of contents</summary>
            <div className="mt-2 grid grid-cols-2 gap-1">{SECTIONS.map((s) => <a key={s.id} href={`#${s.id}`} className="rounded px-2 py-1 text-[13px] text-primary">{s.label}</a>)}</div>
          </details>

          <h2 id="overview">Overview</h2>
          {c.explanation.map((p) => <p key={p}>{p}</p>)}
          <p className="text-[13.5px]"><b>Prerequisites:</b> {c.prerequisites.join(", ")}.</p>

          <h2 id="objectives">What you&apos;ll learn</h2>
          <ul>{c.objectives.map((o) => <li key={o}>{o}</li>)}</ul>

          <h2 id="analogy">Real-world analogy</h2>
          <div className="not-prose flex gap-3 rounded-2xl border border-amber/25 bg-amber-soft p-5">
            <Lightbulb className="h-6 w-6 flex-none text-amber" />
            <p className="!my-0 text-[15px] leading-relaxed text-ink">{c.analogy}</p>
          </div>

          <h2 id="walkthrough">Step-by-step example</h2>
          <ol className="relative my-4 space-y-4 border-l-2 border-primary-faint pl-6">
            {c.steps.map((s, k) => (
              <li key={s.title} className="relative list-none">
                <span className="absolute top-0.5 -left-[35px] grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-white ring-4 ring-bg">{k + 1}</span>
                <p className="!my-0 font-semibold text-ink">{s.title}</p>
                <p className="!my-0.5">{s.detail}</p>
              </li>
            ))}
          </ol>

          <h2 id="java">Java implementation</h2>
          <div className="space-y-4">{c.code.map((x) => <CodeBlock key={x.title} code={x.java} title={x.title} />)}</div>

          <h2 id="complexity">Complexity</h2>
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-surface-2 text-[12px] text-muted"><tr><th className="px-3 py-2">Operation</th><th className="px-3 py-2">Time</th><th className="px-3 py-2">Space</th></tr></thead>
              <tbody className="divide-y divide-line">{c.complexity.map((x) => <tr key={x.op}><td className="px-3 py-2">{x.op}</td><td className="px-3 py-2 font-mono font-semibold text-primary">{x.time}</td><td className="px-3 py-2 font-mono">{x.space}</td></tr>)}</tbody>
            </table>
          </div>

          <h2 id="mistakes">Common mistakes</h2>
          <div className="rounded-2xl border border-rose/20 bg-rose-soft p-5">
            <p className="!my-0 flex items-center gap-2 font-bold text-rose"><AlertTriangle className="h-4 w-4" /> Watch out for</p>
            <ul className="!mb-0">{c.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
          </div>

          <h2 id="revision">Revision notes</h2>
          <div className="rounded-2xl border border-primary-faint bg-primary-soft/50 p-5">
            <ul className="!my-0">{c.revision.map((r) => <li key={r} className="font-medium text-ink">{r}</li>)}</ul>
          </div>

          <h2 id="further">Further reading</h2>
          <ul>
            {webs.map((r) => <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{r.label} <ExternalLink className="mb-0.5 inline h-3.5 w-3.5" /></a></li>)}
            {days.length > 0 && <li><Link href={`/lessons/${days[0].day}?tab=problems`} className="font-semibold text-primary hover:underline">Practice problems for this topic</Link></li>}
          </ul>

          <section className={`mt-10 p-5 ${cardCls}`}>
            <h3 className="flex items-center gap-2 text-[15px] font-bold"><NotebookPen className="h-4 w-4 text-primary" /> My notes</h3>
            <textarea value={state.notes[noteKey]?.text ?? ""} onChange={(e) => setNote(noteKey, e.target.value)} rows={5} placeholder="Summarise this guide in your own words…" className="mt-3 w-full resize-y rounded-xl border border-line bg-surface-2 p-3 text-[13.5px] outline-none focus:border-primary" />
          </section>

          <div className="mt-6 flex flex-wrap items-center gap-2 lg:hidden">
            <Button variant={done ? "outline" : "primary"} onClick={() => toggleArticleDone(g.id)}><CheckCircle2 className="h-4 w-4" /> {done ? "Completed" : "Mark as completed"}</Button>
            <Button variant="outline" onClick={() => toggleBookmark(bkey)}><Bookmark className={`h-4 w-4 ${marked ? "fill-current" : ""}`} /> {marked ? "Bookmarked" : "Bookmark"}</Button>
          </div>

          <Link href={`/resources/articles/${nextG.id}`} className={`lift mt-8 flex items-center gap-4 p-5 no-underline ${cardCls}`}>
            <span className="min-w-0 flex-1"><span className="block text-[12px] text-muted">Next guide</span><span className="block truncate text-[15px] font-bold text-ink">{nextG.title}</span></span>
            <Badge>{nextG.minutes} min</Badge>
          </Link>
        </article>
      </div>
    </div>
  );
}
