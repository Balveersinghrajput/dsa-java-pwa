import { getUser } from "@/lib/server/session";
import { limit } from "@/lib/server/rateLimit";
import { guard, json, tooMany } from "@/lib/server/http";

export const runtime = "nodejs";

/**
 * Title + channel of a YouTube video, for links learners add.
 * Only ever calls YouTube's own oEmbed endpoint with a validated 11-character id.
 */
async function handleGET(req: Request) {
  const u = await getUser();
  if (!u) return json({ error: "Please sign in." }, 401);
  const rl = await limit(`oembed:${u.uid}`, 60, 60 * 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return json({ error: "Invalid video id." }, 400);
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, { signal: AbortSignal.timeout(6000) });
    // YouTube answers 400/401/403/404 for missing, private or non-embeddable videos.
    if (res.status >= 400 && res.status < 500) return json({ error: "Video not found, private, or it can't be embedded. You can still save the link." }, 404);
    if (!res.ok) return json({ error: "Couldn't reach YouTube." }, 502);
    const d = (await res.json()) as { title?: string; author_name?: string };
    return json({ title: String(d.title ?? "").slice(0, 200), channel: String(d.author_name ?? "").slice(0, 100) }, 200, { "Cache-Control": "private, max-age=86400" });
  } catch {
    return json({ error: "Couldn't reach YouTube." }, 502);
  }
}
export const GET = guard(handleGET);
