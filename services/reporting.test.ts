import { describe, expect, it } from "vitest";
import { expenseCategoryTotals, filterTransactions, monthKey, shiftMonth } from "./reporting";

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
  });

  it("keeps unknown expense categories in Other and handles zero totals", () => {
    expect(expenseCategoryTotals(transactions, ["Housing", "Food & groceries", "Subscriptions", "Other"])).toEqual([900, 0, 0, 5]);
    expect(expenseCategoryTotals([], ["Housing", "Food & groceries", "Subscriptions", "Other"])).toEqual([0, 0, 0, 0]);
  });
});
