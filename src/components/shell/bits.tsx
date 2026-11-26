"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Code, Flame, Search } from "lucide-react";
import { useDerived } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import { usePalette } from "./CommandPalette";
import { TimerPill } from "@/components/timer/StudyTimer";

export function Logo({ size = 46 }: { size?: number }) {
  return (
    <span className="grid flex-none place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4338ca] text-white shadow-[0_8px_20px_-6px_rgb(79_70_229/0.7)]" style={{ width: size, height: size }}>
      <Code className="h-[55%] w-[55%]" strokeWidth={2.4} />
    </span>
  );
}

/** Friendly illustrated avatar (no photo needed). */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span className="relative grid flex-none place-items-center overflow-hidden rounded-full bg-[#e8ebff]" style={{ width: size, height: size }} aria-label={name}>
      <svg viewBox="0 0 40 40" className="h-full w-full">
        <rect width="40" height="40" fill="#e0e4ff" />
        <path d="M6 40c1-8 7-12 14-12s13 4 14 12z" fill="#4f46e5" />
        <circle cx="20" cy="18" r="8.5" fill="#f6c9a4" />
        <path d="M11.5 16c0-6 4-9 8.5-9s9 2.5 8.5 9c-1.5-2.5-4-3.5-8.5-3.5s-7 1-8.5 3.5z" fill="#1e1b4b" />
        <circle cx="16.6" cy="18.5" r="2.6" fill="none" stroke="#1e1b4b" strokeWidth="1.1" />
        <circle cx="23.4" cy="18.5" r="2.6" fill="none" stroke="#1e1b4b" strokeWidth="1.1" />
        <path d="M19.2 18.5h1.6" stroke="#1e1b4b" strokeWidth="1.1" />
        <path d="M17.5 22.5c1.5 1.2 3.5 1.2 5 0" stroke="#9a4f2f" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function InitialAvatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span className="grid flex-none place-items-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#4338ca] font-bold text-white" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {(name.trim()[0] ?? "L").toUpperCase()}
    </span>
  );
}

export function SearchButton({ className = "" }: { className?: string }) {
  const { open } = usePalette();
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)), []);
  return (
    <button
      onClick={open}
      className={`press group flex h-11 w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 text-left text-[13.5px] text-muted shadow-card hover:border-primary-faint ${className}`}
    >
      <Search className="h-[18px] w-[18px] text-ink-2" />
      <span className="flex-1 truncate">Search topics, lessons, problems...</span>
      <kbd className="hidden rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] text-ink-2 sm:block">{mac ? "⌘" : "Ctrl"} K</kbd>
    </button>
  );
}

export function StreakPill() {
  const d = useDerived();
  return (
    <Link href="/progress" className="press flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-[14px] font-bold whitespace-nowrap shadow-card hover:border-primary-faint">
      <Flame className="flicker h-[18px] w-[18px] fill-[#fb923c] text-[#ea580c]" />
      Streak {d.streak}
    </Link>
  );
}

export function Bellbutton({ onDark = false }: { onDark?: boolean }) {
  const d = useDerived();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const on = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", on);
    return () => document.removeEventListener("mousedown", on);
  }, [open]);
  const n = d.notifications.length;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label={`Notifications (${n})`} aria-expanded={open} className={`press relative grid place-items-center rounded-xl ${onDark ? "h-10 w-10 text-white hover:bg-white/10" : "h-11 w-11 text-ink-2 hover:bg-surface"}`}>
        <Bell className="h-[21px] w-[21px]" />
        {n > 0 && <span className={`pop absolute top-1 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose px-1 text-[10px] font-bold text-white ring-2 ${onDark ? "ring-navy" : "ring-bg"}`}>{n}</span>}
      </button>
      {open && (
        <div className="scale-in absolute right-0 z-40 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-line bg-surface text-ink shadow-pop">
          <p className="border-b border-line px-4 py-3 text-[13px] font-bold">Notifications</p>
          {n === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted">You&apos;re all caught up.</p>
          ) : (
            <ul>
              {d.notifications.map((x) => (
                <li key={x.id}>
                  <Link href={x.href} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 text-[13px] hover:bg-surface-2">
                    <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-primary" />
                    {x.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function TopActions() {
  const { state } = useAppState();
  return (
    <div className="flex items-center gap-2">
      <TimerPill />
      <StreakPill />
      <Bellbutton />
      <Link href="/profile" aria-label="Your profile" className="press ml-1 rounded-full ring-2 ring-transparent hover:ring-primary-faint">
        <InitialAvatar name={state.name} size={38} />
      </Link>
    </div>
  );
}
