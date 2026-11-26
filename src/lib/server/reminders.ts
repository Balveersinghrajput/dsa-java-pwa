import { kvGet, kvUpdate } from "./kv";

/** A browser/phone push subscription (from PushManager.subscribe). */
export interface PushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  ua: string;
  created: number;
}

/** Push settings per user. The reminder time itself comes from their synced progress. */
export interface PushEntry {
  subs: PushSub[];
  tz: string; // IANA time zone of their device, e.g. "Asia/Kolkata"
  lastSent?: string; // local date (YYYY-MM-DD) of the last reminder
}

type PushDoc = { users: Record<string, PushEntry> };
const KEY = "push";

export const readPush = async () => (await kvGet<PushDoc>(KEY))?.users ?? {};
export const updatePush = (fn: (users: Record<string, PushEntry>) => Record<string, PushEntry>) =>
  kvUpdate<PushDoc>(KEY, () => ({ users: {} }), (cur) => ({ users: fn(cur.users ?? {}) }));

export function validTz(tz: unknown): string {
  const t = String(tz ?? "");
  try {
    if (t && t.length < 64) {
      new Intl.DateTimeFormat("en-US", { timeZone: t });
      return t;
    }
  } catch {
    /* invalid */
  }
  return "UTC";
}

/** Local date, weekday and minutes since midnight in a time zone. */
export function localNow(tz: string, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { date: `${parts.year}-${parts.month}-${parts.day}`, weekday, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

const WINDOW_MIN = 90; // a late scheduler run still sends, but never hours late

export interface ReminderInput {
  enabled: boolean;
  time: string; // "HH:MM"
  tz: string;
  lastSent?: string;
  doneDates: string[]; // dates lessons were completed
  restDays: number[];
  leaves: string[];
  now?: Date;
}

/** Should this user get their reminder right now? */
export function reminderDue(r: ReminderInput): { send: boolean; date: string; reason: string } {
  const { date, weekday, minutes } = localNow(r.tz, r.now);
  const m = /^(\d{1,2}):(\d{2})$/.exec(r.time);
  if (!r.enabled || !m) return { send: false, date, reason: "off" };
  const at = Number(m[1]) * 60 + Number(m[2]);
  if (r.lastSent === date) return { send: false, date, reason: "already sent today" };
  if (minutes < at) return { send: false, date, reason: "too early" };
  if (minutes > at + WINDOW_MIN) return { send: false, date, reason: "window passed" };
  if (r.restDays.includes(weekday)) return { send: false, date, reason: "holiday" };
  if (r.leaves.includes(date)) return { send: false, date, reason: "leave" };
  if (r.doneDates.includes(date)) return { send: false, date, reason: "studied today" };
  return { send: true, date, reason: "due" };
}
