"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { plan } from "@/data/curriculum";
import { notify } from "@/lib/notify";

/**
 * Daily study reminder. Browsers only let a web app schedule this while the
 * app (or its installed window) is open, so the reminder fires at the chosen
 * time during an open session and at most once per day.
 */
export function useReminders() {
  const { state, derived: d } = useStore();
  const enabled = state?.reminder.enabled ?? false;
  const time = state?.reminder.time ?? "19:00";
  const focus = d?.focus ?? 1;
  const todayISO = d?.todayISO ?? "";
  const pending = !!d && d.today > 0 && !d.done.has(d.focus);

  useEffect(() => {
    if (!enabled || !pending || typeof Notification === "undefined") return;
    const tick = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const [h, m] = time.split(":").map(Number);
      const key = `dsa-reminded-${todayISO}`;
      if (now.getHours() * 60 + now.getMinutes() >= h * 60 + m && !localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        void notify("Time to study DSA", `Day ${focus}: ${plan[focus - 1].topic.title}`, `/lessons/${focus}`);
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [enabled, time, pending, focus, todayISO]);
}

/** Lets the service worker ask an open page to go somewhere (after a notification tap). */
export function useNotificationClicks() {
  useEffect(() => {
    const sw = navigator.serviceWorker;
    if (!sw) return;
    const on = (e: MessageEvent) => {
      const url = e.data?.type === "OPEN_URL" ? String(e.data.url) : "";
      if (url.startsWith("/") && !url.startsWith("//")) location.assign(url);
    };
    sw.addEventListener("message", on);
    return () => sw.removeEventListener("message", on);
  }, []);
}
