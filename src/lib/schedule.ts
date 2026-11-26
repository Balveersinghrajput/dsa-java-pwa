// Turns "Day N" into a real calendar date, skipping rest days.

export type StudyDaysPerWeek = 5 | 6 | 7;

export const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Weekday holidays for a given number of study days (0 = Sunday … 6 = Saturday). */
export const defaultRestDays = (perWeek: StudyDaysPerWeek): number[] => (perWeek === 7 ? [] : perWeek === 6 ? [0] : [0, 6]);

export const LEAVE_PER_BLOCK = 2; // sick-leave days …
export const BLOCK_DAYS = 14; // … in every 2-week block

export interface ScheduleOpts {
  restDays: number[]; // weekly holidays
  leaves: string[]; // sick-leave dates taken (YYYY-MM-DD)
  autoLeave: boolean; // unused leave is taken at the end of each 2-week block
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/**
 * Decides which dates are study days. Weekly holidays and sick leave are off.
 * With autoLeave, any leave not used in a 2-week block is placed on that
 * block's last study days, so you can finish the block with a long weekend.
 */
export function makeDayRules(startISO: string, opts: ScheduleOpts) {
  const start = parseISODate(startISO);
  const manual = new Set(opts.leaves);
  const rest = new Set(opts.restDays);
  const autoCache = new Map<number, Set<string>>();

  const blockOf = (d: Date) => Math.floor((d.getTime() - start.getTime()) / 86400000 / BLOCK_DAYS);
  const autoFor = (block: number): Set<string> => {
    const hit = autoCache.get(block);
    if (hit) return hit;
    const out = new Set<string>();
    if (opts.autoLeave && block >= 0) {
      const dates = Array.from({ length: BLOCK_DAYS }, (_, i) => addDays(start, block * BLOCK_DAYS + i));
      const used = dates.filter((d) => manual.has(toISODate(d))).length;
      const candidates = dates.filter((d) => !rest.has(d.getDay()) && !manual.has(toISODate(d)));
      for (const d of candidates.slice(Math.max(0, candidates.length - Math.max(0, LEAVE_PER_BLOCK - used)))) out.add(toISODate(d));
    }
    autoCache.set(block, out);
    return out;
  };

  const kind = (d: Date): "study" | "rest" | "leave" | "auto-leave" => {
    if (rest.has(d.getDay())) return "rest";
    const iso = toISODate(d);
    if (manual.has(iso)) return "leave";
    if (autoFor(blockOf(d)).has(iso)) return "auto-leave";
    return "study";
  };
  return { kind, blockOf, isStudy: (d: Date) => kind(d) === "study" };
}

/** One Date per plan day (index 0 = Day 1). blockStart keeps leave blocks aligned to the course start. */
export function buildCalendar(fromISO: string, opts: ScheduleOpts, totalDays: number, blockStart = fromISO): Date[] {
  const rules = makeDayRules(blockStart, opts);
  const dates: Date[] = [];
  let cursor = parseISODate(fromISO);
  if (opts.restDays.length >= 7) return dates;
  for (let guard = 0; dates.length < totalDays && guard < 5000; guard++) {
    if (rules.isStudy(cursor)) dates.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/** Leave used / left in the 2-week block that contains `dateISO`. */
export function leaveBalance(startISO: string, leaves: string[], dateISO: string) {
  const start = parseISODate(startISO);
  const block = Math.floor((parseISODate(dateISO).getTime() - start.getTime()) / 86400000 / BLOCK_DAYS);
  const from = addDays(start, block * BLOCK_DAYS);
  const to = addDays(from, BLOCK_DAYS - 1);
  const used = leaves.filter((l) => l >= toISODate(from) && l <= toISODate(to)).length;
  return { block, used, left: Math.max(0, LEAVE_PER_BLOCK - used), from, to };
}

/** Which plan day is scheduled for today (1-based). 0 = not started yet. */
export function todayDayNumber(calendar: Date[], today = new Date()): number {
  const t = toISODate(today);
  let current = 0;
  for (let i = 0; i < calendar.length; i++) {
    if (toISODate(calendar[i]) <= t) current = i + 1;
    else break;
  }
  return current;
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export const fmtShort = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const fmtMinutes = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
};
