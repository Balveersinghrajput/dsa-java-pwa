import { NextResponse, type NextRequest } from "next/server";

/**
 * Server-side Java execution through a Judge0-compatible API.
 *
 * Configure with environment variables (never exposed to the browser):
 *   JUDGE0_URL          default https://ce.judge0.com (free public instance, rate-limited)
 *   JUDGE0_API_KEY      optional key for a private/RapidAPI instance
 *   JUDGE0_AUTH_HEADER  header name for the key (default X-Auth-Token; RapidAPI uses X-RapidAPI-Key)
 *   JUDGE0_JAVA_ID      language id (default 91 = Java JDK 17 on Judge0 CE)
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const URL_BASE = (process.env.JUDGE0_URL || "https://ce.judge0.com").replace(/\/$/, "");
const JAVA_ID = Number(process.env.JUDGE0_JAVA_ID || 91);
const MAX_SOURCE = 64 * 1024;
const MAX_STDIN = 32 * 1024;
const MAX_TESTS = 8;

// Simple in-memory rate limit: 20 executions per minute per client.
const hits = new Map<string, number[]>();
function limited(key: string, cost: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  if (recent.length + cost > 20) {
    hits.set(key, recent);
    return true;
  }
  hits.set(key, [...recent, ...Array(cost).fill(now)]);
  return false;
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
const unb64 = (s: string | null | undefined) => (s ? Buffer.from(s, "base64").toString("utf8") : "");

export interface RunResult {
  status: string;
  ok: boolean;
  stdout: string;
  stderr: string;
  compile: string;
  time: string | null;
  memory: number | null;
}

async function execute(source: string, stdin: string): Promise<RunResult> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (process.env.JUDGE0_API_KEY) {
    headers[process.env.JUDGE0_AUTH_HEADER || "X-Auth-Token"] = process.env.JUDGE0_API_KEY;
    if ((process.env.JUDGE0_AUTH_HEADER || "").toLowerCase() === "x-rapidapi-key") headers["X-RapidAPI-Host"] = new URL(URL_BASE).host;
  }
  const res = await fetch(`${URL_BASE}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers,
    body: JSON.stringify({ language_id: JAVA_ID, source_code: b64(source), stdin: b64(stdin), cpu_time_limit: 5, memory_limit: 256000 }),
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });
  if (res.status === 429) throw Object.assign(new Error("The execution service is busy (rate limit). Wait a moment and try again."), { status: 429 });
  if (!res.ok) throw Object.assign(new Error(`Execution service error (${res.status}).`), { status: 502 });
  const r = await res.json();
  const status = r?.status?.description ?? "Unknown";
  return {
    status,
    ok: r?.status?.id === 3,
    stdout: unb64(r.stdout),
    stderr: unb64(r.stderr),
    compile: unb64(r.compile_output) || (r?.status?.id === 6 ? unb64(r.message) : ""),
    time: r.time ?? null,
    memory: r.memory ?? null,
  };
}

export async function POST(req: NextRequest) {
  let body: { source?: unknown; stdin?: unknown; tests?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const source = typeof body.source === "string" ? body.source : "";
  if (!source.trim()) return NextResponse.json({ error: "No source code." }, { status: 400 });
  if (source.length > MAX_SOURCE) return NextResponse.json({ error: "Source code is too large (64 KB max)." }, { status: 413 });
  if (!/class\s+Main\b/.test(source)) return NextResponse.json({ error: "Your program needs a class named Main with a main method." }, { status: 400 });

  const tests = Array.isArray(body.tests) ? body.tests.filter((t): t is string => typeof t === "string").slice(0, MAX_TESTS) : null;
  const inputs = tests ?? [typeof body.stdin === "string" ? body.stdin : ""];
  if (inputs.some((s) => s.length > MAX_STDIN)) return NextResponse.json({ error: "Input is too large (32 KB max)." }, { status: 413 });

  const client = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  if (limited(client, inputs.length)) return NextResponse.json({ error: "Too many runs in the last minute. Please wait a little." }, { status: 429 });

  try {
    const results: RunResult[] = [];
    for (const input of inputs) {
      const r = await execute(source, input);
      results.push(r);
      if (r.status.startsWith("Compilation")) break; // no point running more tests
    }
    return NextResponse.json({ results });
  } catch (e) {
    const err = e as Error & { status?: number };
    const msg = err.name === "TimeoutError" ? "The execution service took too long to respond." : err.message || "Could not reach the execution service.";
    return NextResponse.json({ error: msg }, { status: err.status ?? 502 });
  }
}
