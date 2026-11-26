import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

/** scrypt password hash → "scrypt:N:r:p:salt:hash" (base64 parts). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, PARAMS);
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64"), key.toString("base64")].join(":");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, N, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64");
  const key = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, { N: Number(N), r: Number(r), p: Number(p), maxmem: PARAMS.maxmem });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export const randomToken = () => randomBytes(32).toString("base64url");
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET is missing or too short (set it in .env.local)");
  return s;
}

/** Compact signed token: base64url(json).base64url(hmac). */
export function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function unsign<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  if (!safeEqual(mac, expected)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as T;
  } catch {
    return null;
  }
}
