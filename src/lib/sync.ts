"use client";

import { useEffect, useRef, useState } from "react";
import { refreshSession } from "./api";
import type { AppState } from "@/types";

/**
 * Keeps progress in sync with the server so it follows you to every device.
 *
 *  - The device keeps working offline (IndexedDB is still the first copy).
 *  - Every local change stamps `changedAt`; changes are pushed ~1.5 s later.
 *  - On load, on focus and when coming back online the server copy is pulled;
 *    whichever copy changed last wins.
 */
export type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "signed-out" | "error";

const META = "dsa-sync-changed-at";
const PUBLIC = ["/login", "/forgot", "/reset", "/signup"];

/** Which account this device's local data belongs to ("admin" keeps the original keys). */
let currentUid = "admin";
export const setSyncUser = (uid: string) => (currentUid = uid);
const metaKey = () => (currentUid === "admin" ? META : `${META}:${currentUid}`);

export const readChangedAt = () => Number(globalThis.localStorage?.getItem(metaKey()) || 0);
export const writeChangedAt = (t: number) => {
  try {
    localStorage.setItem(metaKey(), String(t));
  } catch {
    /* private mode */
  }
};

/** fetch with one silent token refresh on 401 (never redirects; sync is a background job). */
async function call(url: string, init?: RequestInit) {
  let res = await fetch(url, { credentials: "same-origin", cache: "no-store", ...init });
  if (res.status === 401 && (await refreshSession())) res = await fetch(url, { credentials: "same-origin", cache: "no-store", ...init });
  return res;
}

interface Remote {
  state: AppState | null;
  updatedAt: number;
}

export function useServerSync(state: AppState | null, changedAt: React.RefObject<number>, adopt: (s: unknown, at: number) => void) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const pushedAt = useRef(0); // changedAt value last confirmed by the server
  const ready = useRef(false); // first pull finished
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(state);
  latest.current = state;

  const enabled = () => typeof location !== "undefined" && !PUBLIC.includes(location.pathname);

  const push = async () => {
    const s = latest.current;
    const at = changedAt.current;
    if (!s || !at || at <= pushedAt.current || !enabled()) return;
    if (!navigator.onLine) return setStatus("offline");
    setStatus("syncing");
    try {
      const res = await call("/api/progress", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: s, updatedAt: at }) });
      if (res.status === 409) {
        const r = (await res.json()) as Remote;
        if (r.state) adopt(r.state, r.updatedAt);
        pushedAt.current = r.updatedAt;
      } else if (res.status === 401) return setStatus("signed-out");
      else if (!res.ok) throw new Error(String(res.status));
      else pushedAt.current = Math.max(pushedAt.current, at);
      setStatus("synced");
      setLastSynced(Date.now());
    } catch {
      setStatus(navigator.onLine ? "error" : "offline");
    }
  };

  const pulling = useRef(false);
  const pull = async () => {
    if (!enabled() || pulling.current) return;
    pulling.current = true;
    try {
      await pullOnce();
    } finally {
      pulling.current = false;
    }
  };
  const pullOnce = async () => {
    if (!navigator.onLine) return setStatus("offline");
    setStatus("syncing");
    try {
      const res = await call("/api/progress");
      if (res.status === 401) return setStatus("signed-out");
      if (!res.ok) throw new Error(String(res.status));
      const r = (await res.json()) as Remote;
      ready.current = true;
      if (r.state && r.updatedAt > changedAt.current) {
        adopt(r.state, r.updatedAt); // another device changed it more recently
        pushedAt.current = r.updatedAt;
      } else if (changedAt.current > r.updatedAt || (!r.state && latest.current)) {
        if (!changedAt.current) changedAt.current = Date.now(); // first upload from this device
        await push();
        return;
      } else pushedAt.current = r.updatedAt;
      setStatus("synced");
      setLastSynced(Date.now());
    } catch {
      setStatus(navigator.onLine ? "error" : "offline");
    }
  };

  // First pull once local state has loaded.
  const loaded = state !== null;
  useEffect(() => {
    if (loaded) void pull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Push local changes (debounced).
  useEffect(() => {
    if (!state) return;
    if (!ready.current) return void pull(); // first pull hasn't succeeded yet (e.g. was offline)
    if (changedAt.current <= pushedAt.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void push(), 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Pull when the tab comes back; push right away when it's hidden or closed.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void pull();
      else flush();
    };
    const flush = () => {
      const s = latest.current;
      const at = changedAt.current;
      if (!s || !ready.current || at <= pushedAt.current || !enabled()) return;
      const body = JSON.stringify({ state: s, updatedAt: at });
      // keepalive lets the request finish after the page is gone (limited to 64 KB).
      if (body.length < 60_000) {
        fetch("/api/progress", { method: "PUT", headers: { "content-type": "application/json" }, body, keepalive: true, credentials: "same-origin" }).catch(() => {});
        pushedAt.current = at;
      }
    };
    const onOnline = () => void pull();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("online", onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, lastSynced, syncNow: pull };
}
