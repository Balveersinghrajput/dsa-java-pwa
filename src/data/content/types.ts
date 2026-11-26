/** Interactive visualisers available on lesson pages. */
export type VisualKind =
  | "complexity"
  | "sorting"
  | "binary-search"
  | "two-pointers"
  | "sliding-window"
  | "prefix-sum"
  | "linked-list"
  | "stack-queue"
  | "tree"
  | "graph"
  | "heap"
  | "dp-table"
  | "recursion"
  | "bits"
  | "hash"
  | "trie"
  | "matrix"
  | "kadane";

export interface TopicContent {
  /** One-sentence summary used on cards. */
  summary: string;
  /** Beginner-friendly explanation, one string per paragraph. */
  explanation: string[];
  prerequisites: string[];
  objectives: string[];
  analogy: string;
  /** Java implementations (compile-ready snippets). */
  code: { title: string; java: string }[];
  /** Worked example, step by step. */
  steps: { title: string; detail: string }[];
  mistakes: string[];
  complexity: { op: string; time: string; space: string }[];
  revision: string[];
  visual?: VisualKind;
}
