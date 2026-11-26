"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Check, Copy, Download, SquareTerminal } from "lucide-react";
import { downloadText } from "@/lib/download";

const KEYWORDS = new Set(
  "abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long native new package private protected public record return short static super switch synchronized this throw throws try var void volatile while true false null".split(" "),
);
const TYPES = /^(String|Integer|Long|Double|Character|Boolean|Object|List|ArrayList|LinkedList|Map|HashMap|TreeMap|LinkedHashMap|Set|HashSet|TreeSet|Deque|ArrayDeque|Queue|PriorityQueue|Arrays|Collections|Math|System|Scanner|StringBuilder|Iterator|Comparator|Random|BufferedReader|PrintWriter|StringTokenizer|InputStreamReader|BufferedWriter|OutputStreamWriter|IOException|Node|ListNode|TreeNode|Trie|Main)$/;

/** Tiny Java highlighter: comments, strings, chars, numbers, keywords, types. */
export function highlightJava(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])')|(\b\d[\d_]*(?:\.\d+)?[LlFfDd]?\b)|(@\w+)|(\b[A-Za-z_]\w*\b)/g;
  let last = 0;
  let k = 0;
  for (let m = re.exec(code); m; m = re.exec(code)) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const [tok, com, str, chr, num, ann, word] = m;
    let cls = "";
    if (com) cls = "text-[#6a9955] italic";
    else if (str || chr) cls = "text-[#ce9178]";
    else if (num) cls = "text-[#b5cea8]";
    else if (ann) cls = "text-[#dcdcaa]";
    else if (word && KEYWORDS.has(word)) cls = "text-[#c586c0]";
    else if (word && TYPES.test(word)) cls = "text-[#4ec9b0]";
    else if (word && code[re.lastIndex] === "(") cls = "text-[#dcdcaa]";
    out.push(cls ? <span key={k++} className={cls}>{tok}</span> : tok);
    last = re.lastIndex;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export default function CodeBlock({ code, title, filename = "Main.java", runnable = true }: { code: string; title?: string; filename?: string; runnable?: boolean }) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };
  const openInArena = () => {
    sessionStorage.setItem("dsa-practice-load", code);
    router.push("/practice?load=1");
  };
  const iconBtn = "press inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold text-white/80 hover:bg-white/10 hover:text-white";
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1e2846] bg-[#0d1530] shadow-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2">
        <span className="flex gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="ml-2 min-w-0 flex-1 truncate text-[12.5px] font-semibold text-white/85">{title ?? filename}</span>
        <button onClick={copy} className={iconBtn} aria-label="Copy code">
          {copied ? <Check className="h-3.5 w-3.5 text-[#28c840]" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
        </button>
        <button onClick={() => downloadText(filename, code)} className={iconBtn} aria-label="Download code"><Download className="h-3.5 w-3.5" /></button>
        {runnable && (
          <button onClick={openInArena} className="press inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-[12px] font-semibold text-white hover:bg-primary-strong">
            <SquareTerminal className="h-3.5 w-3.5" /> Run in Practice Arena
          </button>
        )}
      </div>
      <pre className="thin-scroll max-h-[520px] overflow-auto p-4 text-[12.5px] leading-[1.65] text-[#d4d4d4]">
        <code className="font-mono">{highlightJava(code)}</code>
      </pre>
    </div>
  );
}
