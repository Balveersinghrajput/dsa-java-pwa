"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Monaco = dynamic(() => import("@monaco-editor/react").then((m) => m.default), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full rounded-none" />,
});

/**
 * Monaco editor (VS Code's editor) with Java highlighting. Falls back to a
 * plain textarea in "simple" mode, which is easier to use on phones and also
 * works if the Monaco files can't be downloaded (e.g. offline).
 */
export default function JavaEditor({ value, onChange, simple, fontSize = 14, height = "100%" }: { value: string; onChange: (v: string) => void; simple: boolean; fontSize?: number; height?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setDark(el.dataset.theme === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  if (simple) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const t = e.currentTarget;
            const s = t.selectionStart;
            const next = value.slice(0, s) + "    " + value.slice(t.selectionEnd);
            onChange(next);
            requestAnimationFrame(() => t.setSelectionRange(s + 4, s + 4));
          }
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="Java code editor"
        style={{ fontSize, height }}
        className="block w-full resize-none bg-[#0d1530] p-4 font-mono leading-relaxed text-[#d4d4d4] outline-none"
      />
    );
  }

  return (
    <Monaco
      height={height}
      language="java"
      theme={dark ? "vs-dark" : "light"}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={{
        fontSize,
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 4,
        automaticLayout: true,
        padding: { top: 12 },
        wordWrap: "on",
        smoothScrolling: true,
        cursorSmoothCaretAnimation: "on",
        bracketPairColorization: { enabled: true },
      }}
    />
  );
}
