"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, FileText, Link2, Loader2, PlayCircle, Plus, Trash2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { cleanUrl, hostOf, youTubeId } from "@/lib/links";
import { thumb } from "@/data/videos";
import { api } from "@/lib/api";
import { Bar, Button, Modal, cardCls, st } from "@/components/ui";
import { field } from "@/components/auth/ui";
import YouTubeEmbed from "@/components/resources/YouTubeEmbed";
import type { CustomResource } from "@/types";

/**
 * Videos and articles the learner adds to a day. Paste any YouTube or article link:
 * YouTube links are detected (thumbnail + title) and play here with YouTube's own controls.
 */
export default function MyResources({ dayKey }: { dayKey: string }) {
  const { state, addResource, removeResource, setVideoProgress, toggleVideoDone } = useAppState();
  const list = state.customResources[dayKey] ?? [];
  const videos = list.filter((r) => r.kind === "video");
  const articles = list.filter((r) => r.kind === "article");
  const [playing, setPlaying] = useState<CustomResource | null>(null);
  const [adding, setAdding] = useState(false);

  const onEnd = useCallback(() => {
    if (playing?.videoId && !state.videosDone.includes(playing.videoId)) toggleVideoDone(playing.videoId);
  }, [playing, state.videosDone, toggleVideoDone]);

  return (
    <section className="rounded-2xl border border-dashed border-primary/40 bg-primary-faint/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-bold"><Link2 className="h-4 w-4 text-primary" /> My resources</h3>
          <p className="text-[12.5px] text-muted">Add your own YouTube videos and articles for this day. They sync to your account.</p>
        </div>
        {!adding && <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add link</Button>}
      </div>

      {adding && (
        <AddForm
          onAdd={(r) => {
            addResource(dayKey, r);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
          existing={list.map((x) => x.url)}
        />
      )}

      {videos.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, k) => {
            const p = state.videoProgress[v.videoId!] ?? 0;
            const watched = state.videosDone.includes(v.videoId!);
            return (
              <div key={v.id} className={`rise lift group relative overflow-hidden ${cardCls}`} style={st(k)}>
                <button onClick={() => setPlaying(v)} className="block w-full text-left">
                  <span className="relative block aspect-video overflow-hidden bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb(v.videoId!)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <PlayCircle className="absolute inset-0 m-auto h-12 w-12 text-white drop-shadow transition-transform group-hover:scale-110" />
                    {watched && <span className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-green px-1.5 py-0.5 text-[11px] font-semibold text-white"><CheckCircle2 className="h-3 w-3" /> Watched</span>}
                  </span>
                  <span className="block p-3 pr-10">
                    <span className="line-clamp-2 text-[13.5px] font-semibold">{v.title}</span>
                    <span className="mt-1 block truncate text-[12px] text-muted">{v.channel || "YouTube"}</span>
                  </span>
                </button>
                {p > 0 && !watched && <Bar pct={p * 100} className="absolute inset-x-0 bottom-0 h-1 rounded-none" />}
                <RemoveButton onClick={() => removeResource(dayKey, v.id)} label={v.title} className="bottom-2" />
              </div>
            );
          })}
        </div>
      )}

      {articles.length > 0 && (
        <ul className="mt-4 space-y-2">
          {articles.map((a) => (
            <li key={a.id} className="relative">
              <a href={a.url} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 pr-12 hover:border-primary-faint">
                <FileText className="h-5 w-5 flex-none text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold">{a.title}</span>
                  <span className="block truncate text-[12px] text-muted">{hostOf(a.url)}</span>
                </span>
                <ExternalLink className="h-4 w-4 flex-none text-muted" />
              </a>
              <RemoveButton onClick={() => removeResource(dayKey, a.id)} label={a.title} className="top-1/2 -translate-y-1/2" />
            </li>
          ))}
        </ul>
      )}

      {!list.length && !adding && <p className="mt-3 text-[13px] text-muted">Nothing added yet. Found a great explanation? Save it here so it&apos;s ready when you revise.</p>}

      <Modal open={!!playing} onClose={() => setPlaying(null)} title={playing?.title ?? "Video"} wide>
        {playing?.videoId && (
          <>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              <YouTubeEmbed id={playing.videoId} title={playing.title} onProgress={(p) => setVideoProgress(playing.videoId!, p)} onEnd={onEnd} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <a href={playing.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline">
                Open on YouTube <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <Button size="sm" variant={state.videosDone.includes(playing.videoId) ? "outline" : "primary"} onClick={() => toggleVideoDone(playing.videoId!)}>
                <CheckCircle2 className="h-4 w-4" /> {state.videosDone.includes(playing.videoId) ? "Watched" : "Mark as watched"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}

function RemoveButton({ onClick, label, className }: { onClick: () => void; label: string; className: string }) {
  return (
    <button
      onClick={() => confirm(`Remove "${label}"?`) && onClick()}
      aria-label={`Remove ${label}`}
      className={`press absolute right-2 grid h-8 w-8 place-items-center rounded-lg bg-surface/90 text-muted ring-1 ring-line hover:text-rose ${className}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function AddForm({ onAdd, onCancel, existing }: { onAdd: (r: Omit<CustomResource, "id" | "added">) => void; onCancel: () => void; existing: string[] }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [channel, setChannel] = useState("");
  const [looking, setLooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clean = cleanUrl(url);
  const vid = youTubeId(url);
  const kind: CustomResource["kind"] | null = !url.trim() ? null : vid ? "video" : clean ? "article" : null;

  // Fill in the title automatically (YouTube: real title; article: the site name).
  useEffect(() => {
    setError(null);
    setChannel("");
    if (titleTouched) return;
    if (!vid) {
      setTitle(clean ? hostOf(clean.href) : "");
      return;
    }
    let alive = true;
    setLooking(true);
    const t = setTimeout(() => {
      api(`/api/oembed?id=${vid}`)
        .then(async (r) => {
          const d = (await r.json().catch(() => ({}))) as { title?: string; channel?: string; error?: string };
          if (!alive) return;
          if (r.ok) {
            setTitle(d.title || "YouTube video");
            setChannel(d.channel || "");
          } else {
            setTitle("YouTube video");
            if (r.status === 404) setError(d.error ?? "This video may be private or not embeddable. You can still save it.");
          }
        })
        .catch(() => alive && setTitle("YouTube video")) // offline: still lets you save it
        .finally(() => alive && setLooking(false));
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vid, clean?.href, titleTouched]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clean || !kind) return setError("Paste a valid link starting with https://");
    const finalUrl = vid ? `https://www.youtube.com/watch?v=${vid}` : clean.href;
    if (existing.includes(finalUrl)) return setError("You've already added this link to this day.");
    onAdd({ kind, url: finalUrl, title: (title.trim() || (vid ? "YouTube video" : hostOf(finalUrl))).slice(0, 200), ...(vid ? { videoId: vid, channel } : {}) });
  };

  return (
    <form onSubmit={submit} className="fade mt-4 space-y-3 rounded-xl bg-surface p-4 ring-1 ring-line">
      <label className="block">
        <span className="text-[13px] font-semibold text-ink-2">YouTube or article link</span>
        <input value={url} onChange={(e) => setUrl(e.target.value)} autoFocus inputMode="url" placeholder="https://youtu.be/…  or  https://www.geeksforgeeks.org/…" className={field} />
      </label>

      {kind && (
        <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-2.5">
          {vid ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb(vid)} alt="" className="h-12 w-20 flex-none rounded-lg object-cover" />
          ) : (
            <span className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-primary-soft text-primary"><FileText className="h-5 w-5" /></span>
          )}
          <span className="min-w-0 text-[12.5px]">
            <b className={vid ? "text-rose" : "text-primary"}>{vid ? "YouTube video detected" : "Article link"}</b>
            <span className="block truncate text-muted">{looking ? "Getting the title…" : channel || (clean ? hostOf(clean.href) : "")}</span>
          </span>
        </div>
      )}

      <label className="block">
        <span className="text-[13px] font-semibold text-ink-2">Title</span>
        <span className="relative block">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleTouched(true);
            }}
            maxLength={200}
            placeholder="Give it a name"
            className={field}
          />
          {looking && <Loader2 className="absolute top-1/2 right-3 mt-0.5 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />}
        </span>
      </label>

      {error && <p className="text-[12.5px] text-amber">{error}</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!kind}><Plus className="h-4 w-4" /> Add {kind === "video" ? "video" : kind === "article" ? "article" : "link"}</Button>
      </div>
    </form>
  );
}
