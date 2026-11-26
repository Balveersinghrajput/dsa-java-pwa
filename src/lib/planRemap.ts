import type { AppState } from "@/types";

/**
 * Day numbers shift when a day is split/merged or a topic is added/removed.
 * Progress is stored by day number, so whenever the plan changes we move every
 * day-indexed field from the old numbering (oldKeys) to the new one (newKeys),
 * matching days by their stable key ("topicId#part" or "topicId#part.sub").
 */
export function remapDays(s: AppState, oldKeys: string[], newKeys: string[]): AppState {
  if (oldKeys.length === newKeys.length && oldKeys.every((k, i) => k === newKeys[i])) return s;

  const parent = (k: string) => (/\.\d+$/.test(k) ? k.replace(/\.\d+$/, "") : null);
  const oldIndex = new Map(oldKeys.map((k, i) => [k, i + 1]));
  const oldSubs = (k: string) => oldKeys.filter((x) => x.startsWith(`${k}.`));

  /** Old day number whose data a new key inherits (same key, the day it was split from, or the first part it merges). */
  const sourceOf = (k: string): number | undefined => {
    if (oldIndex.has(k)) return oldIndex.get(k);
    const p = parent(k);
    if (p && oldIndex.has(p)) return oldIndex.get(p);
    const subs = oldSubs(k);
    return subs.length ? oldIndex.get(subs[0]) : undefined;
  };

  const oldDone = new Set(s.doneDays.map((n) => oldKeys[n - 1]).filter(Boolean));
  const isDone = (k: string) => {
    if (oldDone.has(k)) return true;
    const p = parent(k);
    if (p && oldDone.has(p)) return true; // split from a completed day
    const subs = oldSubs(k);
    return subs.length > 0 && subs.every((x) => oldDone.has(x)); // merged: done only if every part was done
  };

  const doneDays: number[] = [];
  const doneAt: AppState["doneAt"] = {};
  const tasks: AppState["tasks"] = {};
  const revisions: AppState["revisions"] = {};
  const oldToNew = new Map<number, number>();

  newKeys.forEach((k, i) => {
    const n = i + 1;
    const src = sourceOf(k);
    if (isDone(k)) {
      doneDays.push(n);
      if (src && s.doneAt[src]) doneAt[n] = s.doneAt[src];
    }
    if (src) {
      if (s.tasks[src]) tasks[n] = s.tasks[src];
      if (s.revisions[src] && isDone(k)) revisions[n] = s.revisions[src];
      if (!oldToNew.has(src)) oldToNew.set(src, n);
    }
  });

  const remapKey = (key: string) => {
    const m = /^lesson:(\d+)$/.exec(key);
    if (!m) return key;
    const n = oldToNew.get(Number(m[1]));
    return n ? `lesson:${n}` : null;
  };
  const notes: AppState["notes"] = {};
  for (const [k, v] of Object.entries(s.notes)) {
    const nk = remapKey(k);
    if (nk) notes[nk] = notes[nk] ? { text: `${notes[nk].text}\n\n${v.text}`, updated: v.updated } : v;
  }
  const bookmarks = Array.from(new Set(s.bookmarks.map(remapKey).filter((x): x is string => !!x)));

  return { ...s, doneDays, doneAt, tasks, revisions, notes, bookmarks, planKeys: newKeys };
}
