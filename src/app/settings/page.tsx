"use client";

import { notify } from "@/lib/notify";
import { pushActive, registerPush } from "@/lib/push";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, CalendarClock, Database, Download, Monitor, Moon, Smartphone, Sun, Trash2, Upload, User, WifiOff } from "lucide-react";
import { plan } from "@/data/curriculum";
import { guides } from "@/data/articles";
import { fmtMinutes, leaveBalance, parseISODate, toISODate } from "@/lib/schedule";
import { scheduleTotal, useDerived } from "@/lib/derive";
import { DEFAULT_SCHEDULE, normalise, useAppState } from "@/lib/store";
import { downloadText } from "@/lib/download";
import { useTheme, type ThemePref } from "@/hooks/useTheme";
import { Button, Card, PageHeader, Segmented } from "@/components/ui";
import { InstallButton } from "@/components/shell/Sidebar";
import type { Schedule } from "@/types";

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-line py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[14px] font-semibold">{label}</p>
        {hint && <p className="text-[12.5px] text-muted">{hint}</p>}
      </div>
      <div className="flex-none">{children}</div>
    </div>
  );
}

const WEEKDAYS = [
  { d: 1, l: "Mon" }, { d: 2, l: "Tue" }, { d: 3, l: "Wed" }, { d: 4, l: "Thu" }, { d: 5, l: "Fri" }, { d: 6, l: "Sat" }, { d: 0, l: "Sun" },
];
const fmt = (dt: Date) => dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Pick weekly holidays (up to 2) and manage sick leave (2 days per 2 weeks). */
function HolidaysAndLeave() {
  const { state, setRestDays, takeLeave, cancelLeave, setAutoLeave } = useAppState();
  const d = useDerived();
  const [pick, setPick] = useState(d.todayISO);
  const toggle = (day: number) => {
    const on = state.restDays.includes(day);
    if (on) setRestDays(state.restDays.filter((x) => x !== day));
    else if (state.restDays.length < 2) setRestDays([...state.restDays, day]);
  };
  const pickBal = leaveBalance(d.startDate, state.leaves, pick);
  const pickKind = d.dayRules.kind(parseISODate(pick));
  const todayKind = d.dayRules.kind(parseISODate(d.todayISO));
  const recent = state.leaves.filter((l) => l >= toISODate(new Date(Date.now() - 30 * 86400000)));

  return (
    <>
      <div className="border-b border-line py-4">
        <p className="text-[14px] font-semibold">Weekly holidays</p>
        <p className="text-[12.5px] text-muted">
          Pick up to 2 days off each week — any days you like. {7 - state.restDays.length} study days per week
          {state.restDays.length ? ` · off: ${WEEKDAYS.filter((w) => state.restDays.includes(w.d)).map((w) => w.l).join(", ")}` : " · no holidays"}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {WEEKDAYS.map((w) => {
            const on = state.restDays.includes(w.d);
            const full = !on && state.restDays.length >= 2;
            return (
              <button key={w.d} onClick={() => toggle(w.d)} disabled={full} aria-pressed={on} className={`press h-10 min-w-14 rounded-xl px-3 text-[13px] font-bold ${on ? "bg-amber text-white" : "border border-line bg-surface text-ink-2 hover:border-primary-faint"} disabled:cursor-not-allowed disabled:opacity-70`}>
                {w.l}
              </button>
            );
          })}
        </div>
        {state.restDays.length >= 2 && <p className="mt-2 text-[12px] text-muted">Two holidays chosen. Tap one to swap it for another day.</p>}
      </div>

      <div className="border-b border-line py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[14px] font-semibold">Sick leave</p>
            <p className="text-[12.5px] text-muted">2 leave days every 2 weeks. A leave day isn&apos;t counted as missed — your lessons simply move one study day later.</p>
          </div>
          <span className="rounded-xl bg-primary-soft px-3 py-1.5 text-[12.5px] font-bold text-primary">
            {d.leave.left} of 2 left · {d.leave.from.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}–{d.leave.to.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => takeLeave(d.todayISO, d.startDate)}
            disabled={d.leave.left === 0 || todayKind !== "study"}
          >
            Take leave today
          </Button>
          <span className="text-[12px] text-muted">or on</span>
          <input type="date" value={pick} min={d.startDate} onChange={(e) => e.target.value && setPick(e.target.value)} className={input} aria-label="Leave date" />
          <Button variant="outline" onClick={() => takeLeave(pick, d.startDate)} disabled={pickBal.left === 0 || pickKind !== "study"}>Add leave</Button>
        </div>
        {(pickBal.left === 0 || pickKind !== "study") && (
          <p className="mt-1.5 text-[12px] text-muted">
            {pickKind === "rest" ? "That date is already a weekly holiday." : pickKind !== "study" ? "That date is already a leave day." : "No leave left in that 2-week block."}
          </p>
        )}
        {recent.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {recent.map((l) => (
              <li key={l} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-soft px-2.5 py-1 text-[12.5px] font-semibold text-amber">
                {parseISODate(l).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                <button onClick={() => cancelLeave(l)} aria-label={`Cancel leave on ${l}`} className="rounded px-1 hover:bg-amber/20">×</button>
              </li>
            ))}
          </ul>
        )}
        <label className="mt-4 flex items-start gap-3 rounded-xl bg-surface-2 p-3">
          <input type="checkbox" checked={state.autoLeave} onChange={(e) => setAutoLeave(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--primary)]" />
          <span className="text-[13px]">
            <b className="block">Use unused leave at the end of each 2-week block</b>
            <span className="text-muted">If you don&apos;t need your sick days, they become extra rest days at the end of the block (a longer weekend). Your target date is calculated with them included.</span>
          </span>
        </label>
      </div>
    </>
  );
}

