"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { idbGet, idbSet } from "./db";
import { defaultRestDays, leaveBalance, toISODate } from "./schedule";
import type { AppState, Attempt, MockInterview, QuizResult, Schedule, TaskId } from "@/types";
import { derive, type Derived } from "./derive";
import { applyPlanConfig, planKeysFor, type PlanConfig } from "@/data/curriculum";
import { remapDays } from "./planRemap";

const KEY = "state";
const LEGACY_KEY = "dsa-java-progress-v1";

export const DEFAULT_SCHEDULE: Schedule = { learn: 90, implement: 30, practice: 90, revise: 15 };

export const freshState = (): AppState => ({
  version: 2,
  name: "Learner",
  startDate: toISODate(new Date()),
  perWeek: 6,
  schedule: { ...DEFAULT_SCHEDULE },
  doneDays: [],
  doneAt: {},
  tasks: {},
  solved: [],
  attempts: {},
  notes: {},
  bookmarks: [],
  videoProgress: {},
  videosDone: [],
  articlesDone: [],
  solutions: {},
  revisions: {},
  studyLog: {},
  quizResults: [],
  interviews: [],
  reminder: { enabled: false, time: "19:00" },
  timer: { startedAt: null, elapsedMs: 0, day: toISODate(new Date()) },
  customPhases: [],
  customTopics: [],
  extraConcepts: {},
  splits: {},
  restDays: [0],
  leaves: [],
  autoLeave: false,
  targetDate: null,
  planKeys: [],
});

const cfgOf = (s: AppState): PlanConfig => ({ customPhases: s.customPhases, customTopics: s.customTopics, extraConcepts: s.extraConcepts, splits: s.splits });

/** Applies a plan change and moves day-indexed progress to the new day numbers. */
function withPlan(s: AppState, next: AppState): AppState {
  const oldKeys = s.planKeys.length ? s.planKeys : planKeysFor(cfgOf(s));
  return remapDays(next, oldKeys, planKeysFor(cfgOf(next)));
}

/** Accepts anything that looks like saved state and fills in missing fields. */
export function normalise(raw: unknown): AppState {
  const base = freshState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<AppState>;
  const notes: AppState["notes"] = {};
  for (const [k, v] of Object.entries((r.notes ?? {}) as Record<string, unknown>)) {
    if (typeof v === "string") {
      if (v.trim()) notes[k.includes(":") ? k : `problem:${k}`] = { text: v, updated: new Date().toISOString() };
    } else if (v && typeof v === "object" && "text" in v) notes[k] = v as AppState["notes"][string];
  }
  const merged = {
    ...base,
    ...r,
    version: 2,
    schedule: { ...base.schedule, ...(r.schedule ?? {}) },
    reminder: { ...base.reminder, ...(r.reminder ?? {}) },
    timer: { ...base.timer, ...(r.timer ?? {}) },
    restDays: Array.isArray(r.restDays) ? r.restDays : defaultRestDays((r.perWeek ?? base.perWeek) as AppState["perWeek"]),
    notes,
  } as AppState;
  // Bring progress up to date with the current plan (e.g. after a curriculum update).
  const keys = planKeysFor(cfgOf(merged));
  return merged.planKeys.length ? remapDays(merged, merged.planKeys, keys) : { ...merged, planKeys: keys };
}

async function load(): Promise<AppState> {
  try {
    const saved = await idbGet<AppState>(KEY);
    if (saved) return normalise(saved);
  } catch {
    /* IndexedDB blocked: fall back to localStorage below */
  }
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return normalise(JSON.parse(legacy));
    const backup = localStorage.getItem("dsa-java-state");
    if (backup) return normalise(JSON.parse(backup));
  } catch {
    /* ignore */
  }
  return freshState();
}

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

