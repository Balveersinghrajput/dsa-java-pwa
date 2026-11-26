"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
const KEY = "dsa-theme";

const apply = (pref: ThemePref) => {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
};

/** Theme preference lives in localStorage (a lightweight preference). */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>("light");

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as ThemePref | null) ?? "light";
    setPref(saved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => apply((localStorage.getItem(KEY) as ThemePref | null) ?? "light");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const set = useCallback((p: ThemePref) => {
    localStorage.setItem(KEY, p);
    setPref(p);
    apply(p);
  }, []);

  return { pref, set };
}

/** Inline script for <head> so the right theme paints before React loads. */
export const themeScript = `(function(){try{var p=localStorage.getItem("${KEY}")||"light";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;
