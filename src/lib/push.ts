"use client";

import { api } from "./api";

/**
 * Server push for daily reminders. Once a device is registered, the server sends the
 * reminder at the learner's time even when the app is closed (Android/desktop; iPhone
 * when the app is installed to the Home Screen).
 */
const FLAG = "dsa-push-active";

export const pushSupported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
export const pushActive = () => globalThis.localStorage?.getItem(FLAG) === "1";

const toKey = (b64: string) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

/** Subscribes this device and tells the server. Returns an error message, or null on success. */
export async function registerPush(): Promise<string | null> {
  if (!pushSupported()) return /iPhone|iPad/.test(navigator.userAgent) ? "On iPhone, install the app first (Share → Add to Home Screen), then turn reminders on from the installed app." : "This browser doesn't support push notifications.";
  if (Notification.permission !== "granted") return "Allow notifications first.";
  try {
    const info = (await (await api("/api/push")).json()) as { ready?: boolean; publicKey?: string; error?: string };
    if (!info.ready || !info.publicKey) return "Push isn't set up on the server yet (add VAPID keys in Vercel).";
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    // A subscription made with a different key can't receive our pushes: replace it.
    const want = toKey(info.publicKey);
    const have = sub?.options.applicationServerKey ? new Uint8Array(sub.options.applicationServerKey) : null;
    if (sub && (!have || have.length !== want.length || have.some((b, i) => b !== want[i]))) {
      await sub.unsubscribe();
      sub = null;
    }
    sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: want });
    const res = await api("/api/push", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    });
    if (!res.ok) return ((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Couldn't register this device.";
    localStorage.setItem(FLAG, "1");
    return null;
  } catch (e) {
    return `Couldn't turn on push: ${(e as Error).message}`;
  }
}

/** Sends a test push from the server after `delay` seconds (close the app to see it arrive). */
export async function serverTestPush(delay = 0): Promise<string> {
  const res = await api(`/api/push/test?delay=${delay}`, { method: "POST", keepalive: true });
  const d = (await res.json().catch(() => ({}))) as { error?: string; sent?: number };
  return res.ok ? `Sent to ${d.sent} device${d.sent === 1 ? "" : "s"}.` : (d.error ?? "Test failed.");
}
