import { getUser, sameOrigin } from "@/lib/server/session";
import { readPush, updatePush, validTz, type PushSub } from "@/lib/server/reminders";
import { body, guard, json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pushReady = () => !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

/** Public key for subscribing + whether this user has any device registered. */
async function handleGET() {
  const u = await getUser();
  if (!u) return json({ error: "Please sign in." }, 401);
  const entry = (await readPush())[u.uid];
  return json({ ready: pushReady(), publicKey: process.env.VAPID_PUBLIC_KEY ?? null, devices: entry?.subs.length ?? 0 });
}

/** Registers this device for reminders ({ subscription, tz }). */
async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const u = await getUser();
  if (!u) return json({ error: "Please sign in." }, 401);
  if (!pushReady()) return json({ error: "Push isn't set up on the server yet (VAPID keys missing)." }, 503);
  const b = await body<{ subscription: { endpoint: string; keys: { p256dh: string; auth: string } }; tz: string }>(req);
  const s = b?.subscription;
  const endpoint = String(s?.endpoint ?? "");
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000 || !s?.keys?.p256dh || !s?.keys?.auth) return json({ error: "Invalid subscription." }, 400);
  const sub: PushSub = { endpoint, keys: { p256dh: String(s.keys.p256dh).slice(0, 200), auth: String(s.keys.auth).slice(0, 100) }, ua: (req.headers.get("user-agent") ?? "").slice(0, 200), created: Date.now() };
  await updatePush((users) => {
    const cur = users[u.uid] ?? { subs: [], tz: "UTC" };
    const subs = [...cur.subs.filter((x) => x.endpoint !== endpoint), sub].slice(-10);
    return { ...users, [u.uid]: { ...cur, subs, tz: validTz(b?.tz) } };
  });
  return json({ ok: true });
}

/** Removes this device ({ endpoint }). */
async function handleDELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const u = await getUser();
  if (!u) return json({ error: "Please sign in." }, 401);
  const endpoint = String((await body<{ endpoint: string }>(req))?.endpoint ?? "");
  await updatePush((users) => {
    const cur = users[u.uid];
    if (!cur) return users;
    return { ...users, [u.uid]: { ...cur, subs: cur.subs.filter((x) => x.endpoint !== endpoint) } };
  });
  return json({ ok: true });
}

/** The app showed today's reminder itself (it was open): don't push it again ({ sent: "YYYY-MM-DD" }). */
async function handlePATCH(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const u = await getUser();
  if (!u) return json({ error: "Please sign in." }, 401);
  const sent = String((await body<{ sent: string }>(req))?.sent ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sent)) return json({ error: "Invalid date." }, 400);
  await updatePush((users) => (users[u.uid] ? { ...users, [u.uid]: { ...users[u.uid], lastSent: sent } } : users));
  return json({ ok: true });
}

export const GET = guard(handleGET);
export const PATCH = guard(handlePATCH);
export const POST = guard(handlePOST);
export const DELETE = guard(handleDELETE);
