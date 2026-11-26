"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, CheckCircle2, Clock, ExternalLink, Play, RotateCcw, Timer, Trophy, XCircle } from "lucide-react";
import { phases, plan, type Problem } from "@/data/curriculum";
import { quizzes } from "@/data/quizzes";
import { useAppState } from "@/lib/store";
import { useDerived } from "@/lib/derive";
import { Badge, Button, Card, CardHeader, DiffBadge, PageHeader, Ring, Segmented, Tabs, cardCls, st } from "@/components/ui";

const fmtClock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => setLeft(seconds), [seconds]);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      onEnd();
      return;
    }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left]); // eslint-disable-line react-hooks/exhaustive-deps
  return left;
}

/* ---------------- quiz ---------------- */

function Quiz() {
  const { state, addQuizResult } = useAppState();
  const d = useDerived();
  const [phase, setPhase] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const qs = phase !== null ? quizzes[phase] : [];
  const left = useCountdown(qs.length * 90, phase !== null && !done, () => finish());

  const start = (p: number) => {
    setPhase(p);
    setAnswers(Array(quizzes[p].length).fill(null));
    setIdx(0);
    setDone(false);
  };
  const finish = () => {
    if (phase === null || done) return;
    setDone(true);
    addQuizResult({ phase, score: answers.filter((a, k) => a === qs[k].answer).length, total: qs.length, at: new Date().toISOString() });
  };

  if (phase === null) {
    const current = plan[d.focus - 1].phase.id;
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {phases.filter((p) => quizzes[p.id]).map((p, k) => {
          const last = [...state.quizResults].reverse().find((r) => r.phase === p.id);
          const best = Math.max(0, ...state.quizResults.filter((r) => r.phase === p.id).map((r) => r.score / r.total));
          return (
            <button key={p.id} onClick={() => start(p.id)} className={`rise lift press flex items-center gap-3 p-4 text-left ${cardCls} ${p.id === current ? "ring-2 ring-primary-faint" : ""}`} style={st(Math.min(k, 12) * 0.5)}>
              <Ring pct={best * 100} size={48} stroke={5}><span className="text-[11px] font-bold">{last ? `${Math.round(best * 100)}%` : p.id}</span></Ring>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold">{p.title}</span>
                <span className="block text-[12px] text-muted">{quizzes[p.id].length} questions · {Math.round((quizzes[p.id].length * 90) / 60)} min{last ? ` · last ${last.score}/${last.total}` : ""}</span>
              </span>
              <Play className="h-4 w-4 text-primary" />
            </button>
          );
        })}
      </div>
    );
  }

  const score = answers.filter((a, k) => a === qs[k].answer).length;

  if (done) {
    return (
      <Card i={0} className="mx-auto max-w-3xl p-6">
        <div className="flex flex-col items-center text-center">
          <Ring pct={(score / qs.length) * 100} size={110} stroke={8}><span className="text-[22px] font-extrabold">{score}/{qs.length}</span></Ring>
          <h2 className="mt-4 text-[20px] font-bold">{score === qs.length ? "Perfect score! 🎉" : score / qs.length >= 0.6 ? "Nice work!" : "Keep practising"}</h2>
          <p className="text-[13.5px] text-muted">{phases[phase].title} quiz · saved to your progress</p>
        </div>
        <ol className="mt-6 space-y-3">
          {qs.map((q, k) => {
            const ok = answers[k] === q.answer;
            return (
              <li key={k} className={`rounded-xl border p-4 ${ok ? "border-green/25 bg-green-soft/40" : "border-rose/25 bg-rose-soft/40"}`}>
                <p className="flex gap-2 text-[14px] font-semibold">{ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-green" /> : <XCircle className="mt-0.5 h-4 w-4 flex-none text-rose" />}{q.q}</p>
                <p className="mt-1.5 pl-6 text-[13px]">Correct: <b>{q.options[q.answer]}</b>{!ok && answers[k] !== null && <> · You chose: {q.options[answers[k]!]}</>}</p>
                <p className="mt-1 pl-6 text-[13px] text-ink-2">{q.why}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => start(phase)}><RotateCcw className="h-4 w-4" /> Retake</Button>
          <Button onClick={() => setPhase(null)}>All quizzes</Button>
        </div>
      </Card>
    );
  }

  const q = qs[idx];
  return (
    <Card i={0} className="mx-auto max-w-3xl p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>{phases[phase].title}</Badge>
        <span className="text-[13px] font-semibold text-muted">Question {idx + 1} of {qs.length}</span>
        <span className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[13px] font-bold ${left < 30 ? "bg-rose-soft text-rose" : "bg-surface-2 text-ink-2"}`}><Timer className="h-4 w-4" />{fmtClock(left)}</span>
      </div>
      <div className="mt-3 flex gap-1">{qs.map((_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full transition-colors ${k === idx ? "bg-primary" : answers[k] !== null ? "bg-primary-faint" : "bg-surface-2"}`} />)}</div>
      <h2 key={idx} className="fade mt-6 text-[18px] leading-snug font-bold">{q.q}</h2>
      <div className="mt-4 space-y-2">
        {q.options.map((o, k) => {
          const sel = answers[idx] === k;
          return (
            <button key={k} onClick={() => setAnswers((a) => a.map((x, j) => (j === idx ? k : x)))} className={`press flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-[14px] ${sel ? "border-primary bg-primary-soft font-semibold" : "border-line hover:border-primary-faint"}`}>
              <span className={`grid h-7 w-7 flex-none place-items-center rounded-lg text-[12px] font-bold ${sel ? "bg-primary text-white" : "bg-surface-2 text-ink-2"}`}>{String.fromCharCode(65 + k)}</span>
              {o}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>Back</Button>
        {idx < qs.length - 1 ? (
          <Button onClick={() => setIdx((i) => i + 1)} disabled={answers[idx] === null}>Next <ArrowRight className="h-4 w-4" /></Button>
        ) : (
          <Button onClick={finish} disabled={answers.some((a) => a === null)}>Finish quiz</Button>
        )}
      </div>
    </Card>
  );
}

/* ---------------- mock interview ---------------- */

type Mode = "em" | "mm" | "mh";

function Interview() {
  const { state, addInterview, toggleSolved } = useAppState();
  const d = useDerived();
  const [mode, setMode] = useState<Mode>("em");
  const [picked, setPicked] = useState<Problem[] | null>(null);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startSolved, setStartSolved] = useState<string[]>([]);
  const left = useCountdown(45 * 60, running, () => end());

  const pool = useMemo(() => {
    const upTo = Math.max(d.focus, ...state.doneDays, 20);
    const seen = new Set<string>();
    const out: Problem[] = [];
    for (const day of plan) if (day.day <= upTo) for (const p of day.problems) if (!seen.has(p.slug)) { seen.add(p.slug); out.push(p); }
    return out;
  }, [d.focus, state.doneDays]);

  const pick = () => {
    const want = { em: ["Easy", "Medium"], mm: ["Medium", "Medium"], mh: ["Medium", "Hard"] }[mode];
    const chosen: Problem[] = [];
    for (const diff of want) {
      const options = pool.filter((p) => p.difficulty === diff && !chosen.includes(p));
      const fallback = pool.filter((p) => !chosen.includes(p));
      const from = options.length ? options : fallback;
      chosen.push(from[Math.floor(Math.random() * from.length)]);
    }
    setPicked(chosen);
    setFinished(false);
    setRunning(false);
  };
  const begin = () => {
    setStartSolved(state.solved);
    setRunning(true);
  };
  function end() {
    if (!picked) return;
    setRunning(false);
    setFinished(true);
    addInterview({ at: new Date().toISOString(), problems: picked.map((p) => p.slug), minutes: Math.round((45 * 60 - left) / 60), solved: picked.filter((p) => state.solved.includes(p.slug) && !startSolved.includes(p.slug)).length });
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Card i={0} className="p-6">
        <CardHeader title="45-minute mock interview" action={running && <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[15px] font-bold ${left < 300 ? "bg-rose-soft text-rose" : "bg-primary-soft text-primary"}`}><Clock className="h-4 w-4" />{fmtClock(left)}</span>} />
        <p className="mt-2 text-[13.5px] text-ink-2">Two problems from topics you&apos;ve reached, like a real interview round. Talk through your approach out loud, code it on LeetCode, then mark each one solved.</p>
        {!running && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Segmented options={[{ id: "em", label: "Easy + Medium" }, { id: "mm", label: "Medium + Medium" }, { id: "mh", label: "Medium + Hard" }]} value={mode} onChange={setMode} />
            <Button variant="outline" onClick={pick}>{picked ? "Pick again" : "Pick problems"}</Button>
          </div>
        )}
        {picked && (
          <ul className="mt-5 space-y-2">
            {picked.map((p, k) => {
              const solved = state.solved.includes(p.slug);
              return (
                <li key={p.slug} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3.5 ${solved ? "border-green/25 bg-green-soft/40" : "border-line"}`}>
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-2 text-[12px] font-bold">{k + 1}</span>
                  <span className={`min-w-0 flex-1 text-[14px] font-semibold ${running || finished ? "" : "blur-[5px] select-none"}`}>{p.title}</span>
                  <DiffBadge d={p.difficulty} />
                  {(running || finished) && (
                    <>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="press inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] font-semibold hover:border-primary-faint">Open <ExternalLink className="h-3.5 w-3.5" /></a>
                      <Button size="sm" variant={solved ? "outline" : "primary"} onClick={() => toggleSolved(p.slug)}>{solved ? "Solved ✓" : "Mark solved"}</Button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {picked && !running && !finished && <p className="mt-3 text-[12.5px] text-muted">Problem names are hidden until you start, so you can&apos;t peek.</p>}
        <div className="mt-5 flex gap-2">
          {picked && !running && !finished && <Button onClick={begin}><Play className="h-4 w-4 fill-current" /> Start 45:00</Button>}
          {running && <Button variant="outline" onClick={end}>Finish early</Button>}
          {finished && <Button onClick={pick}><RotateCcw className="h-4 w-4" /> New interview</Button>}
        </div>
        {finished && <p className="fade mt-4 rounded-xl bg-primary-soft/60 p-3 text-[13.5px]">Session saved. Review anything you couldn&apos;t finish, then write a one-line pattern note for each problem.</p>}
      </Card>

      <Card i={1} className="p-5">
        <CardHeader title="History" />
        {state.interviews.length === 0 && state.quizResults.length === 0 ? (
          <p className="mt-3 text-[13px] text-muted">Your quiz scores and interview sessions will appear here.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...state.interviews].reverse().slice(0, 5).map((m) => (
              <li key={m.at} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 text-[13px]">
                <BadgeCheck className="h-4 w-4 text-primary" />
                <span className="flex-1">Interview · {m.solved}/{m.problems.length} solved in {m.minutes} min</span>
                <span className="text-[12px] text-muted">{new Date(m.at).toLocaleDateString()}</span>
              </li>
            ))}
            {[...state.quizResults].reverse().slice(0, 6).map((r) => (
              <li key={r.at} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 text-[13px]">
                <Trophy className="h-4 w-4 text-amber" />
                <span className="flex-1">{phases[r.phase]?.title ?? "Quiz"} quiz · {r.score}/{r.total}</span>
                <span className="text-[12px] text-muted">{new Date(r.at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function MockTestsPage() {
  const [tab, setTab] = useState<"quiz" | "interview">("quiz");
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Mock Tests" subtitle="Check your understanding with timed quizzes, then rehearse real interview rounds." />
      <Tabs tabs={[{ id: "quiz", label: "Phase quizzes" }, { id: "interview", label: "Mock interview" }]} value={tab} onChange={setTab} className="mb-5" />
      <div key={tab} className="fade">{tab === "quiz" ? <Quiz /> : <Interview />}</div>
    </div>
  );
}
