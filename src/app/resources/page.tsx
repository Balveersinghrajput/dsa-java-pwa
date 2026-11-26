"use client";

import Select from "@/components/ui/Select";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bookmark, CheckCircle2, Download, ExternalLink, Eye, FileText, PlayCircle, Search } from "lucide-react";
import { phases, plan } from "@/data/curriculum";
import { videos, thumb } from "@/data/videos";
import { externalArticles, guides } from "@/data/articles";
import { templates } from "@/data/templates";
import { quickResources } from "@/data/resources";
import { phaseLevel } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import { downloadText } from "@/lib/download";
import { Badge, Button, EmptyState, Modal, PageHeader, Tabs, cardCls, st } from "@/components/ui";
import { highlightJava } from "@/components/lessons/CodeBlock";

type Tab = "videos" | "articles" | "templates" | "links";
const topicPhase = new Map(plan.map((d) => [d.topic.id, d.phase] as const));
const topicTitle = new Map(plan.map((d) => [d.topic.id, d.topic.title] as const));

function Filters({ q, setQ, phase, setPhase, level, setLevel }: { q: string; setQ: (s: string) => void; phase: number | "all"; setPhase: (p: number | "all") => void; level: string; setLevel: (l: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:flex md:flex-row">
      <label className="col-span-2 flex h-11 flex-1 items-center gap-2.5 rounded-xl border border-line bg-surface px-4 shadow-card focus-within:border-primary">
        <Search className="h-4 w-4 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted" />
      </label>
      <Select<number | "all"> label="Topic" className="min-w-0 md:w-56" value={phase} onChange={setPhase} options={[{ value: "all" as const, label: "All topics" }, ...phases.map((p) => ({ value: p.id, label: p.title }))]} />
      <Select<string> label="Difficulty" className="min-w-0 md:w-44" value={level} onChange={setLevel} options={[{ value: "all", label: "All levels" }, { value: "Beginner", label: "Beginner" }, { value: "Intermediate", label: "Intermediate" }, { value: "Advanced", label: "Advanced" }]} />
    </div>
  );
}

function ResourcesInner() {
  const params = useSearchParams();
  const [tab, setTabState] = useState<Tab>((["videos", "articles", "templates", "links"].includes(params.get("tab") ?? "") ? params.get("tab") : "videos") as Tab);
  const setTab = (t: Tab) => {
    setTabState(t);
    window.history.replaceState(null, "", `/resources?tab=${t}`);
  };
  const { state, toggleBookmark } = useAppState();
  const [q, setQ] = useState("");
  const [phase, setPhase] = useState<number | "all">("all");
  const [level, setLevel] = useState("all");
  const [preview, setPreview] = useState<string | null>(params.get("t"));
  const [vidLimit, setVidLimit] = useState(24); // render 24 video cards at a time

  const query = q.trim().toLowerCase();
  const vids = useMemo(
    () =>
      videos.filter((v) => {
        const ph = topicPhase.get(v.topic);
        if (phase !== "all" && ph?.id !== phase) return false;
        if (level !== "all" && ph && phaseLevel(ph.id) !== level) return false;
        return !query || `${v.title} ${v.channel} ${topicTitle.get(v.topic)}`.toLowerCase().includes(query);
      }),
    [query, phase, level],
  );
  const arts = guides.filter((g) => (phase === "all" || g.phase.id === phase) && (level === "all" || phaseLevel(g.phase.id) === level) && (!query || `${g.title} ${g.content.summary}`.toLowerCase().includes(query)));
  const ext = externalArticles.filter((a) => (phase === "all" || a.phase.id === phase) && (level === "all" || phaseLevel(a.phase.id) === level) && (!query || `${a.title} ${a.source} ${a.topic.title}`.toLowerCase().includes(query)));
  const tpl = templates.find((t) => t.id === preview);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Resources" subtitle={`${videos.length} verified videos · ${guides.length} study guides · ${externalArticles.length} external readings · ${templates.length} templates`} />
      <Tabs
        tabs={[
          { id: "videos", label: `Videos (${videos.length})` },
          { id: "articles", label: `Articles (${guides.length + externalArticles.length})` },
          { id: "templates", label: `Templates (${templates.length})` },
          { id: "links", label: "Quick links" },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-5"
      />

      {(tab === "videos" || tab === "articles") && <div className="rise mb-5" style={st(1)}><Filters q={q} setQ={setQ} phase={phase} setPhase={setPhase} level={level} setLevel={setLevel} /></div>}

      <div key={tab} className="fade">
        {tab === "videos" &&
          (vids.length === 0 ? (
            <EmptyState icon={<PlayCircle className="h-5 w-5" />} title="No videos match" text="Try another topic or search." />
          ) : (
            <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {vids.slice(0, vidLimit).map((v, k) => {
                const ph = topicPhase.get(v.topic)!;
                const prog = state.videosDone.includes(v.id) ? 1 : state.videoProgress[v.id] ?? 0;
                const marked = state.bookmarks.includes(`video:${v.id}`);
                return (
                  <article key={v.id} className={`rise lift group relative flex flex-col overflow-hidden ${cardCls}`} style={st(Math.min(k, 12) * 0.5)}>
                    <Link href={`/resources/videos/${v.id}`} className="relative block aspect-video overflow-hidden bg-surface-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb(v.id)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <PlayCircle className="absolute inset-0 m-auto h-12 w-12 scale-90 text-white opacity-0 drop-shadow transition-all group-hover:scale-100 group-hover:opacity-100" />
                      <span className="absolute right-2 bottom-2 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[11px] text-white">{v.duration}</span>
                      {prog >= 1 && <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-green px-1.5 py-0.5 text-[11px] font-bold text-white"><CheckCircle2 className="h-3 w-3" />Watched</span>}
                      {prog > 0 && <span className="absolute inset-x-0 bottom-0 h-1 bg-black/30"><span className="block h-full bg-primary" style={{ width: `${prog * 100}%` }} /></span>}
                    </Link>
                    <div className="flex flex-1 flex-col p-3.5">
                      <Link href={`/resources/videos/${v.id}`} className="line-clamp-2 text-[14px] leading-snug font-semibold hover:text-primary">{v.title}</Link>
                      <p className="mt-1 text-[12px] text-muted">{v.channel}</p>
                      <div className="mt-auto flex items-center gap-1.5 pt-3">
                        <Badge tone="muted">{topicTitle.get(v.topic)?.split(/[,(&:]/)[0].trim()}</Badge>
                        <Badge tone={phaseLevel(ph.id) === "Beginner" ? "green" : phaseLevel(ph.id) === "Intermediate" ? "amber" : "rose"}>{phaseLevel(ph.id)}</Badge>
                        <button onClick={() => toggleBookmark(`video:${v.id}`)} aria-pressed={marked} aria-label={marked ? "Remove bookmark" : "Bookmark video"} className={`press ml-auto grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2 ${marked ? "text-primary" : "text-muted"}`}>
                          <Bookmark className={`h-4 w-4 ${marked ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {vids.length > vidLimit && (
              <button onClick={() => setVidLimit((n) => n + 24)} className="press mt-4 w-full rounded-xl border border-dashed border-line py-3 text-[13.5px] font-semibold text-primary hover:border-primary-faint hover:bg-primary-soft/40">
                Show {Math.min(24, vids.length - vidLimit)} more videos ({vids.length - vidLimit} remaining)
              </button>
            )}
            </>
          ))}

        {tab === "articles" && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-[15px] font-bold">Study guides <span className="font-medium text-muted">· written for this course</span></h2>
              {arts.length === 0 ? <p className="text-[13px] text-muted">No guides match.</p> : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {arts.map((g, k) => {
                    const done = state.articlesDone.includes(g.id);
                    return (
                      <Link key={g.id} href={`/resources/articles/${g.id}`} className={`rise lift group flex flex-col overflow-hidden ${cardCls}`} style={st(Math.min(k, 12) * 0.5)}>
                        <span className="relative block h-28 overflow-hidden bg-gradient-to-br from-[#0b1437] via-[#232a7a] to-[#4f46e5] p-4 text-white">
                          <span className="absolute -right-3 -bottom-8 font-mono text-[96px] leading-none font-bold text-white/10 transition-transform duration-500 group-hover:scale-110">{"{}"}</span>
                          <span className="text-[11px] font-semibold tracking-wide text-white/70 uppercase">Phase {g.phase.id} · {g.phase.short}</span>
                          <span className="mt-1 line-clamp-2 text-[15px] leading-snug font-bold">{g.title}</span>
                          {done && <span className="absolute top-3 right-3 rounded-md bg-green px-1.5 py-0.5 text-[10.5px] font-bold">Read ✓</span>}
                        </span>
                        <span className="flex flex-1 flex-col p-4">
                          <span className="line-clamp-2 text-[13px] text-ink-2">{g.content.summary}</span>
                          <span className="mt-auto flex items-center gap-2 pt-3 text-[12px] text-muted">
                            <FileText className="h-3.5 w-3.5" /> DSA in Java Guide · {g.minutes} min read
                            <Badge tone={phaseLevel(g.phase.id) === "Beginner" ? "green" : phaseLevel(g.phase.id) === "Intermediate" ? "amber" : "rose"} className="ml-auto">{phaseLevel(g.phase.id)}</Badge>
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
            <section>
              <h2 className="mb-3 text-[15px] font-bold">External reading <span className="font-medium text-muted">· opens on the publisher&apos;s site</span></h2>
              {ext.length === 0 ? <p className="text-[13px] text-muted">No external articles match.</p> : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ext.map((a) => (
                    <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className={`lift group flex items-start gap-3 p-4 ${cardCls}`}>
                      <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary-soft text-[13px] font-bold text-primary">{a.source.slice(0, 2)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-[13.5px] font-semibold group-hover:text-primary">{a.title}</span>
                        <span className="mt-1 block text-[12px] text-muted">{a.source} · {a.topic.title}</span>
                      </span>
                      <ExternalLink className="h-4 w-4 flex-none text-muted" />
                    </a>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {tab === "templates" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t, k) => {
              const marked = state.bookmarks.includes(`template:${t.id}`);
              return (
                <article key={t.id} className={`rise lift flex flex-col overflow-hidden ${cardCls}`} style={st(k * 0.6)}>
                  <button onClick={() => setPreview(t.id)} className="relative block h-32 overflow-hidden bg-[#0d1530] p-3 text-left">
                    <pre className="pointer-events-none font-mono text-[9.5px] leading-[1.45] text-[#d4d4d4] opacity-80">{t.language === "java" ? highlightJava(t.content.split("\n").slice(0, 12).join("\n")) : t.content.split("\n").slice(0, 12).join("\n")}</pre>
                    <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1530] to-transparent" />
                  </button>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start gap-2">
                      <h3 className="flex-1 text-[14.5px] font-bold">{t.title}</h3>
                      <button onClick={() => toggleBookmark(`template:${t.id}`)} aria-pressed={marked} aria-label={marked ? "Remove bookmark" : "Bookmark template"} className={`press grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2 ${marked ? "text-primary" : "text-muted"}`}>
                        <Bookmark className={`h-4 w-4 ${marked ? "fill-current" : ""}`} />
                      </button>
                    </div>
                    <p className="mt-1 text-[13px] text-ink-2">{t.description}</p>
                    <div className="mt-auto flex items-center gap-2 pt-4">
                      <Badge tone="muted">{t.category}</Badge>
                      <span className="font-mono text-[11.5px] text-muted">{t.filename}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPreview(t.id)}><Eye className="h-3.5 w-3.5" /> Preview</Button>
                      <Button size="sm" onClick={() => downloadText(t.filename, t.content, t.language === "java" ? "text/x-java;charset=utf-8" : "text/markdown;charset=utf-8")}><Download className="h-3.5 w-3.5" /> Download</Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {tab === "links" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickResources.map((r, k) => (
              <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className={`rise lift flex items-center gap-3 p-4 ${cardCls}`} style={st(k)}>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><ExternalLink className="h-5 w-5" /></span>
                <span><span className="block text-[14px] font-bold">{r.label}</span><span className="block text-[12.5px] text-muted">{r.note}</span></span>
              </a>
            ))}
          </div>
        )}
      </div>

      {tpl && (
        <Modal open={!!tpl} onClose={() => setPreview(null)} title={tpl.title} wide>
          <p className="mb-3 text-[13px] text-muted">{tpl.description}</p>
          <pre className="max-h-[60vh] overflow-auto rounded-xl bg-[#0d1530] p-4 font-mono text-[12.5px] leading-relaxed text-[#d4d4d4]">{tpl.language === "java" ? highlightJava(tpl.content) : tpl.content}</pre>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigator.clipboard?.writeText(tpl.content)}>Copy</Button>
            <Button onClick={() => downloadText(tpl.filename, tpl.content)}><Download className="h-4 w-4" /> Download {tpl.filename}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense>
      <ResourcesInner />
    </Suspense>
  );
}
