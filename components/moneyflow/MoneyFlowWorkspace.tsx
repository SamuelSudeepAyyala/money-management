"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useBackendFinance } from "../../hooks/useBackendFinance";
import { useDemoFinance } from "../../hooks/useDemoFinance";
import { apiBaseUrl } from "../../services/api";
import { downloadTransactionsCsv } from "../../services/transactionExport";
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
  const auth = useAuth(); const demoFinance = useDemoFinance(); const backendEnabled = Boolean(apiBaseUrl && auth.user); const backendFinance = useBackendFinance(backendEnabled);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2500); };
  if (apiBaseUrl && auth.loading) return <main className="auth-shell"><p>Loading your secure session…</p></main>;
  if (apiBaseUrl && !auth.user) return <AuthScreen error={auth.error} loading={auth.loading} onLogin={auth.login} onRegister={auth.register} />;
  if (backendEnabled && backendFinance.loading) return <main className="auth-shell"><p>Loading your finances…</p></main>;
  const accounts = backendEnabled ? backendFinance.accounts : demoFinance.accounts; const transactions = backendEnabled ? backendFinance.transactions : demoFinance.transactions; const balance = backendEnabled ? backendFinance.balance : demoFinance.balance;
  const addTransaction = async (event: React.FormEvent<HTMLFormElement>) => { if (backendEnabled) { try { await backendFinance.addTransaction(event); setShowAdd(false); notify("Transaction added"); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not add transaction"); } return; } event.preventDefault(); const data = new FormData(event.currentTarget); demoFinance.addTransaction({ name: String(data.get("name")), category: String(data.get("category")), date: "Just now", amount: Number(data.get("amount")), type: data.get("type") as "expense" | "income", account: String(data.get("account")), notes: String(data.get("notes") || "") }); setShowAdd(false); notify("Transaction added"); };
  const addAccount = async (event: React.FormEvent<HTMLFormElement>) => { if (backendEnabled) { try { await backendFinance.addAccount(event); notify("Account added"); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not add account"); } return; } event.preventDefault(); const data = new FormData(event.currentTarget); demoFinance.addAccount({ name: String(data.get("name")), type: String(data.get("type")), balance: Number(data.get("balance")), currency: "USD" }); notify("Account added"); event.currentTarget.reset(); };
  const resetDemo = () => { if (backendEnabled) { notify("Reset is available only in demo mode"); return; } demoFinance.resetDemo(); notify("Demo data reset"); };
  const removeTransaction = async (id: string) => { try { if (backendEnabled) await backendFinance.removeTransaction(id); else demoFinance.removeTransaction(id); notify("Transaction removed"); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not remove transaction"); } };
  const exportCsv = () => { downloadTransactionsCsv(transactions); notify("CSV exported"); };
  const content = backendEnabled && backendFinance.error ? <div className="auth-error" role="alert">{backendFinance.error}</div> : activeTab === "Overview" ? <Overview transactions={transactions} balance={balance} onViewTransactions={() => setActiveTab("Transactions")} /> : activeTab === "Transactions" ? <Transactions transactions={transactions} exportCsv={exportCsv} remove={id => { void removeTransaction(id); }} /> : activeTab === "Accounts" ? <Accounts accounts={accounts} onSubmit={addAccount} /> : <Feature tab={activeTab} />;
  return <main className="shell"><Sidebar activeTab={activeTab} onTabChange={setActiveTab} onReset={resetDemo} /><section className="content"><Topbar /><PageHeading activeTab={activeTab} onAddTransaction={() => setShowAdd(true)} />{content}<footer>MoneyFlow <span>·</span> Built for a clearer relationship with money</footer></section>{showAdd && <AddTransactionModal accounts={accounts} onClose={() => setShowAdd(false)} onSubmit={addTransaction} />}{toast && <div className="toast">✓ {toast}</div>}</main>;
}
