import { useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { demoAccounts, demoTransactionIds, demoTransactions } from "../components/moneyflow/data";
import { downloadTransactionsCsv } from "../services/transactionExport";
import { Account, Transaction } from "../components/moneyflow/types";

export function useDemoFinance() {
  const [transactions, setTransactions] = usePersistentState<Transaction[]>("moneyflow-demo-transactions", demoTransactions);
  const [accounts, setAccounts] = usePersistentState<Account[]>("moneyflow-demo-accounts", demoAccounts);
  const balanceAdjustment = useMemo(() => transactions.filter(transaction => !demoTransactionIds.has(transaction.id)).reduce((sum, transaction) => sum + (transaction.type === "income" ? transaction.amount : -transaction.amount), 0), [transactions]);
  const balance = accounts.reduce((sum, account) => sum + account.balance, 0) + balanceAdjustment;

  return {
    transactions,
    accounts,
    balance,
    addTransaction: (transaction: Omit<Transaction, "id">) => setTransactions(current => [{ ...transaction, id: crypto.randomUUID() }, ...current]),
    removeTransaction: (id: string) => setTransactions(current => current.filter(transaction => transaction.id !== id)),
    addAccount: (account: Omit<Account, "id">) => setAccounts(current => [...current, { ...account, id: crypto.randomUUID() }]),
    resetDemo: () => { setTransactions(demoTransactions); setAccounts(demoAccounts); },
    exportTransactions: () => downloadTransactionsCsv(transactions)
  };
}

