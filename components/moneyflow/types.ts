export type Tab = "Overview" | "Transactions" | "Accounts" | "Budgets" | "Loans" | "Goals";

export type Transaction = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: "expense" | "income";
  account: string;
  notes?: string;
};

export type Account = { id: string; name: string; type: string; balance: number; currency: string };

