import { getUser, sameOrigin } from "@/lib/server/session";
import { limit } from "@/lib/server/rateLimit";
import { readPush, updatePush } from "@/lib/server/reminders";
import { sendPush } from "@/lib/server/push";
import { guard, json, tooMany } from "@/lib/server/http";

export const runtime = "nodejs";

/** Sends a push to the signed-in user's devices right now (to check it arrives with the app closed). */
async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const u = await getUser();
  if (!u) return json({ error: "Please sign in." }, 401);
  const rl = await limit(`pushtest:${u.uid}`, 10, 60 * 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const entry = (await readPush())[u.uid];
  if (!entry?.subs.length) return json({ error: "No device is registered for reminders yet. Turn reminders on first." }, 400);
  const delay = Math.min(30, Math.max(0, Number(new URL(req.url).searchParams.get("delay")) || 0));
  if (delay) await new Promise((r) => setTimeout(r, delay * 1000)); // time to close the app before it arrives
  const r = await sendPush(entry.subs, { title: "Reminders are working ✅", body: "This came from the server, so it also arrives when the app is closed.", url: "/", tag: "test" });
  if (r.gone.length) await updatePush((all) => ({ ...all, [u.uid]: { ...all[u.uid], subs: all[u.uid].subs.filter((x) => !r.gone.includes(x.endpoint)) } }));
  return json({ ok: r.sent > 0, sent: r.sent, devices: entry.subs.length });
}
export const POST = guard(handlePOST);
