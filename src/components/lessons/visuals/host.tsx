"use client";

import type { VisualKind } from "@/data/content";
import { VISUALS } from "./index";

/** Loaded on demand so lesson pages don't ship chart code until it's needed. */
export default function VisualHost({ kind }: { kind: VisualKind }) {
  const V = VISUALS[kind];
  return <V.Comp />;
}
