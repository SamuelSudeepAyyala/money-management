import { Transaction } from "../components/moneyflow/types";

export type MonthlyMarginStatus = "excellent" | "steady" | "tight" | "over" | "no-income";

export type MonthlyMarginInsight = {
  margin: number;
  spendingRatio: number | null;
  status: MonthlyMarginStatus;
  message: string;
};

export function monthlyMarginInsight(income: number, spending: number): MonthlyMarginInsight {
  const margin = income - spending;
  if (income <= 0) {
    return { margin, spendingRatio: null, status: "no-income", message: "Add income to see the breathing room your month created." };
  }

  const spendingRatio = spending / income;
  if (spendingRatio < 0.5) {
    return { margin, spendingRatio, status: "excellent", message: "Plenty of breathing room—your money is working with you." };
  }
  if (spendingRatio <= 0.8) {
    return { margin, spendingRatio, status: "steady", message: "Nice balance—income stayed comfortably ahead of spending." };
  }
  if (spendingRatio <= 1) {
    return { margin, spendingRatio, status: "tight", message: "A tight month—one small trim could create more room." };
  }
  return { margin, spendingRatio, status: "over", message: "Spending outran income—let’s find the biggest leak." };
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function shiftMonth(month: string, offset: number): string {
  const [year, value] = month.split("-").map(Number);
  const date = new Date(year, value - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function filterTransactions(transactions: Transaction[], filters: { month?: string; account?: string; type?: Transaction["type"] | "all"; category?: string }): Transaction[] {
  return transactions.filter(transaction => (!filters.month || monthKey(transaction.date) === filters.month) && (!filters.account || transaction.account === filters.account) && (!filters.type || filters.type === "all" || transaction.type === filters.type) && (!filters.category || transaction.category === filters.category));
}

export function expenseCategoryTotals(transactions: Transaction[], categories: string[]): number[] {
  const namedCategories = categories.slice(0, -1);
  return categories.map(category => transactions.filter(transaction => transaction.type === "expense" && (category === "Other" ? !namedCategories.includes(transaction.category) : transaction.category === category)).reduce((sum, transaction) => sum + transaction.amount, 0));
}
