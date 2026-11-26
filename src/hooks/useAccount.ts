"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface Account {
  id: string;
  role: "admin" | "user";
  name: string;
  email: string;
  accessExpires: number;
  sessionExpires: number | null;
  since: number | null;
}

let cache: Account | null = null;

/** The signed-in account (from the server — auth cookies are HttpOnly). */
export function useAccount() {
  const [account, setAccount] = useState<Account | null>(cache);
  useEffect(() => {
    let alive = true;
    api("/api/auth/me", { cache: "no-store" })
      .then(async (r) => {
        if (r.ok && alive) {
          cache = await r.json();
          setAccount(cache);
        }
      })
      .catch(() => {
        /* offline: keep cached value */
      });
    return () => {
      alive = false;
    };
  }, []);
  return account;
}

export async function signOut() {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  cache = null;
  location.href = "/login";
}
