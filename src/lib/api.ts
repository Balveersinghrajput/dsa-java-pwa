"use client";

/**
 * fetch() for our own API. When the 15-minute access token has expired the
 * server answers 401; we then refresh once (shared by all parallel calls) and
 * retry. If refreshing fails the user is sent to the login page.
 */
let refreshing: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => setTimeout(() => (refreshing = null), 0));
  return refreshing;
}

export function toLogin() {
  const next = location.pathname + location.search;
  location.href = `/login${next && next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;
}

export async function api(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, { credentials: "same-origin", ...init });
  if (res.status !== 401 || url.startsWith("/api/auth/login")) return res;
  if (await refreshSession()) return fetch(url, { credentials: "same-origin", ...init });
  toLogin();
  return res;
}

/** JSON helper: throws Error(message) on failure. */
export async function apiJson<T = Record<string, unknown>>(url: string, data?: unknown, method = data === undefined ? "GET" : "POST"): Promise<T> {
  const res = await api(url, {
    method,
    headers: data === undefined ? undefined : { "content-type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Request failed (${res.status})`);
  return json as T;
}
