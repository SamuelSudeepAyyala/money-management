import { describe, expect, it } from "vitest";
import { dueRecurringBills } from "./recurringBills";

const bill = (id: number, next_due: string) => ({ id, name: `Bill ${id}`, amount: 10, category: "Other", frequency: "monthly" as const, next_due });

describe("dueRecurringBills", () => {
  it("includes bills due today and overdue, but not future bills", () => {
    expect(dueRecurringBills([bill(1, "2026-08-31"), bill(2, "2026-09-01"), bill(3, "2026-09-02")], "2026-09-01").map(item => item.id)).toEqual([1, 2]);
  });

  it("orders multiple due bills by their due date", () => {
    expect(dueRecurringBills([bill(1, "2026-09-01"), bill(2, "2026-08-01")], "2026-09-01").map(item => item.id)).toEqual([2, 1]);
  });
});
