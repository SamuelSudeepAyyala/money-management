import { describe, expect, it } from "vitest";
import { expenseCategoryTotals, filterTransactions, monthKey, monthlyMarginInsight, shiftMonth } from "./reporting";

const transactions = [
  { id: "1", name: "Salary", category: "Salary", date: "2026-08-31", amount: 2000, type: "income" as const, account: "Checking" },
  { id: "2", name: "Rent", category: "Housing", date: "2026-09-01", amount: 900, type: "expense" as const, account: "Checking" },
  { id: "3", name: "Coffee", category: "Dining out", date: "2026-09-02", amount: 5, type: "expense" as const, account: "Cash" },
];

describe("reporting helpers", () => {
  it("handles month boundaries without timezone conversion", () => {
    expect(monthKey("2026-09-01")).toBe("2026-09");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
  });

  it("combines month, account, type, and category filters", () => {
    expect(filterTransactions(transactions, { month: "2026-09", account: "Checking", type: "expense", category: "Housing" }).map(item => item.id)).toEqual(["2"]);
    expect(filterTransactions(transactions, { month: "2027-01" })).toEqual([]);
    expect(filterTransactions(transactions, { type: "income" }).map(item => item.id)).toEqual(["1"]);
    expect(filterTransactions(transactions, { type: "expense" }).map(item => item.id)).toEqual(["2", "3"]);
  });

  it("keeps unknown expense categories in Other and handles zero totals", () => {
    expect(expenseCategoryTotals(transactions, ["Housing", "Food & groceries", "Subscriptions", "Other"])).toEqual([900, 0, 0, 5]);
    expect(expenseCategoryTotals([], ["Housing", "Food & groceries", "Subscriptions", "Other"])).toEqual([0, 0, 0, 0]);
  });

  it("calculates a positive monthly margin and an encouraging status", () => {
    expect(monthlyMarginInsight(10, 6)).toEqual({
      margin: 4,
      spendingRatio: 0.6,
      status: "steady",
      message: "Nice balance—income stayed comfortably ahead of spending.",
    });
    expect(monthlyMarginInsight(100, 40).status).toBe("excellent");
  });

  it("describes tight, overspending, and no-income months", () => {
    expect(monthlyMarginInsight(100, 90).status).toBe("tight");
    expect(monthlyMarginInsight(100, 120)).toMatchObject({ margin: -20, status: "over", spendingRatio: 1.2 });
    expect(monthlyMarginInsight(0, 50)).toMatchObject({ margin: -50, spendingRatio: null, status: "no-income" });
  });
});
