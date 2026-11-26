import { NextResponse } from "next/server";

export const json = (data: unknown, status = 200, headers?: Record<string, string>) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });

export const tooMany = (retryAfter: number) =>
  json({ error: `Too many attempts. Try again in ${retryAfter < 120 ? `${retryAfter} seconds` : `${Math.ceil(retryAfter / 60)} minutes`}.` }, 429, { "Retry-After": String(retryAfter) });

export async function body<T>(req: Request): Promise<Partial<T> | null> {
  try {
    const b = await req.json();
    return b && typeof b === "object" ? b : null;
  } catch {
    return null;
  }
}

/** At least 8 chars with upper, lower, digit and symbol. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "Use at least 8 characters.";
  if (pw.length > 128) return "Use at most 128 characters.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) return "Include upper- and lower-case letters, a number and a symbol.";
  return null;
}
