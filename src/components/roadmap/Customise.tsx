"use client";

import { useState } from "react";
import Select from "@/components/ui/Select";
import { Plus, Sparkles, Trash2, X } from "lucide-react";
import { phases } from "@/data/curriculum";
import { useAppState } from "@/lib/store";
import { Button, Card } from "@/components/ui";

const input = "mt-1.5 h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[14px] outline-none focus:border-primary focus:bg-surface";

/** Create a topic in an existing or a brand-new phase, with its own concepts. */
export function AddTopicCard() {
  const { state, addTopic, deleteTopic } = useAppState();
  const [phaseId, setPhaseId] = useState<string>(String(phases[phases.length - 1]?.id ?? 0));
  const [newPhase, setNewPhase] = useState("");
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(1);
  const [concepts, setConcepts] = useState<string[]>([""]);
  const [msg, setMsg] = useState<string | null>(null);

  const valid = title.trim().length >= 2 && (phaseId !== "new" || newPhase.trim().length >= 2);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    addTopic({ phaseId: phaseId === "new" ? "new" : Number(phaseId), newPhaseTitle: newPhase, title, days, concepts });
    setMsg(`Added “${title.trim()}” (${days} day${days > 1 ? "s" : ""}). Later days moved back to make room.`);
    setTitle("");
    setConcepts([""]);
    setDays(1);
    setNewPhase("");
  };

  return (
    <Card i={2} className="scroll-mt-24 p-5 sm:p-6">
      <div id="customise" className="-mt-24 pt-24" />
      <h2 className="flex items-center gap-2 text-[16px] font-bold"><Sparkles className="h-5 w-5 text-primary" /> Add your own topic</h2>
      <p className="mt-1 text-[13px] text-muted">Put it in an existing phase or start a new one. It joins your day-by-day plan at the end of that phase.</p>
      <form onSubmit={submit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Phase</span>
          <Select<string> label="Phase" className="mt-1.5" value={phaseId} onChange={setPhaseId} options={[...phases.map((p) => ({ value: String(p.id), label: `Phase ${p.id} · ${p.title}${p.custom ? " (yours)" : ""}` })), { value: "new", label: "+ Create a new phase…" }]} />
        </label>
        {phaseId === "new" ? (
          <label className="block">
            <span className="text-[13px] font-semibold text-ink-2">New phase name</span>
            <input value={newPhase} onChange={(e) => setNewPhase(e.target.value)} maxLength={60} placeholder="e.g. System Design Basics" className={input} required />
          </label>
        ) : <span className="hidden md:block" />}
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Topic title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="e.g. Union-Find practice set" className={input} required />
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold text-ink-2">Days</span>
          <input type="number" min={1} max={10} value={days} onChange={(e) => setDays(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} className={input} />
        </label>
        <div className="md:col-span-2">
          <span className="text-[13px] font-semibold text-ink-2">Concepts</span>
          <p className="text-[12px] text-muted">They&apos;re spread evenly across the topic&apos;s days.</p>
          <ul className="mt-2 space-y-2">
            {concepts.map((c, k) => (
              <li key={k} className="flex gap-2">
                <input
                  value={c}
                  onChange={(e) => setConcepts(concepts.map((x, j) => (j === k ? e.target.value : x)))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setConcepts([...concepts, ""]);
                    }
                  }}
                  maxLength={160}
                  placeholder={`Concept ${k + 1}`}
                  className="h-10 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-[14px] outline-none focus:border-primary"
                />
                <button type="button" onClick={() => setConcepts(concepts.length > 1 ? concepts.filter((_, j) => j !== k) : [""])} aria-label="Remove concept" className="press grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-rose-soft hover:text-rose"><X className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setConcepts([...concepts, ""])} className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"><Plus className="h-3.5 w-3.5" /> Add concept</button>
        </div>
        {msg && <p className="fade rounded-xl border border-green/25 bg-green-soft px-3.5 py-2.5 text-[13px] text-green md:col-span-2" role="status">{msg}</p>}
        <div className="flex justify-end md:col-span-2">
          <Button type="submit" disabled={!valid}><Plus className="h-4 w-4" /> Add topic to my plan</Button>
        </div>
      </form>

      {state.customTopics.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="text-[14px] font-bold">Your topics</h3>
          <ul className="mt-2 space-y-2">
            {state.customTopics.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 text-[13.5px]">
                <span className="min-w-0 flex-1">
                  <b className="block truncate">{t.title}</b>
                  <span className="text-[12px] text-muted">{phases.find((p) => p.id === t.phaseId)?.title} · {t.days} day{t.days > 1 ? "s" : ""} · {t.concepts.length + (state.extraConcepts[t.id]?.length ?? 0)} concepts</span>
                </span>
                <button onClick={() => confirm(`Delete “${t.title}”? Its days are removed from your plan.`) && deleteTopic(t.id)} className="press inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold text-rose hover:bg-rose-soft">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/** Inline "add a concept" for any topic (built-in or custom); learner-added concepts can be removed. */
export function TopicConcepts({ topicId }: { topicId: string }) {
  const { state, addConcept, removeConcept } = useAppState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const extras = state.extraConcepts[topicId] ?? [];
  return (
    <div className="mt-2">
      {extras.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {extras.map((c, k) => (
            <span key={k} className="inline-flex items-center gap-1 rounded-lg bg-primary-soft px-2 py-1 text-[12px] font-medium text-primary">
              {c}
              <button onClick={() => removeConcept(topicId, k)} aria-label={`Remove ${c}`} className="rounded hover:text-rose"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
      {open ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addConcept(topicId, text);
            setText("");
          }}
          className="flex gap-2"
        >
          <input autoFocus value={text} onChange={(e) => setText(e.target.value)} maxLength={160} placeholder="New concept for this topic" className="h-9 flex-1 rounded-lg border border-line bg-surface-2 px-3 text-[13px] outline-none focus:border-primary" />
          <Button size="sm" type="submit" disabled={!text.trim()}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Done</Button>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:underline"><Plus className="h-3.5 w-3.5" /> Add concept</button>
      )}
    </div>
  );
}
