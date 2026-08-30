import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { financeApi, ApiAccount, ApiTransaction } from "../services/api";
import { Account, Transaction } from "../components/moneyflow/types";

function mapRecords(accounts: ApiAccount[], transactions: ApiTransaction[]) {
  const names = new Map(accounts.map(account => [account.id, account.name]));
  const uiTransactions: Transaction[] = transactions.map(transaction => ({ id: String(transaction.id), name: transaction.name, category: transaction.category, date: transaction.occurred_on, amount: Number(transaction.amount), type: transaction.transaction_type, account: names.get(transaction.account_id) || "Unknown account", notes: transaction.notes }));
  const balances = new Map<number, number>(accounts.map(account => [account.id, Number(account.opening_balance)]));
  transactions.forEach(transaction => balances.set(transaction.account_id, (balances.get(transaction.account_id) || 0) + (transaction.transaction_type === "income" ? Number(transaction.amount) : -Number(transaction.amount))));
  const uiAccounts: Account[] = accounts.map(account => ({ id: String(account.id), name: account.name, type: account.account_type, balance: balances.get(account.id) || 0, currency: account.currency }));
  return { accounts: uiAccounts, transactions: uiTransactions };
}

export function useBackendFinance(enabled: boolean) {
  const [accounts, setAccounts] = useState<Account[]>([]); const [transactions, setTransactions] = useState<Transaction[]>([]); const [loading, setLoading] = useState(enabled); const [error, setError] = useState("");
  const refresh = useCallback(async () => { if (!enabled) return; setLoading(true); setError(""); try { const [apiAccounts, apiTransactions] = await Promise.all([financeApi.accounts(), financeApi.transactions()]); const mapped = mapRecords(apiAccounts, apiTransactions); setAccounts(mapped.accounts); setTransactions(mapped.transactions); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load your finances."); } finally { setLoading(false); } }, [enabled]);
  useEffect(() => { void refresh(); }, [refresh]);
  const addTransaction = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const account = accounts.find(item => item.name === String(data.get("account"))); if (!account) throw new Error("Choose an account first."); await financeApi.createTransaction({ account_id: Number(account.id), transaction_type: data.get("type") as "expense" | "income", amount: Number(data.get("amount")), name: String(data.get("name")), category: String(data.get("category")), notes: String(data.get("notes") || ""), occurred_on: new Date().toISOString().slice(0, 10) }); await refresh(); };
  const addAccount = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); await financeApi.createAccount({ name: String(data.get("name")), account_type: String(data.get("type")).toLowerCase(), currency: "USD", opening_balance: Number(data.get("balance")) }); await refresh(); event.currentTarget.reset(); };
  const removeTransaction = async (id: string) => { await financeApi.deleteTransaction(id); await refresh(); };
  const income = transactions.filter(transaction => transaction.type === "income").reduce((sum, transaction) => sum + transaction.amount, 0); const spending = transactions.filter(transaction => transaction.type === "expense").reduce((sum, transaction) => sum + transaction.amount, 0);
  return { accounts, transactions, balance: useMemo(() => accounts.reduce((sum, account) => sum + account.balance, 0), [accounts]), totals: { income, spending }, loading, error, addTransaction, addAccount, removeTransaction };
}

