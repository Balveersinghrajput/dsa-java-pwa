"use client";

import { phases, plan, type PlanDay } from "@/data/curriculum";
import { buildCalendar, leaveBalance, makeDayRules, parseISODate, todayDayNumber, toISODate, type ScheduleOpts } from "./schedule";
import { useStore } from "./store";
import type { AppState, Schedule } from "@/types";

export const scheduleTotal = (s: Schedule) => s.learn + s.implement + s.practice + s.revise;

/** Spaced-repetition gaps (days after completion) for the revision planner. */
export const REVISION_GAPS = [1, 3, 7, 21];

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function streakOf(today: number, done: Set<number>) {
  let i = done.has(today) ? today : today - 1;
  let s = 0;
  while (i >= 1 && done.has(i)) {
    s++;
    i--;
  }
  return s;
}

export function derive(state: AppState) {
  const startDate = state.startDate;
  const opts: ScheduleOpts = { restDays: state.restDays, leaves: state.leaves, autoLeave: state.autoLeave };
  const calendar = buildCalendar(startDate, opts, plan.length);
  const dayRules = makeDayRules(startDate, opts);
  const today = todayDayNumber(calendar); // 0 = not started
  const done = new Set(state.doneDays);
  const solved = new Set(state.solved);
  const scheduledFocus = today === 0 ? 1 : Math.min(today, plan.length);
  const dayMinutes = scheduleTotal(state.schedule);
  const todayISO = toISODate(new Date());
  const dateMap = new Map(calendar.map((d, i) => [toISODate(d), i + 1]));

  const missed = plan.filter((d) => d.day < today && !done.has(d.day)).map((d) => d.day);
  const firstUndone = plan.find((d) => !done.has(d.day))?.day ?? plan.length;

  // Catch-up lock: with more than 2 missed days you can't move ahead until you finish them.
  const MAX_MISSED = 2;
  const catchUp = missed.length > MAX_MISSED;
  const isLocked = (day: number) => catchUp && day > firstUndone && !done.has(day);
  const focus = catchUp ? firstUndone : scheduledFocus;
  const streak = streakOf(today, done);
  const pct = (done.size / plan.length) * 100;

  // Expected finish: remaining lessons laid out from today on study days.
  const remaining = plan.length - done.size;
  const projected = buildCalendar(todayISO > startDate ? todayISO : startDate, opts, Math.max(remaining, 1), startDate);
  const expectedFinish = remaining === 0 ? new Date() : projected[projected.length - 1];

  const totalStudied = Object.values(state.studyLog).reduce((a, b) => a + b, 0);

  // Admin target: finish within N calendar days of the start date.
  const targetFinish = state.targetDate ? parseISODate(state.targetDate) : null;
  const leave = leaveBalance(startDate, state.leaves, todayISO);
  const daysLeftToTarget = targetFinish ? Math.max(0, Math.round((targetFinish.getTime() - parseISODate(todayISO).getTime()) / 86400000) + 1) : null;
  const onTrack = targetFinish ? expectedFinish.getTime() <= targetFinish.getTime() : null;

  // Revision planner
  const revisionsDue = state.doneDays
    .map((day) => {
      const at = state.doneAt[day];
      if (!at) return null;
      const count = state.revisions[day]?.length ?? 0;
      if (count >= REVISION_GAPS.length) return null;
      const due = addDays(parseISODate(at), REVISION_GAPS[count]);
      return { day, due, count };
    })
    .filter((x): x is { day: number; due: Date; count: number } => !!x)
    .sort((a, b) => a.due.getTime() - b.due.getTime());
  const revisionsDueNow = revisionsDue.filter((r) => toISODate(r.due) <= todayISO);

  // Weak topics: started phases where few of the scheduled problems are solved,
  // or where the latest quiz score is under 60%.
  const weak = phases
    .map((ph) => {
      const days = plan.filter((d) => d.phase.id === ph.id && d.day <= Math.max(today, done.size));
      const probs = days.flatMap((d) => d.problems);
      const solvedN = probs.filter((p) => solved.has(p.slug)).length;
      const quiz = [...state.quizResults].reverse().find((q) => q.phase === ph.id);
      const ratio = probs.length ? solvedN / probs.length : 1;
      const quizPct = quiz ? quiz.score / quiz.total : null;
      return { phase: ph, ratio, solvedN, total: probs.length, quizPct, started: days.length > 0 };
    })
    .filter((w) => w.started && (w.ratio < 0.6 || (w.quizPct !== null && w.quizPct < 0.6)))
    .sort((a, b) => a.ratio - b.ratio);

  const notifications: { id: string; text: string; href: string }[] = [];
  if (today > 0 && !done.has(focus)) notifications.push({ id: "today", text: `Day ${focus} is waiting: ${plan[focus - 1].topic.title}`, href: `/lessons/${focus}` });
  if (catchUp) notifications.push({ id: "lock", text: `${missed.length} days missed — later lessons are locked until you finish Day ${firstUndone}`, href: `/lessons/${firstUndone}` });
  else if (missed.length) notifications.push({ id: "missed", text: `${missed.length} missed day${missed.length > 1 ? "s" : ""}. Next to catch up: Day ${missed[0]}`, href: `/lessons/${missed[0]}` });
  if (revisionsDueNow.length) notifications.push({ id: "rev", text: `${revisionsDueNow.length} revision${revisionsDueNow.length > 1 ? "s" : ""} due today`, href: "/progress#revision" });

  return {
    calendar,
    today,
    focus,
    done,
    solved,
    dayMinutes,
    todayISO,
    dateMap,
    missed,
    firstUndone,
    streak,
    pct,
    expectedFinish,
    totalStudied,
    revisionsDue,
    revisionsDueNow,
    weak,
    notifications,
    finish: calendar[calendar.length - 1],
    catchUp,
    isLocked,
    dayRules,
    leave,
    maxMissed: MAX_MISSED,
    startDate,
    targetFinish,
    daysLeftToTarget,
    onTrack,
  };
}

export type Derived = ReturnType<typeof derive>;

/** Shared derived data, computed once in the store provider. */
export function useDerived(): Derived {
  const { derived } = useStore();
  if (!derived) throw new Error("state not loaded");
  return derived;
}

export const level = (d: PlanDay) => (d.phase.id <= 3 ? "Beginner" : d.phase.id <= 10 ? "Intermediate" : "Advanced");
export const phaseLevel = (id: number) => (id <= 3 ? "Beginner" : id <= 10 ? "Intermediate" : "Advanced");

export const hm = (min: number) => {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};
