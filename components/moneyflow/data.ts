import { Account, Transaction } from "./types";

export const demoAccounts: Account[] = [
  { id: "checking", name: "Bank of America Checking", type: "Checking", balance: 8426.18, currency: "USD" },
  { id: "savings", name: "Emergency Savings", type: "Savings", balance: 5200, currency: "USD" },
  { id: "cash", name: "Cash wallet", type: "Cash", balance: 185, currency: "USD" }
];

export const demoTransactions: Transaction[] = [
  { id: "salary", name: "Salary deposit", category: "Income", date: "Today", amount: 4200, type: "income", account: "Bank of America Checking" },
  { id: "rent", name: "Rent payment", category: "Housing", date: "Yesterday", amount: 1450, type: "expense", account: "Bank of America Checking" },
  { id: "kroger", name: "Kroger", category: "Food & groceries", date: "Yesterday", amount: 86.42, type: "expense", account: "Bank of America Checking" },
  { id: "spotify", name: "Spotify", category: "Subscriptions", date: "Aug 27", amount: 11.99, type: "expense", account: "Bank of America Checking" }
];

export const demoTransactionIds = new Set(demoTransactions.map(transaction => transaction.id));

