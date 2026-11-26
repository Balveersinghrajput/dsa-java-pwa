/**
 * Sliding-window rate limiter kept in memory (per server process). Behind
 * several instances use a shared store (e.g. Redis/Upstash) instead.
 */
const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

function sweep(now: number) {
  // Drop idle keys so a flood of different IPs can't grow memory without bound.
  if (now - lastSweep < 60_000 && buckets.size < 50_000) return;
  lastSweep = now;
  for (const [k, hits] of buckets) if (!hits.length || now - hits[hits.length - 1] > 60 * 60_000) buckets.delete(k);
}

export function rateLimit(key: string, limit: number, windowMs: number, cost = 1) {
  const now = Date.now();
  sweep(now);
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length + cost > limit) {
    buckets.set(key, hits);
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000));
    return { ok: false as const, retryAfter };
  }
  for (let i = 0; i < cost; i++) hits.push(now);
  buckets.set(key, hits);
  return { ok: true as const, retryAfter: 0 };
}

export function resetLimit(key: string) {
  buckets.delete(key);
}

/**
 * Client IP for rate limiting. The last x-forwarded-for entry is added by the
 * server/proxy nearest to us, so clients can't forge it. Set TRUST_PROXY=1
 * when running behind a trusted proxy (Nginx, Vercel…) to use the original client.
 */
export function clientIp(req: Request) {
  const chain = (req.headers.get("x-forwarded-for") ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const ip = (process.env.TRUST_PROXY === "1" ? chain[0] : chain[chain.length - 1]) || req.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 64);
}
