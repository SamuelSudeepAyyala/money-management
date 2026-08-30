"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useDemoFinance } from "../../hooks/useDemoFinance";
import { apiBaseUrl } from "../../services/api";
import { Accounts } from "./Accounts";
import { AddTransactionModal } from "./AddTransactionModal";
import { AuthScreen } from "./AuthScreen";
import { Feature } from "./Feature";
import { Overview } from "./Overview";
import { PageHeading } from "./PageHeading";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Transactions } from "./Transactions";
import { Tab } from "./types";

export function MoneyFlowWorkspace() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview"); const [showAdd, setShowAdd] = useState(false); const [toast, setToast] = useState("");
  const auth = useAuth();
  const finance = useDemoFinance();
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2500); };
  const addTransaction = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); finance.addTransaction({ name: String(data.get("name")), category: String(data.get("category")), date: "Just now", amount: Number(data.get("amount")), type: data.get("type") as "expense" | "income", account: String(data.get("account")), notes: String(data.get("notes") || "") }); setShowAdd(false); notify("Transaction added"); };
  const addAccount = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); finance.addAccount({ name: String(data.get("name")), type: String(data.get("type")), balance: Number(data.get("balance")), currency: "USD" }); notify("Account added"); event.currentTarget.reset(); };
  const resetDemo = () => { finance.resetDemo(); notify("Demo data reset"); };
  if (apiBaseUrl && auth.loading) return <main className="auth-shell"><p>Loading your secure session…</p></main>;
  if (apiBaseUrl && !auth.user) return <AuthScreen error={auth.error} loading={auth.loading} onLogin={auth.login} onRegister={auth.register} />;
  const content = activeTab === "Overview" ? <Overview transactions={finance.transactions} balance={finance.balance} onViewTransactions={() => setActiveTab("Transactions")} /> : activeTab === "Transactions" ? <Transactions transactions={finance.transactions} exportCsv={() => { finance.exportTransactions(); notify("CSV exported"); }} remove={id => { finance.removeTransaction(id); notify("Transaction removed"); }} /> : activeTab === "Accounts" ? <Accounts accounts={finance.accounts} onSubmit={addAccount} /> : <Feature tab={activeTab} />;
  return <main className="shell"><Sidebar activeTab={activeTab} onTabChange={setActiveTab} onReset={resetDemo} /><section className="content"><Topbar /><PageHeading activeTab={activeTab} onAddTransaction={() => setShowAdd(true)} />{content}<footer>MoneyFlow <span>·</span> Built for a clearer relationship with money</footer></section>{showAdd && <AddTransactionModal accounts={finance.accounts} onClose={() => setShowAdd(false)} onSubmit={addTransaction} />}{toast && <div className="toast">✓ {toast}</div>}</main>;
}
