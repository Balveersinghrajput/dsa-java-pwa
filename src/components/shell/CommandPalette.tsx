"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BookOpenText, FileText, LayoutTemplate, PlayCircle, Search, CornerDownLeft, Compass } from "lucide-react";
import type { SearchHit } from "@/lib/search";
import { LeetIcon } from "./nav";

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const usePalette = () => useContext(Ctx);

const kindIcon: Record<SearchHit["kind"], ReactNode> = {
  lesson: <BookOpenText className="h-4 w-4" />,
  problem: <LeetIcon className="h-4 w-4" />,
  video: <PlayCircle className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  template: <LayoutTemplate className="h-4 w-4" />,
  page: <Compass className="h-4 w-4" />,
};

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) && !(e.target as HTMLElement)?.isContentEditable) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {isOpen && <Palette onClose={() => setOpen(false)} />}
    </Ctx.Provider>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const [engine, setEngine] = useState<null | ((q: string) => SearchHit[])>(null);
  useEffect(() => {
    import("@/lib/search").then((m) => setEngine(() => m.searchAll));
  }, []);
  const hits = useMemo(() => (engine ? engine(q) : []), [q, engine]);

  useEffect(() => {
    input.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  useEffect(() => setSel(0), [q]);

  const go = (h: SearchHit) => {
    onClose();
    if (h.external) window.open(h.href, "_blank", "noopener,noreferrer");
    else router.push(h.href);
  };

  return (
    <div className="fade fixed inset-0 z-[60] flex items-start justify-center bg-[#0b1437]/45 p-3 pt-[10vh] backdrop-blur-sm" onClick={onClose}>
      <div className="scale-in w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-pop" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, hits.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              }
              if (e.key === "Enter" && hits[sel]) go(hits[sel]);
            }}
            placeholder="Search lessons, topics, problems, videos..."
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
            aria-label="Search"
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-muted">Esc</kbd>
        </div>
        <ul className="thin-scroll max-h-[60vh] overflow-y-auto p-2">
          {!engine && <li className="px-3 py-8 text-center text-[13.5px] text-muted">Loading search…</li>}
          {engine && hits.length === 0 && <li className="px-3 py-8 text-center text-[13.5px] text-muted">No results for “{q}”.</li>}
          {hits.map((h, i) => (
            <li key={`${h.kind}-${h.href}`}>
              <button
                onMouseEnter={() => setSel(i)}
                onClick={() => go(h)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === sel ? "bg-primary-soft" : ""}`}
              >
                <span className={`grid h-8 w-8 flex-none place-items-center rounded-lg ${i === sel ? "bg-primary text-white" : "bg-surface-2 text-ink-2"}`}>{kindIcon[h.kind]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-ink">{h.title}</span>
                  <span className="block truncate text-[12px] text-muted">{h.sub}</span>
                </span>
                {i === sel && <CornerDownLeft className="h-4 w-4 text-primary" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
