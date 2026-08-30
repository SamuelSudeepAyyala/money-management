"use client";

import { useEffect, useMemo, useState } from "react";
import { Accounts } from "./Accounts";
import { AddTransactionModal } from "./AddTransactionModal";
import { demoAccounts, demoTransactionIds, demoTransactions } from "./data";
import { Feature } from "./Feature";
import { Overview } from "./Overview";
import { PageHeading } from "./PageHeading";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Transactions } from "./Transactions";
import { Account, Tab, Transaction } from "./types";

export function MoneyFlowWorkspace() {
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions); const [accounts, setAccounts] = useState<Account[]>(demoAccounts); const [showAdd, setShowAdd] = useState(false); const [activeTab, setActiveTab] = useState<Tab>("Overview"); const [toast, setToast] = useState("");
  useEffect(() => { const saved = window.localStorage.getItem("moneyflow-demo-transactions"); if (saved) { try { setTransactions(JSON.parse(saved)); } catch { window.localStorage.removeItem("moneyflow-demo-transactions"); } } }, []);
  useEffect(() => window.localStorage.setItem("moneyflow-demo-transactions", JSON.stringify(transactions)), [transactions]);
  useEffect(() => { const saved = window.localStorage.getItem("moneyflow-demo-accounts"); if (saved) { try { setAccounts(JSON.parse(saved)); } catch { window.localStorage.removeItem("moneyflow-demo-accounts"); } } }, []);
  useEffect(() => window.localStorage.setItem("moneyflow-demo-accounts", JSON.stringify(accounts)), [accounts]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2500); };
  const addTransaction = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const type = data.get("type") as "expense" | "income"; setTransactions(current => [{ id: crypto.randomUUID(), name: String(data.get("name")), category: String(data.get("category")), date: "Just now", amount: Number(data.get("amount")), type, account: String(data.get("account")), notes: String(data.get("notes") || "") }, ...current]); setShowAdd(false); notify("Transaction added"); };
  const addAccount = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); setAccounts(current => [...current, { id: crypto.randomUUID(), name: String(data.get("name")), type: String(data.get("type")), balance: Number(data.get("balance")), currency: "USD" }]); notify("Account added"); event.currentTarget.reset(); };
  const resetDemo = () => { setTransactions(demoTransactions); setAccounts(demoAccounts); notify("Demo data reset"); };
  const exportTransactions = () => { const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`; const rows = ["Date,Name,Type,Category,Account,Amount,Notes", ...transactions.map(t => [t.date, t.name, t.type, t.category, t.account, t.amount.toFixed(2), t.notes || ""].map(escape).join(","))]; const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "moneyflow-transactions.csv"; link.click(); URL.revokeObjectURL(url); notify("CSV exported"); };
  const balanceAdjustment = useMemo(() => transactions.filter(transaction => !demoTransactionIds.has(transaction.id)).reduce((sum, transaction) => sum + (transaction.type === "income" ? transaction.amount : -transaction.amount), 0), [transactions]);
  const balance = accounts.reduce((sum, account) => sum + account.balance, 0) + balanceAdjustment;
  const content = activeTab === "Overview" ? <Overview transactions={transactions} balance={balance} onViewTransactions={() => setActiveTab("Transactions")} /> : activeTab === "Transactions" ? <Transactions transactions={transactions} exportCsv={exportTransactions} remove={id => { setTransactions(current => current.filter(transaction => transaction.id !== id)); notify("Transaction removed"); }} /> : activeTab === "Accounts" ? <Accounts accounts={accounts} onSubmit={addAccount} /> : <Feature tab={activeTab} />;
  return <main className="shell"><Sidebar activeTab={activeTab} onTabChange={setActiveTab} onReset={resetDemo} /><section className="content"><Topbar /><PageHeading activeTab={activeTab} onAddTransaction={() => setShowAdd(true)} />{content}<footer>MoneyFlow <span>·</span> Built for a clearer relationship with money</footer></section>{showAdd && <AddTransactionModal accounts={accounts} onClose={() => setShowAdd(false)} onSubmit={addTransaction} />}{toast && <div className="toast">✓ {toast}</div>}</main>;
}
