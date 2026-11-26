"use client";

import { useEffect } from "react";
import { refreshSession, toLogin } from "@/lib/api";

/**
 * Renews the 15-minute access token every 12 minutes while the app is open,
 * and right away when you come back to the tab, so you're never signed out mid-lesson.
 */
export function useSessionKeepAlive(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let last = Date.now();
    const renew = async () => {
      if (!navigator.onLine) return;
      last = Date.now();
      if (!(await refreshSession())) toLogin();
    };
    const id = setInterval(renew, 12 * 60_000);
    const onVisible = () => document.visibilityState === "visible" && Date.now() - last > 10 * 60_000 && renew();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);
}
