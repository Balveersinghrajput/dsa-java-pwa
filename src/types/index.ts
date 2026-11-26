import type { StudyDaysPerWeek } from "@/lib/schedule";

export type { Difficulty, Phase, PlanDay, Problem, Resource, Topic } from "@/data/curriculum";
export type { StudyDaysPerWeek };

/** Minutes per activity for one study day. */
export interface Schedule {
  learn: number;
  implement: number;
  practice: number;
  revise: number;
}

export type TaskId = keyof Schedule;

export interface Attempt {
  at: string; // ISO timestamp
  result: "attempted" | "solved";
}

export interface Note {
  text: string;
  updated: string; // ISO timestamp
}

export interface QuizResult {
  phase: number;
  score: number;
  total: number;
  at: string;
}

export interface MockInterview {
  at: string;
  problems: string[];
  minutes: number;
  solved: number;
}

/** Everything the app remembers. Stored in IndexedDB under one key. */
/** A video or article the learner attached to a plan day. */
export interface CustomResource {
  id: string;
  kind: "video" | "article";
  url: string;
  title: string;
  videoId?: string; // YouTube id for videos
  channel?: string;
  added: string; // ISO time
}

export interface AppState {
  version: 2;
  name: string;
  startDate: string; // YYYY-MM-DD
  perWeek: StudyDaysPerWeek;
  schedule: Schedule;
  doneDays: number[];
  doneAt: Record<number, string>; // day → YYYY-MM-DD it was marked complete
  tasks: Record<number, TaskId[]>; // ticked activities per day
  solved: string[]; // LeetCode slugs
  attempts: Record<string, Attempt[]>;
  notes: Record<string, Note>; // "problem:slug" | "lesson:12" | "video:id" | "article:id" | "free:id"
  bookmarks: string[]; // "lesson:12" | "problem:slug" | "video:id" | "article:id" | "template:id"
  videoProgress: Record<string, number>; // 0..1
  videosDone: string[];
  articlesDone: string[];
  solutions: Record<string, string>; // practice exercise id → Java source
  revisions: Record<number, string[]>; // day → dates it was revised
  studyLog: Record<string, number>; // YYYY-MM-DD → minutes studied
  quizResults: QuizResult[];
  interviews: MockInterview[];
  reminder: { enabled: boolean; time: string };
  /** Study timer: elapsedMs banks stopped time; startedAt is set while running. */
  timer: { startedAt: number | null; elapsedMs: number; day: string };
  /* ---- plan customisation (see PlanConfig in curriculum.ts) ---- */
  customPhases: { id: number; title: string; short: string }[];
  customTopics: { id: string; phaseId: number; title: string; days: number; concepts: string[] }[];
  extraConcepts: Record<string, string[]>;
  splits: Record<string, number>;
  /* ---- schedule ---- */
  restDays: number[]; // weekly holidays, 0 = Sunday … 6 = Saturday
  leaves: string[]; // sick-leave dates (YYYY-MM-DD), max 2 per 2-week block
  autoLeave: boolean; // take unused leave at the end of each 2-week block
  targetDate: string | null; // learner's own target finish date
  /** Day keys the stored day numbers refer to (used to remap progress when the plan changes). */
  planKeys: string[];
  /** Videos/articles the learner added, by stable plan-day key ("topicId#part"). */
  customResources: Record<string, CustomResource[]>;
}

