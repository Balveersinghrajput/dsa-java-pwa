"use client";

import { useMemo, useState } from "react";
import { Save, Sparkles } from "lucide-react";
import { CATEGORIES, guessCategory } from "@/data/categories";
import { cleanUrl } from "@/lib/links";
import { Button } from "@/components/ui";
import Select from "@/components/ui/Select";
import { field } from "@/components/auth/ui";
import type { SavedProblem } from "@/types";

export type ProblemDraft = Omit<SavedProblem, "id" | "created" | "updated" | "favorite"> & { id?: string; favorite?: boolean };

const DIFFS: SavedProblem["difficulty"][] = ["Easy", "Medium", "Hard"];
const STATUSES: { id: SavedProblem["status"]; label: string; cls: string }[] = [
  { id: "solved", label: "✓ Solved", cls: "bg-green text-white" },
  { id: "attempted", label: "… Attempted", cls: "bg-amber text-white" },
  { id: "revisit", label: "↻ Revisit", cls: "bg-rose text-white" },
];
const DIFF_CLS = { Easy: "bg-green text-white", Medium: "bg-amber text-white", Hard: "bg-rose text-white" };

function Pills<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string; cls: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`press h-9 rounded-xl px-3 text-[13px] font-semibold ring-1 transition-colors ${value === o.id ? `${o.cls} ring-transparent` : "bg-surface-2 text-ink-2 ring-line hover:text-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Details for a saved problem: what it is, its type (auto-suggested from the code),
 * difficulty, status, tags, notes, link and complexity. With `withCode` it also
 * takes the code itself (for adding a problem from the Saved page).
 */
export default function ProblemForm({
  initial,
  code: codeProp,
  withCode = false,
  onSave,
  onCancel,
  submitLabel = "Save problem",
}: {
  initial: Partial<ProblemDraft>;
  code?: string;
  withCode?: boolean;
  onSave: (p: ProblemDraft) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [code, setCode] = useState(initial.code ?? codeProp ?? "");
  const finalCode = withCode ? code : (codeProp ?? initial.code ?? "");
  const suggestion = useMemo(() => guessCategory(title, finalCode), [title, finalCode]);
  const [category, setCategory] = useState(initial.category ?? "");
  const [difficulty, setDifficulty] = useState<SavedProblem["difficulty"]>(initial.difficulty ?? "Easy");
  const [status, setStatus] = useState<SavedProblem["status"]>(initial.status ?? "solved");
  const [tags, setTags] = useState((initial.tags ?? []).join(", "));
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [link, setLink] = useState(initial.link ?? "");
  const [time, setTime] = useState(initial.time ?? "");
  const [space, setSpace] = useState(initial.space ?? "");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Give the problem a name.");
    if (!finalCode.trim()) return setError("There's no code to save yet.");
    const url = link.trim() ? cleanUrl(link) : null;
    if (link.trim() && !url) return setError("That link doesn't look right. Use a full https:// address.");
    onSave({
      ...initial,
      title: title.trim().slice(0, 120),
      category: category || suggestion,
      difficulty,
      status,
      tags: Array.from(new Set(tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))).slice(0, 10),
      notes: notes.trim().slice(0, 4000),
      link: url?.href,
      time: time.trim().slice(0, 30) || undefined,
      space: space.trim().slice(0, 30) || undefined,
      code: finalCode,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-[13px] font-semibold text-ink-2">Problem name</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus maxLength={120} placeholder="e.g. Two Sum, Reverse a Linked List" className={field} />
      </label>

      <div>
        <span className="text-[13px] font-semibold text-ink-2">Problem type</span>
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select<string> label="Problem type" className="w-full sm:w-64" value={category || suggestion} onChange={setCategory} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          {!category && (
            <span className="flex items-center gap-1 text-[12px] text-muted">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Suggested from your code. Change it if needed.
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Difficulty</span>
          <Pills label="Difficulty" value={difficulty} onChange={setDifficulty} options={DIFFS.map((d) => ({ id: d, label: d, cls: DIFF_CLS[d] }))} />
        </div>
        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Status</span>
          <Pills label="Status" value={status} onChange={setStatus} options={STATUSES} />
        </div>
      </div>

      <label className="block">
        <span className="text-[13px] font-semibold text-ink-2">About / approach <span className="font-normal text-muted">(optional)</span></span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={4000} placeholder="What the problem asks, the key idea, edge cases to remember…" className={`${field} h-auto py-2.5 leading-relaxed`} />
      </label>

      {withCode && (
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Code</span>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={8} spellCheck={false} placeholder={"public class Main {\n    public static void main(String[] args) {\n    }\n}"} className={`${field} h-auto py-2.5 font-mono text-[12.5px]`} />
        </label>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_110px_110px]">
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Tags <span className="font-normal text-muted">(comma separated)</span></span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="hashmap, interview, amazon" className={field} />
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Time</span>
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="O(n)" className={`${field} font-mono`} />
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Space</span>
          <input value={space} onChange={(e) => setSpace(e.target.value)} placeholder="O(1)" className={`${field} font-mono`} />
        </label>
      </div>

      <label className="block">
        <span className="text-[13px] font-semibold text-ink-2">Problem link <span className="font-normal text-muted">(optional)</span></span>
        <input value={link} onChange={(e) => setLink(e.target.value)} inputMode="url" placeholder="https://leetcode.com/problems/two-sum/" className={field} />
      </label>

      {error && <p className="text-[13px] font-medium text-rose">{error}</p>}
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><Save className="h-4 w-4" /> {submitLabel}</Button>
      </div>
    </form>
  );
}