/** Your own target finish date. */
function TargetRow() {
  const { state, setTargetDate } = useAppState();
  const d = useDerived();
  const pace = d.targetFinish ? (
    <span className={`inline-flex rounded-lg px-2.5 py-1 text-[12.5px] font-bold ${d.onTrack ? "bg-green-soft text-green" : "bg-rose-soft text-rose"}`}>
      {d.onTrack ? "On track" : `Behind — expected ${fmt(d.expectedFinish)}`}
    </span>
  ) : null;
  return (
    <div className="border-b border-line py-4">
      <p className="text-[14px] font-semibold">Target finish</p>
      <p className="text-[12.5px] text-muted">
        With your holidays{state.autoLeave ? " and end-of-block leave" : ""}, the plan finishes on <b className="text-ink">{fmt(d.finish)}</b>. You&apos;re expected to finish on <b className="text-ink">{fmt(d.expectedFinish)}</b>.
      </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input type="date" value={state.targetDate ?? ""} min={d.todayISO} onChange={(e) => setTargetDate(e.target.value || null)} className={input} aria-label="My target finish date" />
          <Button variant="outline" onClick={() => setTargetDate(toISODate(d.finish))}>Use plan date</Button>
          {state.targetDate && <Button variant="ghost" onClick={() => setTargetDate(null)}>Clear</Button>}
          {pace}
        </div>
    </div>
  );
}

function OfflineDownload() {
  const [status, setStatus] = useState<string | null>(null);
  const run = async () => {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      setStatus("Offline saving needs the production app (service worker not active yet — reload once).");
      return;
    }
    const urls = [...plan.map((d) => `/lessons/${d.day}`), ...guides.map((g) => `/resources/articles/${g.id}`)];
    const ch = new MessageChannel();
    ch.port1.onmessage = (e) => setStatus(e.data.finished ? `Saved ${e.data.done} pages for offline use ✓` : `Saving… ${e.data.done}/${e.data.total}`);
    navigator.serviceWorker.controller.postMessage({ type: "CACHE_URLS", urls }, [ch.port2]);
    setStatus(`Saving… 0/${urls.length}`);
  };
  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <Button variant="outline" onClick={run}><Download className="h-4 w-4" /> Download all</Button>
      {status && <span className="text-[12px] text-muted">{status}</span>}
    </div>
  );
}

const input = "h-10 rounded-xl border border-line bg-surface px-3 text-[14px] outline-none focus:border-primary";

