"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Download, LogOut, Smartphone } from "lucide-react";
import { signOut } from "@/hooks/useAccount";
import { plan, totalProblems } from "@/data/curriculum";
import { useDerived } from "@/lib/derive";
import { useAppState } from "@/lib/store";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Modal, Ring } from "@/components/ui";
import { Avatar, Logo } from "./bits";
import { NAV, isActive } from "./nav";

export function InstallHelp({ open, onClose, isIOS }: { open: boolean; onClose: () => void; isIOS: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title="Install DSA in Java">
      <div className="space-y-4 text-[14px] text-ink-2">
        <p>Installing adds the app to your home screen. Lessons, notes and progress then open offline.</p>
        {isIOS ? (
          <ol className="list-decimal space-y-2 pl-5">
            <li>Open this site in Safari.</li>
            <li>Tap the Share button.</li>
            <li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li>
          </ol>
        ) : (
          <ol className="list-decimal space-y-2 pl-5">
            <li>Chrome or Edge on desktop: click the install icon at the right end of the address bar.</li>
            <li>Chrome on Android: open the ⋮ menu and choose <b>Install app</b>.</li>
            <li>The browser offers this only on HTTPS (or localhost) after the page has loaded once.</li>
          </ol>
        )}
      </div>
    </Modal>
  );
}

export function InstallButton({ className = "", onLight = false }: { className?: string; onLight?: boolean }) {
  const { canPrompt, installed, isIOS, install } = useInstallPrompt();
  const [help, setHelp] = useState(false);
  if (installed) return <span className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold ${onLight ? "bg-green-soft text-green" : "bg-white/10 text-white"} ${className}`}>✓ Installed</span>;
  return (
    <>
      <button
        onClick={() => (canPrompt ? install() : setHelp(true))}
        className={`press inline-flex h-9 flex-none items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-semibold whitespace-nowrap text-white hover:bg-primary-strong ${className}`}
      >
        <Download className="h-4 w-4" /> Install App
      </button>
      <InstallHelp open={help} onClose={() => setHelp(false)} isIOS={isIOS} />
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { state } = useAppState();
  const d = useDerived();

  return (
    <aside className="no-scrollbar sticky top-0 hidden h-dvh w-[264px] flex-none flex-col overflow-y-auto bg-navy px-4 pt-5 pb-4 text-white lg:flex">
      <Link href="/" className="flex items-center gap-3 px-1">
        <Logo />
        <span>
          <span className="block text-[19px] leading-tight font-bold tracking-tight">DSA in Java</span>
          <span className="block text-[12px] text-white/70">From Beginner to Advanced</span>
        </span>
      </Link>

      <nav className="mt-7 space-y-1" aria-label="Main">
        {NAV.map(({ href, label, icon: I }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`press group flex h-11 items-center gap-3.5 rounded-xl px-3.5 text-[14px] font-medium transition-colors ${
                active ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgb(79_70_229/0.8)]" : "text-white/80 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <I className={`h-[19px] w-[19px] transition-transform group-hover:scale-110 ${active ? "" : "text-white/75"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex gap-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-amber/15 text-amber"><Smartphone className="h-5 w-5" /></span>
            <div>
              <p className="text-[13px] font-semibold">PWA Ready</p>
              <p className="mt-0.5 text-[12px] leading-snug text-white/65">Install the app and learn offline, anytime, anywhere.</p>
            </div>
          </div>
          <InstallButton className="mt-3 ml-12" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[13px] font-semibold">Progress Overview</p>
          <div className="mt-3 flex items-center gap-4">
            <Ring pct={d.pct} size={84} stroke={7} track="rgb(255 255 255 / 0.12)" color="#6366f1">
              <span className="text-center leading-tight">
                <b className="block text-[16px]">{d.pct.toFixed(1)}%</b>
                <span className="text-[10px] text-white/60">Completed</span>
              </span>
            </Ring>
            <div className="space-y-2 text-[12px] text-white/60">
              <p><b className="block text-[13px] text-white">{state.doneDays.length} / {plan.length}</b>Days Completed</p>
              <p><b className="block text-[13px] text-white">{state.solved.length} / {totalProblems}</b>Problems Solved</p>
            </div>
          </div>
        </div>

        <div className="flex items-stretch gap-2">
        <Link href="/profile" className="press flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06]">
          <Avatar name={state.name} size={40} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-[14px] font-semibold">
              <span className="truncate">{state.name}</span>
              <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/80">Day {d.focus}</span>
            </span>
            <span className="block truncate text-[11.5px] text-white/60">{d.streak > 0 ? "Keep going! You're doing great." : "Start today. Small steps add up."}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-white/60" />
        </Link>
        <button onClick={() => signOut()} aria-label="Sign out" title="Sign out" className="press grid w-11 flex-none place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/70 hover:bg-rose/20 hover:text-white">
          <LogOut className="h-[18px] w-[18px]" />
        </button>
        </div>
      </div>
    </aside>
  );
}
