import type { StoredProgress } from "@/app/api/progress/route";

/** Headline numbers from a learner's saved progress (for the admin's friends list). */
export function summarise(p: StoredProgress | null) {
  const s = (p?.state ?? {}) as Record<string, unknown>;
  const arr = (k: string) => (Array.isArray(s[k]) ? (s[k] as unknown[]) : []);
  const obj = (k: string) => (s[k] && typeof s[k] === "object" && !Array.isArray(s[k]) ? (s[k] as Record<string, unknown>) : {});
  const doneAt = Object.values(obj("doneAt")).filter((v): v is string => typeof v === "string").sort();
  const minutes = Object.values(obj("studyLog")).reduce<number>((a, v) => a + (typeof v === "number" ? v : 0), 0);
  const totalDays = arr("planKeys").length || 152;
  return {
    daysDone: arr("doneDays").length,
    totalDays,
    solved: arr("solved").length,
    minutes,
    notes: Object.keys(obj("notes")).length,
    startDate: typeof s.startDate === "string" ? s.startDate : null,
    lastCompleted: doneAt[doneAt.length - 1] ?? null,
    lastSync: p?.savedAt || null,
  };
}