export default function SettingsPage() {
  const { state, update, replace, reset } = useAppState();
  const d = useDerived();
  const theme = useTheme();
  const file = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pushOk, setPushOk] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted" && pushActive()) setPushOk(true);
    setOnline(navigator.onLine);
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);

  const setSched = (k: keyof Schedule, v: number) => update((s) => ({ ...s, schedule: { ...s.schedule, [k]: Math.max(0, Math.min(600, Math.round(v))) } }));

  const exportData = () => {
    downloadText(`dsa-java-backup-${toISODate(new Date())}.json`, JSON.stringify(state, null, 2), "application/json");
    setMsg("Backup downloaded.");
  };
  const importData = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      if (typeof data !== "object" || !data || !("startDate" in data)) throw new Error("not a backup");
      replace(normalise(data));
      setMsg("Backup restored.");
    } catch {
      setMsg("That file isn't a valid DSA in Java backup.");
    }
  };
  const fmtTime = (t: string) => new Date(`2000-01-01T${t}`).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  /** One switch: asks for permission if needed, registers this device for pushes, and reports plainly. */
  const toggleReminder = async () => {
    if (state.reminder.enabled) {
      update((s) => ({ ...s, reminder: { ...s.reminder, enabled: false } }));
      setPushOk(false);
      return setPushMsg("Reminder turned off.");
    }
    if (typeof Notification === "undefined") return setPushMsg("This browser can't show notifications.");
    const p = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (p !== "granted") return setPushMsg("Notifications are blocked. Allow them for this site in your phone's browser settings, then try again.");
    update((s) => ({ ...s, reminder: { ...s.reminder, enabled: true } }));
    setPushMsg("Setting up…");
    const err = await registerPush();
    setPushOk(!err);
    setPushMsg(err ?? `✓ Done! You'll get a notification at ${fmtTime(state.reminder.time)} every study day.`);
    if (!err) void notify("Reminder is on ✅", `We'll remind you at ${fmtTime(state.reminder.time)}.`, "/settings", "test");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Your study schedule, appearance, reminders and data." />
      {msg && <p className="fade mb-4 rounded-xl border border-primary-faint bg-primary-soft px-4 py-3 text-[13.5px]" role="status">{msg}</p>}

      <div className="space-y-5">
        <Card i={1} className="flex items-center gap-3 p-4">
          <User className="h-5 w-5 flex-none text-primary" />
          <p className="flex-1 text-[13.5px] text-ink-2">Your name, email, password and sign-out are on your profile.</p>
          <Button variant="outline" size="sm" href="/profile">Open profile</Button>
        </Card>

        <Card i={2} className="px-5 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
            <h2 className="flex items-center gap-2 text-[15px] font-bold"><CalendarClock className="h-4 w-4 text-primary" /> Study schedule</h2>
          </div>
            <Row label="Start date" hint={`Day 1 = ${parseISODate(state.startDate).toLocaleDateString()}. Every lesson date recalculates automatically.`}>
              <div className="flex gap-2">
                <input type="date" value={state.startDate} onChange={(e) => e.target.value && update((s) => ({ ...s, startDate: e.target.value }))} className={input} aria-label="Start date" />
                <Button variant="outline" onClick={() => update((s) => ({ ...s, startDate: toISODate(new Date()) }))}>Today</Button>
              </div>
            </Row>
          <TargetRow />
          <HolidaysAndLeave />
          <div className="border-b border-line py-4">
            <p className="text-[14px] font-semibold">Daily study time</p>
            <p className="text-[12.5px] text-muted">Minutes per activity. Total today: <b className="text-ink">{fmtMinutes(scheduleTotal(state.schedule))}</b></p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([["learn", "Learn concepts"], ["implement", "Java implementation"], ["practice", "LeetCode practice"], ["revise", "Revision"]] as [keyof Schedule, string][]).map(([k, label]) => (
                <label key={k} className="block">
                  <span className="text-[12px] font-semibold text-ink-2">{label}</span>
                  <input type="number" min={0} max={600} step={5} value={state.schedule[k]} onChange={(e) => setSched(k, Number(e.target.value))} className={`${input} mt-1 w-full`} />
                </label>
              ))}
            </div>
            <button onClick={() => update((s) => ({ ...s, schedule: { ...DEFAULT_SCHEDULE } }))} className="mt-3 text-[12.5px] font-semibold text-primary hover:underline">Reset to default (90 + 30 + 90 + 15 = 3 h 45 min)</button>
          </div>
          <div className="grid grid-cols-2 gap-3 py-4 text-[13px] sm:grid-cols-4">
            <div><p className="text-muted">Planned finish</p><p className="font-bold">{d.finish.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></div>
            <div><p className="text-muted">Expected finish</p><p className="font-bold text-primary">{d.expectedFinish.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></div>
            <div><p className="text-muted">Missed days</p><p className="font-bold">{d.missed.length}</p></div>
            <div><p className="text-muted">Total course time</p><p className="font-bold">{Math.round((scheduleTotal(state.schedule) * plan.length) / 60)} h</p></div>
          </div>
        </Card>

        <Card i={3} className="px-5 py-2">
          <h2 className="flex items-center gap-2 pt-3 text-[15px] font-bold"><Sun className="h-4 w-4 text-primary" /> Appearance</h2>
          <Row label="Theme" hint="Dark mode is optional">
            <Segmented<ThemePref> options={[{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }, { id: "system", label: "System" }]} value={theme.pref} onChange={theme.set} />
          </Row>
          <div className="flex gap-2 pb-3 text-muted">{[Sun, Moon, Monitor].map((I, k) => <I key={k} className="h-4 w-4" />)}</div>
        </Card>

        <Card i={4} className="px-5 py-2">
          <h2 className="flex items-center gap-2 pt-3 text-[15px] font-bold"><Bell className="h-4 w-4 text-primary" /> Daily reminder</h2>
          <Row label="Remind me to study" hint="A notification pops up on this device at your time, even when the app is closed. Skipped on holidays and days you've already studied.">
            <div className="flex items-center gap-3">
              <input type="time" value={state.reminder.time} onChange={(e) => update((s) => ({ ...s, reminder: { ...s.reminder, time: e.target.value } }))} className={input} aria-label="Reminder time" />
              <button
                role="switch"
                aria-checked={state.reminder.enabled}
                aria-label="Daily reminder"
                onClick={toggleReminder}
                className={`press relative h-8 w-14 flex-none rounded-full transition-colors ${state.reminder.enabled ? "bg-primary" : "bg-line"}`}
              >
                <span className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${state.reminder.enabled ? "translate-x-6" : ""}`} />
              </button>
            </div>
          </Row>
          {pushMsg && <p className={`pb-3 text-[12.5px] ${pushOk ? "text-green" : "text-amber"}`} role="status">{pushMsg}</p>}
        </Card>

        <Card i={5} className="px-5 py-2">
          <h2 className="flex items-center gap-2 pt-3 text-[15px] font-bold"><Smartphone className="h-4 w-4 text-primary" /> App &amp; offline</h2>
          <Row label="Install as an app" hint="Adds DSA in Java to your home screen or desktop.">
            <InstallButton onLight />
          </Row>
          <Row label="Save every lesson for offline" hint="Caches all 152 lessons and 78 guides so they open without internet (installed app or browser).">
            <OfflineDownload />
          </Row>
          <Row label="Connection" hint="Lessons, notes, progress and templates work offline. Running Java and videos need internet.">
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold ${online ? "bg-green-soft text-green" : "bg-amber-soft text-amber"}`}>{online ? "Online" : <><WifiOff className="h-4 w-4" /> Offline</>}</span>
          </Row>
        </Card>

        <Card i={6} className="px-5 py-2">
          <h2 className="flex items-center gap-2 pt-3 text-[15px] font-bold"><Database className="h-4 w-4 text-primary" /> Your data</h2>
          <p className="pt-2 text-[12.5px] text-muted">Everything is stored privately on this device (IndexedDB). There is no account, so nothing syncs automatically — use a backup file to move your progress to another device.</p>
          <Row label="Backup" hint="Download all progress, notes and solutions as JSON">
            <Button variant="outline" onClick={exportData}><Download className="h-4 w-4" /> Export</Button>
          </Row>
          <Row label="Restore" hint="Load a backup file (replaces current data)">
            <>
              <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
              <Button variant="outline" onClick={() => file.current?.click()}><Upload className="h-4 w-4" /> Import</Button>
            </>
          </Row>
          <Row label="Reset everything" hint="Erases progress, notes, bookmarks and solutions on this device">
            {confirm ? (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button>
                <Button variant="danger" onClick={() => { reset(); setConfirm(false); setMsg("All data was reset."); }}><Trash2 className="h-4 w-4" /> Yes, erase all</Button>
              </div>
            ) : (
              <Button variant="outline" className="text-rose" onClick={() => setConfirm(true)}><Trash2 className="h-4 w-4" /> Reset</Button>
            )}
          </Row>
        </Card>
      </div>
    </div>
  );
}
