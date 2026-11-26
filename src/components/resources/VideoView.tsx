"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, ExternalLink, ListChecks, NotebookPen, PlayCircle } from "lucide-react";
import { plan } from "@/data/curriculum";
import { videos, thumb } from "@/data/videos";
import { fmtShort } from "@/lib/schedule";
import { phaseLevel, useDerived } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import { Badge, Bar, Button, Card, CardHeader, cardCls } from "@/components/ui";
import ResumablePlayer from "./ResumablePlayer";

export default function VideoView({ id }: { id: string }) {
  const { state, toggleVideoDone, toggleBookmark, setNote } = useAppState();
  const d = useDerived();
  const idx = videos.findIndex((v) => v.id === id);
  const v = videos[idx];
  const next = videos[(idx + 1) % videos.length];
  const prev = videos[(idx - 1 + videos.length) % videos.length];
  const days = plan.filter((x) => x.topic.id === v.topic);
  const topic = days[0]?.topic;
  const phase = days[0]?.phase;
  const done = state.videosDone.includes(v.id);
  const prog = done ? 1 : state.videoProgress[v.id] ?? 0;
  const bkey = `video:${v.id}`;
  const marked = state.bookmarks.includes(bkey);
  const noteKey = `video:${v.id}`;
  const concepts = topic ? Array.from(new Set(days.flatMap((x) => x.concepts))) : [];
  const more = videos.filter((x) => x.topic === v.topic && x.id !== v.id);

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/resources?tab=videos" className="rise inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Video library</Link>
      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <div>
            <ResumablePlayer key={v.id} id={v.id} title={v.title} className={cardCls} onFinished={() => !done && toggleVideoDone(v.id)} />
          </div>

          <Card i={1} className="min-w-0 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              {phase && <Badge>{phase.title}</Badge>}
              {phase && <Badge tone={phaseLevel(phase.id) === "Beginner" ? "green" : phaseLevel(phase.id) === "Intermediate" ? "amber" : "rose"}>{phaseLevel(phase.id)}</Badge>}
              <Badge tone="muted">{v.duration}</Badge>
            </div>
            <h1 className="mt-3 text-[19px] leading-snug font-bold break-words sm:text-[22px]">{v.title}</h1>
            <p className="mt-1 text-[13.5px] text-muted">{v.channel}</p>
            <div className="mt-4 flex items-center gap-3">
              <Bar pct={prog * 100} className="flex-1" />
              <span className="text-[12px] font-semibold text-ink-2 tabular-nums">{Math.round(prog * 100)}% watched</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button className="col-span-2 sm:col-span-1" variant={done ? "outline" : "primary"} onClick={() => toggleVideoDone(v.id)}>
                <CheckCircle2 className={`h-4 w-4 ${done ? "text-green" : ""}`} /> {done ? "Completed · undo" : "Mark as completed"}
              </Button>
              <Button variant="outline" onClick={() => toggleBookmark(bkey)}><Bookmark className={`h-4 w-4 ${marked ? "fill-current text-primary" : ""}`} /> {marked ? "Bookmarked" : "Bookmark"}</Button>
              <Button variant="ghost" href={`https://www.youtube.com/watch?v=${v.id}`} external>Watch on YouTube <ExternalLink className="h-4 w-4" /></Button>
            </div>
            <h2 className="mt-6 text-[15px] font-bold">About this video</h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">
              A {v.duration} lesson from {v.channel}{topic ? <> on <b>{topic.title}</b>. Watch it alongside {days.length > 1 ? `Days ${days[0].day}–${days[days.length - 1].day}` : `Day ${days[0].day}`} of your plan, then practise the concepts below in Java.</> : "."} Content and copyright belong to the creator on YouTube.
            </p>
            {concepts.length > 0 && (
              <>
                <h2 className="mt-5 flex items-center gap-2 text-[15px] font-bold"><ListChecks className="h-4 w-4 text-primary" /> Key learning points</h2>
                <ul className="mt-2 space-y-1.5">
                  {concepts.map((c) => <li key={c} className="flex gap-2.5 text-[13.5px] text-ink-2"><span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />{c}</li>)}
                </ul>
              </>
            )}
          </Card>

          <Card i={2} className="p-5">
            <CardHeader title={<span className="flex items-center gap-2"><NotebookPen className="h-4 w-4 text-primary" /> My notes</span>} />
            <textarea value={state.notes[noteKey]?.text ?? ""} onChange={(e) => setNote(noteKey, e.target.value)} rows={5} placeholder="Timestamps, key ideas, questions to revisit…" className="mt-3 w-full resize-y rounded-xl border border-line bg-surface-2 p-3 text-[13.5px] outline-none focus:border-primary" />
          </Card>
        </div>

        <aside className="space-y-5">
          <Card i={2} className="p-5">
            <CardHeader title="Related lessons" />
            <ul className="mt-3 space-y-2">
              {days.map((x) => (
                <li key={x.day}>
                  <Link href={`/lessons/${x.day}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-primary-faint">
                    <span className={`grid h-9 w-9 place-items-center rounded-lg text-[12px] font-bold ${d.done.has(x.day) ? "bg-primary text-white" : "bg-primary-soft text-primary"}`}>{x.day}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{x.topic.title}</span><span className="block text-[11.5px] text-muted">{fmtShort(d.calendar[x.day - 1])}{x.topic.days > 1 ? ` · part ${x.part}` : ""}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Link href={`/resources/videos/${next.id}`} className={`rise lift group block overflow-hidden ${cardCls}`}>
            <span className="relative block aspect-video overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(next.id)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute top-2 left-2 rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-white">Next video</span>
              <PlayCircle className="absolute inset-0 m-auto h-11 w-11 text-white drop-shadow" />
            </span>
            <span className="block p-3"><span className="line-clamp-2 text-[13.5px] font-semibold">{next.title}</span><span className="mt-0.5 block text-[12px] text-muted">{next.channel} · {next.duration}</span></span>
          </Link>

          {more.length > 0 && (
            <Card className="p-5">
              <CardHeader title="More on this topic" />
              <ul className="mt-3 space-y-2">
                {more.map((m) => (
                  <li key={m.id}>
                    <Link href={`/resources/videos/${m.id}`} className="flex gap-3 rounded-xl p-1.5 hover:bg-surface-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb(m.id)} alt="" className="h-14 w-24 flex-none rounded-lg object-cover" />
                      <span className="min-w-0"><span className="line-clamp-2 text-[12.5px] font-semibold">{m.title}</span><span className="text-[11.5px] text-muted">{m.channel}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" href={`/resources/videos/${prev.id}`}><ArrowLeft className="h-4 w-4" /> Previous</Button>
            <Button variant="outline" size="sm" className="flex-1" href={`/resources/videos/${next.id}`}>Next <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
