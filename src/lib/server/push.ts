import webpush from "web-push";
import { phases } from "@/data/curriculum";
import type { PushSub } from "./reminders";

let configured = false;
function setup() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) throw new Error("VAPID keys missing");
  const app = process.env.APP_URL ?? "";
  webpush.setVapidDetails(app.startsWith("https://") ? app : "mailto:reminders@example.com", pub, priv);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag?: string;
}

/** Sends to every device; returns endpoints that are gone (unsubscribed / uninstalled). */
export async function sendPush(subs: PushSub[], payload: PushPayload) {
  setup();
  const gone: string[] = [];
  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify(payload), { TTL: 3600, urgency: "high" });
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) gone.push(s.endpoint);
        else console.error("[push] send failed:", code ?? (e as Error).message);
      }
    }),
  );
  return { sent, gone };
}

const baseTitles = new Map(phases.flatMap((p) => p.topics.map((t) => [t.id, t.title] as const)));

/** The next unfinished day and its topic, from a learner's saved progress. */
export function nextLesson(state: Record<string, unknown>) {
  const keys = Array.isArray(state.planKeys) ? (state.planKeys as string[]) : [];
  const done = new Set(Array.isArray(state.doneDays) ? (state.doneDays as number[]) : []);
  const total = keys.length || 152;
  let day = 1;
  while (day <= total && done.has(day)) day++;
  if (day > total) return null;
  const topicId = keys[day - 1]?.split("#")[0] ?? "";
  const custom = Array.isArray(state.customTopics) ? (state.customTopics as { id: string; title: string }[]).find((t) => t.id === topicId) : undefined;
  return { day, title: custom?.title ?? baseTitles.get(topicId) ?? "" };
}
