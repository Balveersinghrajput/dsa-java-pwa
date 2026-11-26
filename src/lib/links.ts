/** Helpers for links learners add to a day's resources. */

const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "www.youtube-nocookie.com", "youtube-nocookie.com"]);
const ID = /^[A-Za-z0-9_-]{11}$/;

/** A safe http(s) URL, or null. Adds https:// when the scheme is missing. */
export function cleanUrl(input: string): URL | null {
  const raw = input.trim();
  if (!raw || raw.length > 2000) return null;
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null; // blocks javascript:, data:…
    if (!u.hostname.includes(".")) return null;
    return u;
  } catch {
    return null;
  }
}

/** YouTube video id from any common link shape (watch, youtu.be, shorts, embed, live), else null. */
export function youTubeId(input: string): string | null {
  const u = cleanUrl(input);
  if (!u || !YT_HOSTS.has(u.hostname.toLowerCase())) return null;
  if (u.hostname.endsWith("youtu.be")) {
    const id = u.pathname.slice(1).split("/")[0];
    return ID.test(id) ? id : null;
  }
  const v = u.searchParams.get("v");
  if (v && ID.test(v)) return v;
  const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
