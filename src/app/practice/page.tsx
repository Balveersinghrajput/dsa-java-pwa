"use client";

import Select from "@/components/ui/Select";
import { api } from "@/lib/api";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Check, CheckCircle2, Copy, Eye, FileCode2, Loader2, Minus, Pencil, Play, Plus, RotateCcw, Save, Send, Smartphone, X, XCircle } from "lucide-react";
import ProblemForm, { type ProblemDraft } from "@/components/saved/ProblemForm";
import { exercises, playgroundStarter, type Exercise } from "@/data/practice";
import { plan } from "@/data/curriculum";
import { useAppState } from "@/lib/store";
import { Badge, Button, Card, Modal, PageHeader, Tabs, cardCls, st } from "@/components/ui";
import JavaEditor from "@/components/editor/JavaEditor";
import { highlightJava } from "@/components/lessons/CodeBlock";

interface RunResult {
  status: string;
  ok: boolean;
  stdout: string;
  stderr: string;
  compile: string;
  time: string | null;
  memory: number | null;
}

type Panel = "input" | "output" | "tests";
const norm = (s: string) => s.replace(/\r/g, "").trim().split("\n").map((l) => l.trimEnd()).join("\n");

function Arena() {
  const params = useSearchParams();
  const { state, saveSolution, saveProblem } = useAppState();
  const [exId, setExId] = useState<string>(params.get("ex") ?? "playground");
  const ex: Exercise | undefined = exercises.find((e) => e.id === exId);
  const solKey = ex ? ex.id : "playground";
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [panel, setPanel] = useState<Panel>("input");
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [tests, setTests] = useState<{ pass: boolean; got: string; want: string; input: string; status: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simple, setSimple] = useState(false);
  const [font, setFont] = useState(14);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  // The Saved problem being edited (opened from the Saved page, or saved once already).
  const [editingId, setEditingId] = useState<string | null>(params.get("saved"));
  const editing = state.savedProblems.find((p) => p.id === editingId) ?? null;
  const [saveOpen, setSaveOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load code: from a lesson ("Run in Practice Arena"), a saved solution or the starter.
  const loaded = useRef(false);
  useEffect(() => {
    setResult(null);
    setTests(null);
    setError(null);
    setPanel("input");
    if (!loaded.current) {
      loaded.current = true;
      const sp = editingId ? state.savedProblems.find((p) => p.id === editingId) : null;
      if (sp) {
        setCode(sp.code);
        setStdin(sp.stdin ?? "");
        return;
      }
      const c = params.get("load") === "1" ? sessionStorage.getItem("dsa-practice-load") : null;
      if (c) {
        sessionStorage.removeItem("dsa-practice-load");
        setCode(c);
        setStdin("");
        return;
      }
    }
    setCode(state.solutions[solKey] ?? ex?.starter ?? playgroundStarter);
    setStdin(ex?.sample.input ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exId]);

  useEffect(() => {
    setSimple(window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 768);
  }, []);

  const call = useCallback(async (body: object) => {
    const res = await api("/api/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
    return data.results as RunResult[];
  }, []);

  const run = async () => {
    if (!navigator.onLine) return setError("You're offline. Running Java needs an internet connection — your code is still saved on this device.");
    setBusy("run");
    setError(null);
    setPanel("output");
    try {
      const [r] = await call({ source: code, stdin });
      setResult(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    if (!ex) return;
    if (!navigator.onLine) return setError("You're offline. Submitting needs an internet connection.");
    setBusy("submit");
    setError(null);
    setPanel("tests");
    const all = [ex.sample, ...ex.tests];
    try {
      const rs = await call({ source: code, tests: all.map((t) => t.input) });
      if (rs[0]?.status.startsWith("Compilation")) {
        setResult(rs[0]);
        setTests(null);
        setPanel("output");
      } else {
        setTests(all.map((t, k) => ({ input: t.input, want: t.output, got: rs[k]?.stdout ?? "", status: rs[k]?.status ?? "Not run", pass: !!rs[k]?.ok && norm(rs[k].stdout) === norm(t.output) })));
        saveSolution(solKey, code);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const flash = (msg: string) => {
    setSaved(true);
    setToast(msg);
    setTimeout(() => setSaved(false), 1500);
    setTimeout(() => setToast(null), 3500);
  };
  /** Save: updates the problem being edited, otherwise asks for its details first. */
  const save = () => {
    saveSolution(solKey, code);
    if (editing) {
      saveProblem({ ...editing, code, stdin });
      flash(`Saved changes to "${editing.title}"`);
    } else setSaveOpen(true);
  };
  const saveDetails = (d: ProblemDraft) => {
    const id = saveProblem({ ...d, stdin });
    setEditingId(id);
    setSaveOpen(false);
    flash(`Saved "${d.title}" to your Saved problems`);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const passed = tests?.filter((t) => t.pass).length ?? 0;
  const lessonDay = ex ? plan.find((d) => d.topic.id === ex.topic)?.day : undefined;
  const tool = "press inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink";

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Practice Arena"
        subtitle="Write Java, run it on a real JDK 17 and check your solution against tests."
        action={
          <Select<string> label="Choose exercise" className="w-full sm:w-72" value={exId} onChange={setExId} options={[{ value: "playground", label: "Free playground" }, ...exercises.map((e) => ({ value: e.id, label: `${e.difficulty} · ${e.title}` }))]} />
        }
      />

      {editing && (
        <div className="fade mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-primary-soft px-4 py-2.5 text-[13px]">
          <FileCode2 className="h-4 w-4 text-primary" />
          <span className="min-w-0 flex-1 truncate">Editing saved problem <b>{editing.title}</b>. Save updates it.</span>
          <button onClick={() => setSaveOpen(true)} className="press inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-primary hover:bg-surface"><Pencil className="h-3.5 w-3.5" /> Details</button>
          <Link href="/saved" className="rounded-lg px-2 py-1 font-semibold text-primary hover:bg-surface">All saved</Link>
          <button onClick={() => setEditingId(null)} aria-label="Stop editing (next save creates a new problem)" title="Stop editing" className="press grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-surface hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* problem panel */}
        <Card i={1} className="h-fit p-5 lg:sticky lg:top-24">
          {ex ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={ex.difficulty === "Easy" ? "green" : ex.difficulty === "Medium" ? "amber" : "rose"}>{ex.difficulty}</Badge>
                {lessonDay && <Link href={`/lessons/${lessonDay}`} className="text-[12px] font-semibold text-primary hover:underline">Lesson: Day {lessonDay}</Link>}
              </div>
              <h2 className="mt-2 text-[18px] font-bold">{ex.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{ex.statement}</p>
              <h3 className="mt-4 text-[12px] font-bold tracking-wide text-muted uppercase">Input</h3>
              <p className="text-[13.5px] text-ink-2">{ex.input}</p>
              <h3 className="mt-3 text-[12px] font-bold tracking-wide text-muted uppercase">Output</h3>
              <p className="text-[13.5px] text-ink-2">{ex.output}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[12px] font-bold text-muted">Sample input</p>
                  <pre className="mt-1 overflow-x-auto rounded-lg bg-surface-2 p-2.5 font-mono text-[12.5px] ring-1 ring-line">{ex.sample.input}</pre>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-muted">Sample output</p>
                  <pre className="mt-1 overflow-x-auto rounded-lg bg-surface-2 p-2.5 font-mono text-[12.5px] ring-1 ring-line">{ex.sample.output}</pre>
                </div>
              </div>
              <p className="mt-4 text-[12.5px] text-muted">Submit runs the sample plus {ex.tests.length} hidden tests.</p>
              <Button variant="ghost" size="sm" className="mt-2 -ml-2" onClick={() => setShowSolution(true)}><Eye className="h-4 w-4" /> View reference solution</Button>
            </>
          ) : (
            <>
              <h2 className="text-[18px] font-bold">Free playground</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">Write any Java program with a <code className="rounded bg-surface-2 px-1 font-mono text-[12.5px]">public class Main</code>. Put input for <code className="rounded bg-surface-2 px-1 font-mono text-[12.5px]">System.in</code> in the Custom input tab, then press Run.</p>
              <p className="mt-3 text-[13px] text-muted">Tip: every code sample in the lessons has a <b>Run in Practice Arena</b> button that opens it here.</p>
              <div className="mt-4 space-y-2">
                {exercises.slice(0, 4).map((e) => (
                  <button key={e.id} onClick={() => setExId(e.id)} className="press flex w-full items-center gap-2 rounded-xl border border-line p-2.5 text-left text-[13px] font-semibold hover:border-primary-faint">
                    <Badge tone={e.difficulty === "Easy" ? "green" : "amber"}>{e.difficulty}</Badge> {e.title}
                  </button>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* editor + console */}
        <div className="min-w-0 space-y-4">
          <div className={`rise overflow-hidden ${cardCls}`} style={st(2)}>
            <div className="flex flex-wrap items-center gap-1 border-b border-line px-2 py-1.5">
              <span className="px-2 font-mono text-[12.5px] font-semibold text-ink-2">Main.java</span>
              <span className="ml-auto" />
              <button className={tool} onClick={() => setFont((f) => Math.max(11, f - 1))} aria-label="Smaller font"><Minus className="h-3.5 w-3.5" /></button>
              <span className="w-6 text-center text-[12px] font-semibold text-muted tabular-nums">{font}</span>
              <button className={tool} onClick={() => setFont((f) => Math.min(22, f + 1))} aria-label="Larger font"><Plus className="h-3.5 w-3.5" /></button>
              <button className={tool} onClick={() => setSimple((s) => !s)} aria-pressed={simple} title="Simple editor works best on phones"><Smartphone className="h-3.5 w-3.5" /> {simple ? "Full editor" : "Simple"}</button>
              <button className={tool} onClick={() => { setCode(ex?.starter ?? playgroundStarter); setResult(null); setTests(null); }}><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
              <button className={tool} onClick={copy}>{copied ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}</button>
              <button className={tool} onClick={save}>{saved ? <Check className="h-3.5 w-3.5 text-green" /> : <Save className="h-3.5 w-3.5" />} {saved ? "Saved" : "Save"}</button>
            </div>
            <div className="h-[46vh] min-h-[320px] lg:h-[52vh]">
              <JavaEditor value={code} onChange={setCode} simple={simple} fontSize={font} />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-line p-3">
              <span className="text-[12px] text-muted">{editing ? `Saved problem · ${editing.category}` : state.solutions[solKey] ? "Saved solution loaded" : "Not saved yet"}</span>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" onClick={run} disabled={!!busy}>
                  {busy === "run" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />} Run
                </Button>
                {ex && (
                  <Button onClick={submit} disabled={!!busy}>
                    {busy === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className={`rise ${cardCls}`} style={st(3)}>
            <Tabs
              className="px-2"
              value={panel}
              onChange={setPanel}
              tabs={[
                { id: "input", label: "Custom input" },
                { id: "output", label: "Output" },
                ...(ex ? [{ id: "tests" as Panel, label: tests ? `Tests (${passed}/${tests.length})` : "Tests" }] : []),
              ]}
            />
            <div className="p-4">
              {error && (
                <div className="fade mb-3 flex gap-2 rounded-xl border border-rose/25 bg-rose-soft p-3 text-[13px] text-ink">
                  <AlertTriangle className="h-4 w-4 flex-none text-rose" /> {error}
                </div>
              )}
              {panel === "input" && (
                <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={6} spellCheck={false} placeholder="Input passed to System.in when you press Run" className="w-full resize-y rounded-xl border border-line bg-surface-2 p-3 font-mono text-[13px] outline-none focus:border-primary" aria-label="Custom input" />
              )}
              {panel === "output" && (
                busy === "run" ? (
                  <p className="flex items-center gap-2 text-[13px] text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Compiling and running on JDK 17…</p>
                ) : result ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-[13px]">
                      <span className={`inline-flex items-center gap-1.5 font-bold ${result.ok ? "text-green" : "text-rose"}`}>{result.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{result.status}</span>
                      {result.time && <span className="text-muted">{result.time}s</span>}
                      {result.memory && <span className="text-muted">{Math.round(result.memory / 1024)} MB</span>}
                    </div>
                    {result.compile && <pre className="overflow-x-auto rounded-xl bg-rose-soft p-3 font-mono text-[12.5px] text-rose">{result.compile}</pre>}
                    {result.stdout && <pre className="max-h-72 overflow-auto rounded-xl bg-surface-2 p-3 font-mono text-[12.5px] ring-1 ring-line">{result.stdout}</pre>}
                    {result.stderr && <pre className="overflow-x-auto rounded-xl bg-amber-soft p-3 font-mono text-[12.5px] text-amber">{result.stderr}</pre>}
                    {!result.stdout && !result.compile && !result.stderr && <p className="text-[13px] text-muted">The program printed nothing.</p>}
                  </div>
                ) : (
                  <p className="text-[13px] text-muted">Press Run to compile and execute your code.</p>
                )
              )}
              {panel === "tests" && ex && (
                busy === "submit" ? (
                  <p className="flex items-center gap-2 text-[13px] text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Running {ex.tests.length + 1} tests…</p>
                ) : tests ? (
                  <div className="space-y-2">
                    <p className={`text-[14px] font-bold ${passed === tests.length ? "text-green" : "text-rose"}`}>{passed === tests.length ? "All tests passed — solution saved." : `${passed} of ${tests.length} tests passed.`}</p>
                    {tests.map((t, k) => (
                      <details key={k} className={`rounded-xl border p-3 ${t.pass ? "border-green/25 bg-green-soft/40" : "border-rose/25 bg-rose-soft/50"}`}>
                        <summary className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
                          {t.pass ? <CheckCircle2 className="h-4 w-4 text-green" /> : <XCircle className="h-4 w-4 text-rose" />} {k === 0 ? "Sample" : `Test ${k}`} · {t.pass ? "passed" : t.status === "Accepted" ? "wrong answer" : t.status}
                        </summary>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          {[["Input", t.input], ["Expected", t.want], ["Your output", t.got || "(nothing)"]].map(([l, v]) => (
                            <div key={l}><p className="text-[11px] font-bold text-muted">{l}</p><pre className="mt-1 overflow-x-auto rounded-lg bg-surface p-2 font-mono text-[12px] ring-1 ring-line">{v}</pre></div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-muted">Press Submit to run all tests.</p>
                )
              )}
            </div>
          </div>
          <p className="text-[12px] text-muted">Code runs on a sandboxed Judge0 server (JDK 17). Running needs an internet connection; your code and solutions are saved on this device and work offline.</p>
        </div>
      </div>

      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title={editing ? "Edit problem details" : "Save problem"} wide>
        {saveOpen && (
          <ProblemForm
            initial={editing ?? { title: ex?.title ?? "", difficulty: ex?.difficulty ?? "Easy", exerciseId: ex?.id, notes: ex?.statement ?? "", status: tests && passed === tests.length ? "solved" : "attempted", tags: [] }}
            code={code}
            onSave={saveDetails}
            onCancel={() => setSaveOpen(false)}
            submitLabel={editing ? "Save changes" : "Save problem"}
          />
        )}
      </Modal>

      {toast && (
        <div role="status" className="scale-in fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-navy px-4 py-3 text-[13.5px] text-white shadow-pop lg:bottom-8">
          <CheckCircle2 className="h-5 w-5 flex-none text-green" />
          <span className="min-w-0 flex-1">{toast}</span>
          <Link href="/saved" className="font-semibold text-[#a5b4fc] hover:underline">View</Link>
        </div>
      )}

      {ex && (
        <Modal open={showSolution} onClose={() => setShowSolution(false)} title={`Reference solution · ${ex.title}`} wide>
          <p className="mb-3 text-[13px] text-muted">Try on your own first. Reading a solution is most useful after 25 minutes of honest effort.</p>
          <pre className="overflow-x-auto rounded-xl bg-[#0d1530] p-4 font-mono text-[12.5px] leading-relaxed text-[#d4d4d4]"><code>{highlightJava(ex.solution)}</code></pre>
          <div className="mt-3 flex justify-end"><Button variant="outline" size="sm" onClick={() => { setCode(ex.solution); setShowSolution(false); }}>Load into editor</Button></div>
        </Modal>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense>
      <Arena />
    </Suspense>
  );
}
