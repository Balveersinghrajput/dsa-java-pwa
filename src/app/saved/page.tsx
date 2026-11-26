"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Code2, Copy, CopyPlus, Download, ExternalLink, FileCode2, LayoutList, Pencil, Play, Plus, Rows3, Search, Star, Trash2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { downloadText } from "@/lib/download";
import { categoryTone } from "@/data/categories";
import { highlightJava } from "@/components/lessons/CodeBlock";
import { Badge, Button, EmptyState, Modal, PageHeader, cardCls, st } from "@/components/ui";
import Select from "@/components/ui/Select";
import ProblemForm, { type ProblemDraft } from "@/components/saved/ProblemForm";
import type { SavedProblem } from "@/types";

type Sort = "updated" | "created" | "title" | "difficulty";
const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 };
const DIFF_TONE = { Easy: "green", Medium: "amber", Hard: "rose" } as const;
const STATUS = {
  solved: { label: "Solved", tone: "green" },
  attempted: { label: "Attempted", tone: "amber" },
  revisit: { label: "Revisit", tone: "rose" },
} as const;
const date = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** Library of problems saved from the Practice Arena: search, filter, open, edit and export. */
export default function SavedPage() {
  const { state, saveProblem, deleteProblem, toggleFavoriteProblem } = useAppState();
  const all = state.savedProblems;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [diff, setDiff] = useState<"all" | SavedProblem["difficulty"]>("all");
  const [status, setStatus] = useState<"all" | SavedProblem["status"] | "favorite">("all");
  const [sort, setSort] = useState<Sort>("updated");
  const [grouped, setGrouped] = useState(false);
  const [editing, setEditing] = useState<SavedProblem | "new" | null>(null);

  const counts = useMemo(() => {
    const byCat = new Map<string, number>();
    for (const p of all) byCat.set(p.category, (byCat.get(p.category) ?? 0) + 1);
    return {
      byCat: [...byCat.entries()].sort((a, b) => b[1] - a[1]),
      solved: all.filter((p) => p.status === "solved").length,
      revisit: all.filter((p) => p.status === "revisit").length,
      favorite: all.filter((p) => p.favorite).length,
    };
  }, [all]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = all.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (diff === "all" || p.difficulty === diff) &&
        (status === "all" || (status === "favorite" ? p.favorite : p.status === status)) &&
        (!needle || [p.title, p.notes, p.category, p.tags.join(" "), p.code].some((t) => t.toLowerCase().includes(needle))),
    );
    const by: Record<Sort, (a: SavedProblem, b: SavedProblem) => number> = {
      updated: (a, b) => b.updated.localeCompare(a.updated),
      created: (a, b) => b.created.localeCompare(a.created),
      title: (a, b) => a.title.localeCompare(b.title),
      difficulty: (a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty] || a.title.localeCompare(b.title),
    };
    return out.sort((a, b) => Number(b.favorite) - Number(a.favorite) || by[sort](a, b));
  }, [all, q, cat, diff, status, sort]);

  const groups = useMemo(() => {
    const m = new Map<string, SavedProblem[]>();
    for (const p of list) m.set(p.category, [...(m.get(p.category) ?? []), p]);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [list]);

  const exportAll = () => {
    const md = [
      `# My saved DSA problems (${list.length})`,
      "",
      ...list.flatMap((p) => [
        `## ${p.title}`,
        "",
        `**Type:** ${p.category} · **Difficulty:** ${p.difficulty} · **Status:** ${STATUS[p.status].label}${p.time ? ` · **Time:** ${p.time}` : ""}${p.space ? ` · **Space:** ${p.space}` : ""}`,
        ...(p.tags.length ? [`**Tags:** ${p.tags.join(", ")}`] : []),
        ...(p.link ? [`**Link:** ${p.link}`] : []),
        "",
        ...(p.notes ? [p.notes, ""] : []),
        "```java",
        p.code,
        "```",
        "",
      ]),
    ].join("\n");
    downloadText(`saved-problems-${new Date().toISOString().slice(0, 10)}.md`, md, "text/markdown;charset=utf-8");
  };

  const onSave = (d: ProblemDraft) => {
    saveProblem(d);
    setEditing(null);
  };
  const filtersOn = cat !== "all" || diff !== "all" || status !== "all" || q;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Saved problems"
        subtitle="Your solutions from the Practice Arena, organised by problem type. Open any one to run or improve it."
        action={
          <div className="flex w-full gap-2 sm:w-auto">
            {all.length > 0 && <Button variant="outline" className="flex-1 sm:flex-none" onClick={exportAll}><Download className="h-4 w-4" /> Export</Button>}
            <Button className="flex-1 sm:flex-none" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New problem</Button>
          </div>
        }
      />

      {all.length === 0 ? (
        <EmptyState
          icon={<FileCode2 className="h-6 w-6" />}
          title="Nothing saved yet"
          text="Solve something in the Practice Arena and press Save. You'll name it, pick its type and add notes, and it shows up here."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button href="/practice"><Play className="h-4 w-4" /> Open Practice Arena</Button>
              <Button variant="outline" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> Paste a solution</Button>
            </div>
          }
        />
      ) : (
        <>
          {/* quick stats (also filters) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { id: "all", label: "Saved", value: all.length, cls: "text-primary" },
              { id: "solved", label: "Solved", value: counts.solved, cls: "text-green" },
              { id: "revisit", label: "To revisit", value: counts.revisit, cls: "text-rose" },
              { id: "favorite", label: "Favourites", value: counts.favorite, cls: "text-amber" },
            ].map((x, i) => (
              <button
                key={x.id}
                onClick={() => setStatus(x.id as typeof status)}
                className={`rise lift press p-4 text-left ${cardCls} ${status === x.id ? "ring-2 ring-primary" : ""}`}
                style={st(i)}
              >
                <p className={`text-[24px] font-extrabold ${x.cls}`}>{x.value}</p>
                <p className="text-[12.5px] font-semibold text-muted">{x.label}</p>
              </button>
            ))}
          </div>

          {/* search + filters */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search names, notes, tags or code…" className="h-11 w-full rounded-xl border border-line bg-surface pr-3 pl-10 text-[14px] outline-none focus:border-primary" />
            </label>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Select<string> label="Difficulty" size="sm" className="sm:w-36" value={diff} onChange={(v) => setDiff(v as typeof diff)} options={[{ value: "all", label: "All levels" }, { value: "Easy", label: "Easy" }, { value: "Medium", label: "Medium" }, { value: "Hard", label: "Hard" }]} />
              <Select<string> label="Sort" size="sm" className="sm:w-44" value={sort} onChange={(v) => setSort(v as Sort)} options={[{ value: "updated", label: "Recently updated" }, { value: "created", label: "Newest first" }, { value: "title", label: "Name A–Z" }, { value: "difficulty", label: "Easy → Hard" }]} />
            </div>
            <button onClick={() => setGrouped((g) => !g)} aria-pressed={grouped} title={grouped ? "Show as one list" : "Group by problem type"} className="press hidden h-11 w-11 flex-none place-items-center rounded-xl border border-line text-ink-2 hover:bg-surface sm:grid">
              {grouped ? <LayoutList className="h-5 w-5" /> : <Rows3 className="h-5 w-5" />}
            </button>
          </div>

          {/* problem types */}
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>All types <span className="opacity-70">{all.length}</span></Chip>
            {counts.byCat.map(([c, n]) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? "all" : c)}>{c} <span className="opacity-70">{n}</span></Chip>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-[12.5px] text-muted">
            <span>{list.length} problem{list.length === 1 ? "" : "s"}</span>
            {filtersOn && <button onClick={() => { setQ(""); setCat("all"); setDiff("all"); setStatus("all"); }} className="font-semibold text-primary hover:underline">Clear filters</button>}
          </div>

          {list.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-[13.5px] text-muted">No saved problems match these filters.</p>
          ) : grouped ? (
            <div className="mt-3 space-y-6">
              {groups.map(([c, items]) => (
                <section key={c}>
                  <h2 className="mb-2 flex items-center gap-2 text-[15px] font-bold">{c} <span className="text-[12.5px] font-semibold text-muted">{items.length}</span></h2>
                  <div className="space-y-3">{items.map((p, i) => <ProblemCard key={p.id} p={p} i={i} onEdit={() => setEditing(p)} onDelete={() => deleteProblem(p.id)} onFavorite={() => toggleFavoriteProblem(p.id)} onDuplicate={() => saveProblem({ ...p, id: undefined, title: `${p.title} (copy)`, favorite: false })} />)}</div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {list.map((p, i) => <ProblemCard key={p.id} p={p} i={i} onEdit={() => setEditing(p)} onDelete={() => deleteProblem(p.id)} onFavorite={() => toggleFavoriteProblem(p.id)} onDuplicate={() => saveProblem({ ...p, id: undefined, title: `${p.title} (copy)`, favorite: false })} />)}
            </div>
          )}
        </>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "New saved problem" : "Edit problem"} wide>
        {editing && (
          <ProblemForm
            initial={editing === "new" ? { status: "solved", tags: [] } : editing}
            withCode
            onSave={onSave}
            onCancel={() => setEditing(null)}
            submitLabel={editing === "new" ? "Save problem" : "Save changes"}
          />
        )}
      </Modal>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={`press h-9 flex-none rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap ring-1 transition-colors ${active ? "bg-primary text-white ring-primary" : "bg-surface text-ink-2 ring-line hover:text-ink"}`}>
      {children}
    </button>
  );
}

function ProblemCard({ p, i, onEdit, onDelete, onFavorite, onDuplicate }: { p: SavedProblem; i: number; onEdit: () => void; onDelete: () => void; onFavorite: () => void; onDuplicate: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(p.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const tool = "press inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink";

  return (
    <article className={`rise min-w-0 p-4 sm:p-5 ${cardCls}`} style={st(Math.min(i, 8))}>
      <div className="flex items-start gap-3">
        <button onClick={onFavorite} aria-label={p.favorite ? "Remove from favourites" : "Add to favourites"} aria-pressed={p.favorite} className="press -mt-0.5 -ml-1 grid h-9 w-9 flex-none place-items-center rounded-xl hover:bg-surface-2">
          <Star className={`h-5 w-5 transition-colors ${p.favorite ? "fill-amber text-amber" : "text-muted"}`} />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] leading-snug font-bold break-words">{p.title}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone={categoryTone(p.category)}>{p.category}</Badge>
            <Badge tone={DIFF_TONE[p.difficulty]}>{p.difficulty}</Badge>
            <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
            {p.time && <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-ink-2 ring-1 ring-line">T {p.time}</span>}
            {p.space && <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-ink-2 ring-1 ring-line">S {p.space}</span>}
          </div>
          {p.notes && <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed whitespace-pre-line text-ink-2">{p.notes}</p>}
          {p.tags.length > 0 && <p className="mt-2 flex flex-wrap gap-1.5">{p.tags.map((t) => <span key={t} className="text-[12px] font-medium text-primary">#{t}</span>)}</p>}
          <p className="mt-2 text-[11.5px] text-muted">Updated {date(p.updated)} · {p.code.split("\n").length} lines</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-3">
        <Button size="sm" href={`/practice?saved=${p.id}`}><Play className="h-4 w-4" /> Open &amp; run</Button>
        <button className={tool} onClick={() => setOpen((o) => !o)} aria-expanded={open}><Code2 className="h-4 w-4" /> Code <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} /></button>
        <button className={tool} onClick={onEdit}><Pencil className="h-4 w-4" /> Edit</button>
        <button className={tool} onClick={copy}>{copied ? <Check className="h-4 w-4 text-green" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}</button>
        <button className={tool} onClick={onDuplicate} title="Make a copy to try another approach"><CopyPlus className="h-4 w-4" /> Duplicate</button>
        {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className={tool}><ExternalLink className="h-4 w-4" /> Problem</a>}
        <button className={`${tool} ml-auto hover:text-rose`} onClick={() => confirm(`Delete "${p.title}"? This can't be undone.`) && onDelete()} aria-label={`Delete ${p.title}`}><Trash2 className="h-4 w-4" /></button>
      </div>

      {open && (
        <pre className="fade mt-3 max-h-[420px] overflow-auto rounded-xl bg-[#0d1530] p-4 font-mono text-[12.5px] leading-relaxed text-[#d4d4d4]"><code>{highlightJava(p.code)}</code></pre>
      )}
    </article>
  );
}