function useStoreValue() {
  const [state, setState] = useState<AppState | null>(null);

  const [saveError, setSaveError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    load().then(setState);
  }, []);

  // Debounced persistence to IndexedDB (localStorage as a fallback copy).
  useEffect(() => {
    if (!state) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      idbSet(KEY, state)
        .then(() => setSaveError(false))
        .catch(() => {
          try {
            localStorage.setItem("dsa-java-state", JSON.stringify(state));
            setSaveError(false);
          } catch {
            setSaveError(true);
          }
        });
    }, 250);
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => (s ? fn(s) : s)), []);

  const actions = useMemo(
    () => ({
      update,
      replace: (s: AppState) => setState(normalise(s)),
      reset: () => setState(freshState()),

      /** Manual only: lessons are never completed automatically. Study time comes from the timer. */
      toggleDay: (day: number) =>
        update((s) => {
          const done = s.doneDays.includes(day);
          const doneAt = { ...s.doneAt };
          if (done) delete doneAt[day];
          else doneAt[day] = toISODate(new Date());
          return { ...s, doneDays: toggle(s.doneDays, day), doneAt };
        }),

      /* ---------- study timer ---------- */
      startTimer: () =>
        update((s) => (s.timer.startedAt ? s : { ...s, timer: { ...s.timer, startedAt: Date.now(), day: s.timer.elapsedMs ? s.timer.day : toISODate(new Date()) } })),
      stopTimer: () =>
        update((s) => (s.timer.startedAt ? { ...s, timer: { ...s.timer, startedAt: null, elapsedMs: s.timer.elapsedMs + (Date.now() - s.timer.startedAt) } } : s)),
      /** Ends the study day: banks the timer into the study log and resets it. */
      endDay: () =>
        update((s) => {
          const ms = s.timer.elapsedMs + (s.timer.startedAt ? Date.now() - s.timer.startedAt : 0);
          const minutes = Math.round(ms / 60000);
          const day = s.timer.day || toISODate(new Date());
          const studyLog = minutes > 0 ? { ...s.studyLog, [day]: (s.studyLog[day] ?? 0) + minutes } : s.studyLog;
          return { ...s, studyLog, timer: { startedAt: null, elapsedMs: 0, day: toISODate(new Date()) } };
        }),

      toggleTask: (day: number, task: TaskId) =>
        update((s) => ({ ...s, tasks: { ...s.tasks, [day]: toggle(s.tasks[day] ?? [], task) } })),

      toggleSolved: (slug: string) =>
        update((s) => {
          const solved = s.solved.includes(slug);
          const attempt: Attempt = { at: new Date().toISOString(), result: "solved" };
          return {
            ...s,
            solved: toggle(s.solved, slug),
            attempts: solved ? s.attempts : { ...s.attempts, [slug]: [...(s.attempts[slug] ?? []), attempt] },
          };
        }),

      logAttempt: (slug: string) =>
        update((s) => ({
          ...s,
          attempts: { ...s.attempts, [slug]: [...(s.attempts[slug] ?? []), { at: new Date().toISOString(), result: "attempted" }] },
        })),

      /** Empty text deletes the note unless keep is true (used while editing on the Notes page). */
      setNote: (key: string, text: string, keep = false) =>
        update((s) => {
          const notes = { ...s.notes };
          if (text.trim() || keep) notes[key] = { text, updated: new Date().toISOString() };
          else delete notes[key];
          return { ...s, notes };
        }),

      toggleBookmark: (key: string) => update((s) => ({ ...s, bookmarks: toggle(s.bookmarks, key) })),

      setVideoProgress: (id: string, p: number) =>
        update((s) => (Math.abs((s.videoProgress[id] ?? 0) - p) < 0.01 ? s : { ...s, videoProgress: { ...s.videoProgress, [id]: Math.max(s.videoProgress[id] ?? 0, p) } })),
      toggleVideoDone: (id: string) => update((s) => ({ ...s, videosDone: toggle(s.videosDone, id) })),
      toggleArticleDone: (id: string) => update((s) => ({ ...s, articlesDone: toggle(s.articlesDone, id) })),

      saveSolution: (id: string, code: string) => update((s) => ({ ...s, solutions: { ...s.solutions, [id]: code } })),

      markRevised: (day: number) =>
        update((s) => ({ ...s, revisions: { ...s.revisions, [day]: [...(s.revisions[day] ?? []), toISODate(new Date())] } })),

      addQuizResult: (r: QuizResult) => update((s) => ({ ...s, quizResults: [...s.quizResults, r] })),
      addInterview: (m: MockInterview) => update((s) => ({ ...s, interviews: [...s.interviews, m] })),

      /* ---------- holidays, sick leave & target ---------- */
      setRestDays: (days: number[]) =>
        update((s) => {
          const restDays = Array.from(new Set(days)).filter((d) => d >= 0 && d <= 6).sort().slice(0, 2);
          return { ...s, restDays, perWeek: (7 - restDays.length) as AppState["perWeek"] };
        }),
      /** Takes a sick-leave day (ignored if that 2-week block's allowance is used up). */
      takeLeave: (iso: string, startDate: string) =>
        update((s) => (s.leaves.includes(iso) || leaveBalance(startDate, s.leaves, iso).left <= 0 ? s : { ...s, leaves: [...s.leaves, iso].sort() })),
      cancelLeave: (iso: string) => update((s) => ({ ...s, leaves: s.leaves.filter((l) => l !== iso) })),
      setAutoLeave: (on: boolean) => update((s) => ({ ...s, autoLeave: on })),
      setTargetDate: (iso: string | null) => update((s) => ({ ...s, targetDate: iso })),

      /* ---------- plan customisation ---------- */
      addTopic: (t: { phaseId: number | "new"; newPhaseTitle?: string; title: string; days: number; concepts: string[] }) =>
        update((s) => {
          let customPhases = s.customPhases;
          let phaseId = t.phaseId;
          if (phaseId === "new") {
            const title = (t.newPhaseTitle || "My phase").trim();
            phaseId = 19 + customPhases.length;
            while (customPhases.some((p) => p.id === phaseId)) phaseId++;
            customPhases = [...customPhases, { id: phaseId, title, short: title.split(/\s+/).slice(0, 2).join(" ") }];
          }
          const topic = { id: `custom-${Date.now().toString(36)}`, phaseId, title: t.title.trim(), days: Math.max(1, Math.min(10, Math.round(t.days))), concepts: t.concepts.map((c) => c.trim()).filter(Boolean) };
          return withPlan(s, { ...s, customPhases, customTopics: [...s.customTopics, topic] });
        }),
      deleteTopic: (id: string) =>
        update((s) => {
          const topic = s.customTopics.find((t) => t.id === id);
          const customTopics = s.customTopics.filter((t) => t.id !== id);
          // Remove a custom phase once it has no topics left.
          const customPhases = s.customPhases.filter((p) => p.id !== topic?.phaseId || customTopics.some((t) => t.phaseId === p.id));
          const extraConcepts = { ...s.extraConcepts };
          delete extraConcepts[id];
          const splits = Object.fromEntries(Object.entries(s.splits).filter(([k]) => !k.startsWith(`${id}#`)));
          return withPlan(s, { ...s, customTopics, customPhases, extraConcepts, splits });
        }),
      addConcept: (topicId: string, text: string) =>
        update((s) => (text.trim() ? withPlan(s, { ...s, extraConcepts: { ...s.extraConcepts, [topicId]: [...(s.extraConcepts[topicId] ?? []), text.trim()] } }) : s)),
      removeConcept: (topicId: string, index: number) =>
        update((s) => withPlan(s, { ...s, extraConcepts: { ...s.extraConcepts, [topicId]: (s.extraConcepts[topicId] ?? []).filter((_, i) => i !== index) } })),
      /** Split one plan day ("topicId#part") into 2 or 3 days; 1 merges it back. */
      splitDay: (baseKey: string, parts: number) =>
        update((s) => {
          const splits = { ...s.splits };
          if (parts <= 1) delete splits[baseKey];
          else splits[baseKey] = Math.min(3, parts);
          return withPlan(s, { ...s, splits });
        }),
    }),
    [update],
  );

  // Derived numbers are computed once per change and shared by every component.
  const derived = useMemo<Derived | null>(() => {
    if (!state) return null;
    applyPlanConfig(cfgOf(state)); // rebuild the live plan if the learner customised it
    return derive(state);
  }, [state]);

  return { state, saveError, derived, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}

/** For components that only render once state has loaded. */
export function useAppState() {
  const store = useStore();
  if (!store.state) throw new Error("state not loaded");
  return { ...store, state: store.state };
}
