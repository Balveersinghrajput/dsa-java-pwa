import { kvGet, kvUpdate } from "@/lib/server/kv";
import { progressKey } from "@/lib/server/account";
import { getUser, sameOrigin } from "@/lib/server/session";
import { limit } from "@/lib/server/rateLimit";
import { body, guard, json, tooMany } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 900_000; // stays under Upstash's 1 MB request limit

export interface StoredProgress {
  state: Record<string, unknown> | null;
  updatedAt: number; // ms, time of the last change on the device that saved it
  savedAt: number; // ms, server time
}

/** The signed-in user's progress saved on the server. */
async function handleGET() {
  const u = await getUser();
  if (!u) return json({ error: "Please sign in." }, 401);
  const p = await kvGet<StoredProgress>(progressKey(u.uid)); // each user only ever sees their own record
  return json(p ?? { state: null, updatedAt: 0, savedAt: 0 });
}

/**
 * Saves progress. Last change wins: if the server already holds a newer copy
 * (made on another device) it is returned with 409 and the client adopts it.
 */
async function handlePUT(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const u = await getUser();
  if (!u) return json({ error: "Please sign in." }, 401);
  const rl = await limit(`progress:${u.sid}`, 120, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);

  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_BYTES) return json({ error: "Progress is too large to sync." }, 413);
  const b = await body<{ state: Record<string, unknown>; updatedAt: number }>(req);
  const updatedAt = Number(b?.updatedAt);
  if (!b?.state || typeof b.state !== "object" || Array.isArray(b.state) || !Number.isFinite(updatedAt) || updatedAt <= 0) {
    return json({ error: "Invalid progress." }, 400);
  }
  if (JSON.stringify(b.state).length > MAX_BYTES) return json({ error: "Progress is too large to sync." }, 413);

  let conflict: StoredProgress | null = null;
  const saved = await kvUpdate<StoredProgress>(progressKey(u.uid), () => ({ state: null, updatedAt: 0, savedAt: 0 }), (cur) => {
    if (cur.state && cur.updatedAt > updatedAt) {
      conflict = cur;
      return cur;
    }
    return { state: b.state!, updatedAt, savedAt: Date.now() };
  });
  if (conflict) return json(conflict, 409);
  return json({ ok: true, updatedAt: saved.updatedAt, savedAt: saved.savedAt });
}

export const GET = guard(handleGET);
export const PUT = guard(handlePUT);
