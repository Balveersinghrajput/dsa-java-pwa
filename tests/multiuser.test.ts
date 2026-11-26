import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Who the mocked request is signed in as (null = signed out).
let as: { uid: string; role: "admin" | "user"; sid: string; sub: string } | null = null;

beforeEach(() => {
  vi.resetModules();
  for (const k of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN", "VERCEL"]) delete process.env[k];
  process.env.ACCOUNT_DATA_DIR = mkdtempSync(path.join(tmpdir(), "dsa-multi-"));
  as = null;
  vi.doMock("@/lib/server/session", async () => {
    const real = await vi.importActual<typeof import("@/lib/server/session")>("@/lib/server/session");
    return { ...real, getUser: async () => as, sameOrigin: () => true };
  });
});

const req = (url: string, method = "GET", body?: unknown) =>
  new Request(`http://localhost${url}`, { method, headers: { "content-type": "application/json", "user-agent": "vitest", "x-forwarded-for": "9.9.9.9" }, body: body === undefined ? undefined : JSON.stringify(body) });
const ADMIN = { uid: "admin", role: "admin" as const, sid: "a1", sub: "tester@example.test" };

async function invite() {
  as = ADMIN;
  const { POST } = await import("@/app/api/admin/invites/route");
  const r = await (await POST(req("/api/admin/invites", "POST", { note: "Rahul", days: 7 }))).json();
  as = null;
  return new URL(r.link).searchParams.get("code")!;
}

async function signup(code: string, email: string, name = "Rahul") {
  const { POST } = await import("@/app/api/auth/signup/route");
  return POST(req("/api/auth/signup", "POST", { code, name, email, password: "Friend#Pass1" }));
}

describe("invite-only sign-up", () => {
  it("only the admin can create invites", async () => {
    const { POST } = await import("@/app/api/admin/invites/route");
    as = null;
    expect((await POST(req("/api/admin/invites", "POST", {}))).status).toBe(403);
    as = { uid: "u_x", role: "user", sid: "s", sub: "f@example.test" };
    expect((await POST(req("/api/admin/invites", "POST", {}))).status).toBe(403);
  });

  it("an invite creates exactly one account", async () => {
    const code = await invite();
    const { GET } = await import("@/app/api/auth/signup/route");
    expect((await GET(req(`/api/auth/signup?code=${code}`))).status).toBe(200);

    const ok = await signup(code, "rahul@example.test");
    expect(ok.status).toBe(200);
    expect(ok.headers.get("set-cookie")).toContain("dsa_at=");

    // Same link again → refused.
    expect((await signup(code, "other@example.test")).status).toBe(400);
    expect((await GET(req(`/api/auth/signup?code=${code}`))).status).toBe(400);
  });

  it("rejects bad codes, duplicate emails and the admin's email", async () => {
    expect((await signup("nope", "x@example.test")).status).toBe(400);
    const c1 = await invite();
    expect((await signup(c1, "tester@example.test")).status).toBe(409);
    expect((await signup(c1, "a@example.test")).status).toBe(200);
    const c2 = await invite();
    expect((await signup(c2, "A@Example.test")).status).toBe(409);
  });

  it("friends can sign in with their own password", async () => {
    await signup(await invite(), "rahul@example.test");
    const { POST } = await import("@/app/api/auth/login/route");
    const bad = await POST(req("/api/auth/login", "POST", { email: "rahul@example.test", password: "wrong" }));
    expect(bad.status).toBe(401);
    const good = await POST(req("/api/auth/login", "POST", { email: "rahul@example.test", password: "Friend#Pass1" }));
    expect(good.status).toBe(200);
    expect((await good.json()).role).toBe("user");
  });
});

describe("data isolation", () => {
  it("each user reads and writes only their own progress; the admin can view friends read-only", async () => {
    await signup(await invite(), "rahul@example.test");
    const { listUsers } = await import("@/lib/server/account");
    const rahul = (await listUsers())[0];
    const progress = await import("@/app/api/progress/route");

    as = ADMIN;
    await progress.PUT(req("/api/progress", "PUT", { state: { doneDays: [1, 2, 3], name: "Owner" }, updatedAt: 10 }));
    as = { uid: rahul.id, role: "user", sid: "r1", sub: rahul.email };
    expect((await (await progress.GET()).json()).state).toBeNull(); // can't see the admin's data
    await progress.PUT(req("/api/progress", "PUT", { state: { doneDays: [1], solved: ["two-sum"] }, updatedAt: 20 }));
    expect((await (await progress.GET()).json()).state.doneDays).toEqual([1]);

    as = ADMIN;
    expect((await (await progress.GET()).json()).state.doneDays).toEqual([1, 2, 3]); // admin's own data untouched

    const users = await import("@/app/api/admin/users/route");
    const list = (await (await users.GET()).json()).users;
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ name: "Rahul", daysDone: 1, solved: 1 });

    const one = await import("@/app/api/admin/users/[id]/route");
    const view = await (await one.GET(req(`/api/admin/users/${rahul.id}`), { params: Promise.resolve({ id: rahul.id }) })).json();
    expect(view.state.solved).toEqual(["two-sum"]);

    // Friends can't use admin endpoints.
    as = { uid: rahul.id, role: "user", sid: "r1", sub: rahul.email };
    expect((await users.GET()).status).toBe(403);
    expect((await one.GET(req("/x"), { params: Promise.resolve({ id: rahul.id }) })).status).toBe(403);
  });

  it("disabling a friend blocks sign-in and ends their sessions; deleting removes their data", async () => {
    await signup(await invite(), "rahul@example.test");
    const { listUsers, readAccount } = await import("@/lib/server/account");
    const rahul = (await listUsers())[0];
    const { createSession, verifyAccess, rotate } = await import("@/lib/server/token");
    const t = await createSession(rahul.id, true, "ua", "ip");
    expect(await verifyAccess(t.access)).toMatchObject({ uid: rahul.id, role: "user" });

    as = ADMIN;
    const users = await import("@/app/api/admin/users/route");
    expect((await users.PATCH(req("/api/admin/users", "PATCH", { id: rahul.id, disabled: true }))).status).toBe(200);
    expect(await verifyAccess(t.access)).toBeNull();
    expect(await rotate(t.refresh, "ip")).toBeNull();
    expect((await readAccount(rahul.id)).sessions).toHaveLength(0);
    const { POST: login } = await import("@/app/api/auth/login/route");
    expect((await login(req("/api/auth/login", "POST", { email: "rahul@example.test", password: "Friend#Pass1" }))).status).toBe(403);

    expect((await users.DELETE(req("/api/admin/users", "DELETE", { id: rahul.id }))).status).toBe(200);
    expect(await listUsers()).toHaveLength(0);
  });

  it("refresh tokens can't be moved to another account", async () => {
    await signup(await invite(), "rahul@example.test");
    const { listUsers } = await import("@/lib/server/account");
    const rahul = (await listUsers())[0];
    const { createSession, rotate } = await import("@/lib/server/token");
    const t = await createSession(rahul.id, true, "ua", "ip");
    const [, sid, secret] = t.refresh.split(".");
    expect(await rotate(`admin.${sid}.${secret}`, "ip")).toBeNull();
    expect(await rotate(t.refresh, "ip")).not.toBeNull();
  });
});
