import { describe, expect, it } from "vitest";
import { BLOCK_DAYS, buildCalendar, leaveBalance, makeDayRules, toISODate, todayDayNumber } from "@/lib/schedule";

const iso = (d: Date) => toISODate(d);
// 2026-01-05 is a Monday.
const MON = "2026-01-05";

describe("schedule", () => {
  it("skips weekly holidays", () => {
    const cal = buildCalendar(MON, { restDays: [0, 6], leaves: [], autoLeave: false }, 10);
    expect(cal).toHaveLength(10);
    expect(cal.every((d) => d.getDay() !== 0 && d.getDay() !== 6)).toBe(true);
    expect(iso(cal[5])).toBe("2026-01-12"); // second Monday
  });

  it("skips sick-leave days", () => {
    const cal = buildCalendar(MON, { restDays: [0], leaves: ["2026-01-06"], autoLeave: false }, 3);
    expect(cal.map(iso)).toEqual(["2026-01-05", "2026-01-07", "2026-01-08"]);
  });

  it("auto-leave puts unused leave on the last study days of each 2-week block", () => {
    const rules = makeDayRules(MON, { restDays: [0], leaves: [], autoLeave: true });
    // Block 1 is 05–18 Jan; Sunday 18th is a holiday, so Fri 16 and Sat 17 become leave.
    expect(rules.kind(new Date(2026, 0, 17))).toBe("auto-leave");
    expect(rules.kind(new Date(2026, 0, 16))).toBe("auto-leave");
    expect(rules.kind(new Date(2026, 0, 15))).toBe("study");
    expect(rules.kind(new Date(2026, 0, 18))).toBe("rest");
  });

  it("auto-leave only fills what manual leave left over", () => {
    const rules = makeDayRules(MON, { restDays: [0], leaves: ["2026-01-07"], autoLeave: true });
    expect(rules.kind(new Date(2026, 0, 7))).toBe("leave");
    expect(rules.kind(new Date(2026, 0, 17))).toBe("auto-leave");
    expect(rules.kind(new Date(2026, 0, 16))).toBe("study");
  });

  it("counts leave per 2-week block", () => {
    expect(BLOCK_DAYS).toBe(14);
    const b = leaveBalance(MON, ["2026-01-06", "2026-01-20"], "2026-01-10");
    expect(b).toMatchObject({ block: 0, used: 1, left: 1 });
    expect(leaveBalance(MON, ["2026-01-06", "2026-01-07"], "2026-01-08").left).toBe(0);
  });

  it("returns no dates when every weekday is a holiday", () => {
    expect(buildCalendar(MON, { restDays: [0, 1, 2, 3, 4, 5, 6], leaves: [], autoLeave: false }, 5)).toEqual([]);
  });

  it("finds today's plan day", () => {
    const cal = buildCalendar(MON, { restDays: [0], leaves: [], autoLeave: false }, 20);
    expect(todayDayNumber(cal, new Date(2026, 0, 4))).toBe(0);
    expect(todayDayNumber(cal, new Date(2026, 0, 5))).toBe(1);
    expect(todayDayNumber(cal, new Date(2026, 0, 11))).toBe(6); // Sunday holiday keeps Saturday's day
  });
});
