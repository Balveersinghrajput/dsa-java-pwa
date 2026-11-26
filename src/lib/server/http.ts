import { NextResponse } from "next/server";
import { StorageNotConfigured } from "./kv";

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

/**
 * Wraps a route handler so storage/config failures return a clear JSON error
 * (instead of a crash page) and are logged once.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function guard<A extends any[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof StorageNotConfigured) {
        console.error("[storage]", e.message);
        return json({ error: e.message, code: "storage" }, 503);
      }
      console.error("[api]", e);
      return json({ error: "Something went wrong on the server. Please try again." }, 500);
    }
  };
}
