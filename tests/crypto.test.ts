import { describe, expect, it } from "vitest";
import { hashPassword, safeEqual, sha256, sign, unsign, verifyPassword } from "@/lib/server/crypto";
import { rateLimit, resetLimit, clientIp } from "@/lib/server/rateLimit";
import { passwordProblem } from "@/lib/server/http";

describe("crypto", () => {
  it("hashes and verifies passwords (never stores plain text)", async () => {
    const h = await hashPassword("Secret#123");
    expect(h).not.toContain("Secret#123");
    expect(h.startsWith("scrypt:")).toBe(true);
    expect(await verifyPassword("Secret#123", h)).toBe(true);
    expect(await verifyPassword("secret#123", h)).toBe(false);
    expect(await verifyPassword("x", "garbage")).toBe(false);
  });

  it("signed tokens reject tampering", () => {
    const t = sign({ a: 1 });
    expect(unsign<{ a: number }>(t)?.a).toBe(1);
    const [body, mac] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ a: 2 })).toString("base64url");
    expect(unsign(`${forged}.${mac}`)).toBeNull();
    expect(unsign(`${body}.x${mac.slice(1)}`)).toBeNull();
    expect(unsign(undefined)).toBeNull();
  });

  it("safeEqual / sha256", () => {
    expect(safeEqual(sha256("a"), sha256("a"))).toBe(true);
    expect(safeEqual(sha256("a"), sha256("b"))).toBe(false);
    expect(safeEqual("a", "ab")).toBe(false);
  });

  it("password rules", () => {
    expect(passwordProblem("short")).toBeTruthy();
    expect(passwordProblem("alllowercase1!")).toBeTruthy();
    expect(passwordProblem("Good#Pass2026")).toBeNull();
  });
});

describe("in-memory rate limiter", () => {
  it("blocks after the limit and resets", () => {
    const k = `t:${Math.random()}`;
    for (let i = 0; i < 3; i++) expect(rateLimit(k, 3, 60_000).ok).toBe(true);
    const r = rateLimit(k, 3, 60_000);
    expect(r.ok).toBe(false);
    expect(r.retryAfter).toBeGreaterThan(0);
    resetLimit(k);
    expect(rateLimit(k, 3, 60_000).ok).toBe(true);
  });

  it("reads the proxy-added client IP", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" } });
    expect(clientIp(req)).toBe("2.2.2.2");
  });
});
