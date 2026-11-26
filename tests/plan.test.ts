import { describe, expect, it } from "vitest";
import { applyPlanConfig, plan, planKeysFor } from "@/data/curriculum";
import { remapDays } from "@/lib/planRemap";
import { freshState, normalise } from "@/lib/store";
import { derive } from "@/lib/derive";

describe("plan & progress remapping", () => {
  it("has 152 days with unique stable keys", () => {
    const keys = planKeysFor({});
    expect(keys).toHaveLength(152);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("moves progress when a day is split", () => {
    const oldKeys = planKeysFor({});
    const splitKey = oldKeys[2]; // Day 3
    const newKeys = planKeysFor({ splits: { [splitKey]: 2 } });
    expect(newKeys).toHaveLength(153);
    const s = { ...freshState(), doneDays: [1, 3, 10], tasks: { 10: ["learn" as const] } };
    const r = remapDays(s, oldKeys, newKeys);
    // Day 3 became days 3 and 4 (both done because the original was); day 10 is now 11.
    expect(r.doneDays.sort((a, b) => a - b)).toEqual([1, 3, 4, 11]);
    expect(r.tasks[11]).toEqual(["learn"]);
    expect(r.planKeys).toEqual(newKeys);
  });

  it("a merged day is done only if every part was", () => {
    const base = planKeysFor({});
    const splitKey = base[4];
    const splitKeys = planKeysFor({ splits: { [splitKey]: 2 } });
    const s = { ...freshState(), doneDays: [5] }; // only the first half done
    const merged = remapDays(s, splitKeys, base);
    expect(merged.doneDays).not.toContain(5);
  });

  it("normalise migrates legacy string notes and fills defaults", () => {
    const n = normalise({ notes: { "two-sum": "use a map", "lesson:3": { text: "hi", updated: "x" } }, perWeek: 5 });
    expect(n.version).toBe(2);
    expect(n.notes["problem:two-sum"].text).toBe("use a map");
    expect(n.notes["lesson:3"].text).toBe("hi");
    expect(n.restDays).toEqual([0, 6]);
    expect(n.planKeys).toHaveLength(152);
  });

  it("normalise tolerates garbage", () => {
    expect(normalise(null).version).toBe(2);
    expect(normalise("nope").doneDays).toEqual([]);
  });
});

describe("derive", () => {
  applyPlanConfig({});
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  it("locks future days after more than 2 missed days", () => {
    const s = { ...freshState(), startDate: daysAgo(6), restDays: [], doneDays: [1] };
    const d = derive(s);
    expect(d.catchUp).toBe(true);
    expect(d.isLocked(plan.length)).toBe(true);
    expect(d.isLocked(2)).toBe(false); // the first unfinished day is open
  });

  it("does not lock with 2 or fewer missed days", () => {
    const s = { ...freshState(), startDate: daysAgo(2), restDays: [] };
    expect(derive(s).catchUp).toBe(false);
  });
});
