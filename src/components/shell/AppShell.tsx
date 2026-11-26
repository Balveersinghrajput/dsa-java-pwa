"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Menu, Search, X } from "lucide-react";
import { signOut } from "@/hooks/useAccount";
import { StoreProvider, useStore } from "@/lib/store";
import { useReminders } from "@/hooks/useReminders";
import { useSessionKeepAlive } from "@/hooks/useSessionKeepAlive";
import { PaletteProvider, usePalette } from "./CommandPalette";
import Sidebar, { InstallButton } from "./Sidebar";
import { Bellbutton, InitialAvatar, Logo, SearchButton, TopActions } from "./bits";
import { TimerPill } from "@/components/timer/StudyTimer";
import { MOBILE_NAV, NAV, isActive } from "./nav";
import { useNavItems } from "./useNav";
import { Skeleton } from "@/components/ui";

function Loading() {
  return (
    <div className="flex min-h-dvh">
      <div className="hidden w-[264px] bg-navy lg:block" />
      <div className="flex-1 space-y-5 p-6 lg:p-8">
        <Skeleton className="h-11 max-w-xl" />
        <Skeleton className="h-10 w-80" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}

function MobileTop({ onMenu }: { onMenu: () => void }) {
  const { open } = usePalette();
  const { state, derived } = useStore();
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-navy pt-[env(safe-area-inset-top)] text-white shadow-[0_8px_24px_-16px_rgb(11_20_55/0.9)] lg:hidden">
      <div className="flex h-14 items-center gap-0.5 px-1.5 min-[400px]:gap-1 sm:px-4">
        <button onClick={onMenu} aria-label="Open menu" className="press grid h-10 w-10 place-items-center rounded-xl hover:bg-white/10">
          <Menu className="h-[22px] w-[22px]" />
        </button>
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5 px-1" aria-label="DSA in Java — home">
          <Logo size={32} />
          <span className={`min-w-0 leading-tight ${state?.timer.startedAt || state?.timer.elapsedMs ? "hidden min-[420px]:block" : "hidden min-[340px]:block"}`}>
            <span className="block truncate text-[15px] font-bold tracking-tight">DSA in Java</span>
            {derived && <span className="block truncate text-[11px] text-white/60">Day {derived.focus} · 🔥 {derived.streak} day streak</span>}
          </span>
        </Link>
        {state && <TimerPill compact />}
        <button onClick={open} aria-label="Search" className="press grid h-10 w-10 place-items-center rounded-xl hover:bg-white/10"><Search className="h-5 w-5" /></button>
        <Bellbutton onDark />
        <Link href="/profile" aria-label="Profile" className="ml-0.5 rounded-full ring-2 ring-white/15"><InitialAvatar name={state?.name ?? "L"} size={32} /></Link>
      </div>
    </header>
  );
}

/** Slide-in side menu for phones and tablets. */
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navItems = useNavItems();
  const pathname = usePathname();
  const { state, derived } = useStore();
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", on);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-[#060b20]/55 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-label="Menu"
        className={`no-scrollbar absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col overflow-y-auto bg-navy px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] text-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 px-1">
          <Logo size={42} />
          <span className="min-w-0 flex-1">
            <span className="block text-[18px] leading-tight font-bold tracking-tight">DSA in Java</span>
            <span className="block text-[12px] text-white/65">From Beginner to Advanced</span>
          </span>
          <button onClick={onClose} aria-label="Close menu" className="press grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>

        {state && derived && (
          <Link href="/progress" onClick={onClose} className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <span className="relative grid h-12 w-12 flex-none place-items-center rounded-full" style={{ background: `conic-gradient(#6366f1 ${derived.pct * 3.6}deg, rgb(255 255 255 / .12) 0)` }}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-[11px] font-bold">{Math.round(derived.pct)}%</span>
            </span>
            <span className="min-w-0 text-[12px] text-white/65">
              <b className="block text-[14px] text-white">Day {derived.focus} of {derived.calendar.length}</b>
              {state.doneDays.length} days done · 🔥 {derived.streak} streak
            </span>
          </Link>
        )}

        <nav className="mt-4 space-y-1" aria-label="All sections">
          {navItems.map(({ href, label, icon: I }, k) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`press flex h-11 items-center gap-3.5 rounded-xl px-3.5 text-[14.5px] font-medium transition-all duration-300 ${active ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgb(79_70_229/0.8)]" : "text-white/80 hover:bg-white/[0.06]"} ${open ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"}`}
                style={{ transitionDelay: open ? `${60 + k * 18}ms` : "0ms" }}
              >
                <I className="h-[19px] w-[19px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-5">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <span className="text-[12.5px] text-white/70">Learn offline, anytime.</span>
            <InstallButton />
          </div>
          <div className="flex items-stretch gap-2">
            <Link href="/profile" onClick={onClose} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <InitialAvatar name={state?.name ?? "L"} size={38} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{state?.name ?? "Learner"}</span>
                <span className="block text-[11.5px] text-white/60">View profile</span>
              </span>
            </Link>
            <button onClick={() => signOut()} aria-label="Sign out" className="press flex w-20 flex-none flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/75 hover:bg-rose/20">
              <LogOut className="h-[18px] w-[18px]" /> Sign out
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const items = NAV.filter((n) => MOBILE_NAV.includes(n.href));
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="Main">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, label, short, icon: I }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`press relative flex flex-col items-center gap-1 pt-2 pb-1.5 text-[10.5px] font-semibold ${active ? "text-primary" : "text-muted"}`}>
              <span className={`grid h-8 w-14 place-items-center rounded-full transition-colors duration-300 ${active ? "bg-primary-soft" : ""}`}>
                <I className="h-[21px] w-[21px]" />
              </span>
              {short ?? label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const AUTH_PAGES = ["/login", "/forgot", "/reset", "/signup"];

function Frame({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [pathname]);
  useReminders();
  useSessionKeepAlive(!AUTH_PAGES.includes(pathname));
  // Login, forgot and reset pages are full-screen, without the app chrome.
  if (AUTH_PAGES.includes(pathname)) return <>{children}</>;
  if (!state) return <Loading />;
  const isDashboard = pathname === "/";
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileTop onMenu={() => setMenu(true)} />
        {!isDashboard && (
          <div data-print-hide className="sticky top-0 z-30 hidden items-center gap-4 border-b border-line bg-bg/85 px-8 py-3 backdrop-blur-xl lg:flex">
            <SearchButton className="max-w-xl" />
            <div className="ml-auto"><TopActions /></div>
          </div>
        )}
        <main key={pathname} className="page px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-6 lg:pb-10">{children}</main>
      </div>
      <MobileNav />
      <MobileDrawer open={menu} onClose={() => setMenu(false)} />
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <PaletteProvider>
        <Frame>{children}</Frame>
      </PaletteProvider>
    </StoreProvider>
  );
}
