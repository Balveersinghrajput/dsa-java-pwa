"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, NotebookPen, Plus, Search, Trash2 } from "lucide-react";
import { plan } from "@/data/curriculum";
import { videos } from "@/data/videos";
import { guideById } from "@/data/articles";
import { useAppState } from "@/lib/store";
import { downloadText } from "@/lib/download";
import { Badge, Button, EmptyState, PageHeader, Segmented, cardCls, st } from "@/components/ui";

const problemIndexNow = () => new Map(plan.flatMap((d) => d.problems.map((p) => [p.slug, { title: p.title, day: d.day }] as const)));

type Kind = "all" | "lesson" | "problem" | "video" | "article" | "free";

function describe(key: string): { kind: Exclude<Kind, "all">; title: string; href?: string } {
  const i = key.indexOf(":");
  const kind = key.slice(0, i) as Exclude<Kind, "all">;
  const id = key.slice(i + 1);
  if (kind === "lesson") return { kind, title: `Day ${id}: ${plan[Number(id) - 1]?.topic.title ?? ""}`, href: `/lessons/${id}?tab=notes` };
  if (kind === "problem") {
    const p = problemIndexNow().get(id);
    return { kind, title: p ? p.title : id, href: p ? `/problems?q=${encodeURIComponent(p.title)}` : undefined };
  }
  if (kind === "video") return { kind, title: videos.find((v) => v.id === id)?.title ?? "Video", href: `/resources/videos/${id}` };
  if (kind === "article") return { kind, title: `${guideById(id)?.title ?? id} — guide`, href: `/resources/articles/${id}` };
  return { kind: "free", title: "Quick note" };
}

export default function NotesPage() {
  const { state, setNote } = useAppState();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind>("all");

  const notes = useMemo(() => {
    const query = q.trim().toLowerCase();
    return Object.entries(state.notes)
      .map(([key, n]) => ({ key, ...n, ...describe(key) }))
      .filter((n) => (kind === "all" || n.kind === kind) && (!query || `${n.title} ${n.text}`.toLowerCase().includes(query)))
      .sort((a, b) => b.updated.localeCompare(a.updated));
  }, [state.notes, q, kind]);

  const addFree = () => {
    const key = `free:${Date.now()}`;
    setNote(key, "New note");
    setKind("all");
    setTimeout(() => document.getElementById(`note-${key}`)?.focus(), 50);
  };

  const exportAll = () => {
    const md = Object.entries(state.notes)
      .map(([key, n]) => `## ${describe(key).title}\n_${new Date(n.updated).toLocaleString()}_\n\n${n.text}\n`)
      .join("\n");
    downloadText("dsa-java-notes.md", `# My DSA in Java notes\n\n${md}`, "text/markdown;charset=utf-8");
  };

  const total = Object.keys(state.notes).length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Notes"
        subtitle={`${total} note${total === 1 ? "" : "s"}, saved on this device and available offline`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportAll} disabled={!total}><Download className="h-4 w-4" /> Export .md</Button>
            <Button onClick={addFree}><Plus className="h-4 w-4" /> New note</Button>
          </div>
        }
      />
      <div className="rise flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center" style={st(1)}>
        <label className="flex h-11 flex-none items-center gap-2.5 rounded-xl border border-line bg-surface px-4 shadow-card focus-within:border-primary md:flex-1">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted" />
        </label>
        <div className="no-scrollbar overflow-x-auto">
          <Segmented options={[{ id: "all", label: "All" }, { id: "lesson", label: "Lessons" }, { id: "problem", label: "Problems" }, { id: "video", label: "Videos" }, { id: "article", label: "Articles" }, { id: "free", label: "Quick" }]} value={kind} onChange={setKind} />
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="mt-6"><EmptyState icon={<NotebookPen className="h-5 w-5" />} title={total ? "No notes match" : "No notes yet"} text="Write notes on lessons, problems, videos and articles — or start a quick note here." action={<Button onClick={addFree}><Plus className="h-4 w-4" /> New note</Button>} /></div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {notes.map((n, k) => (
            <article key={n.key} className={`rise flex flex-col p-4 ${cardCls}`} style={st(Math.min(k, 10) * 0.6)}>
              <div className="flex items-start gap-2">
                <Badge tone={n.kind === "free" ? "muted" : "primary"} className="capitalize">{n.kind === "free" ? "quick" : n.kind}</Badge>
                {n.href ? <Link href={n.href} className="min-w-0 flex-1 truncate text-[13.5px] font-semibold hover:text-primary">{n.title}</Link> : <span className="min-w-0 flex-1 text-[13.5px] font-semibold">{n.title}</span>}
                <button onClick={() => setNote(n.key, "")} aria-label="Delete note" className="press grid h-8 w-8 flex-none place-items-center rounded-lg text-muted hover:bg-rose-soft hover:text-rose"><Trash2 className="h-4 w-4" /></button>
              </div>
              <textarea
                id={`note-${n.key}`}
                value={n.text}
                onChange={(e) => setNote(n.key, e.target.value, true)}
                rows={4}
                className="mt-3 w-full flex-1 resize-y rounded-xl border border-line bg-surface-2 p-3 text-[13.5px] leading-relaxed outline-none focus:border-primary"
              />
              <p className="mt-2 text-[11.5px] text-muted">Edited {new Date(n.updated).toLocaleString()}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
