"use client";

import type { ComponentType } from "react";
import type { VisualKind } from "@/data/content";
import { BinarySearchViz, ComplexityViz, KadaneViz, MatrixViz, PrefixSumViz, SlidingWindowViz, SortingViz, TwoPointersViz } from "./arrays";
import { GraphViz, HashViz, HeapViz, LinkedListViz, StackQueueViz, TreeViz, TrieViz } from "./structures";
import { BitsViz, DPTableViz, RecursionViz } from "./algorithms";

export const VISUALS: Record<VisualKind, { title: string; Comp: ComponentType }> = {
  complexity: { title: "Growth of common complexities", Comp: ComplexityViz },
  sorting: { title: "Sorting step by step", Comp: SortingViz },
  "binary-search": { title: "Binary search", Comp: BinarySearchViz },
  "two-pointers": { title: "Two pointers on a sorted array", Comp: TwoPointersViz },
  "sliding-window": { title: "Fixed-size sliding window", Comp: SlidingWindowViz },
  "prefix-sum": { title: "Prefix sums and O(1) range queries", Comp: PrefixSumViz },
  kadane: { title: "Kadane's algorithm", Comp: KadaneViz },
  matrix: { title: "Spiral matrix traversal", Comp: MatrixViz },
  "linked-list": { title: "Linked list operations", Comp: LinkedListViz },
  "stack-queue": { title: "Stack vs queue", Comp: StackQueueViz },
  tree: { title: "Binary search tree & traversals", Comp: TreeViz },
  graph: { title: "Graph BFS & DFS", Comp: GraphViz },
  heap: { title: "Min-heap push & poll", Comp: HeapViz },
  hash: { title: "Hash table with chaining", Comp: HashViz },
  trie: { title: "Trie insert & search", Comp: TrieViz },
  "dp-table": { title: "DP table: longest common subsequence", Comp: DPTableViz },
  recursion: { title: "Recursion tree: Fibonacci", Comp: RecursionViz },
  bits: { title: "Bit manipulation playground", Comp: BitsViz },
};
