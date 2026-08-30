"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useBackendFinance } from "../../hooks/useBackendFinance";
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
  const auth = useAuth(); const backendEnabled = Boolean(apiBaseUrl && auth.user); const backendFinance = useBackendFinance(backendEnabled);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2500); };
  if (!apiBaseUrl) return <main className="auth-shell"><section className="auth-card"><div className="brand auth-brand"><span className="brand-mark">✦</span><span>Money<span className="brand-accent">Flow</span></span></div><h1>Configuration required</h1><p className="auth-subtitle">This hosted build requires the MoneyFlow API URL. Set NEXT_PUBLIC_API_URL before running the app locally.</p></section></main>;
  if (apiBaseUrl && auth.loading) return <main className="auth-shell"><p>Loading your secure session…</p></main>;
  if (apiBaseUrl && !auth.user) return <AuthScreen error={auth.error} loading={auth.loading} onLogin={auth.login} onRegister={auth.register} />;
  if (backendEnabled && backendFinance.loading) return <main className="auth-shell"><p>Loading your finances…</p></main>;
  const accounts = backendFinance.accounts; const transactions = backendFinance.transactions; const balance = backendFinance.balance;
  const addTransaction = async (event: React.FormEvent<HTMLFormElement>) => { try { await backendFinance.addTransaction(event); setShowAdd(false); notify("Transaction added"); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not add transaction"); } };
  const addAccount = async (event: React.FormEvent<HTMLFormElement>) => { try { await backendFinance.addAccount(event); notify("Account added"); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not add account"); } };
  const removeTransaction = async (id: string) => { try { await backendFinance.removeTransaction(id); notify("Transaction removed"); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not remove transaction"); } };
  const exportCsv = () => { downloadTransactionsCsv(transactions); notify("CSV exported"); };
  const logout = async () => { await auth.logout(); notify("You have been logged out"); };
  const content = backendFinance.error ? <div className="auth-error" role="alert">{backendFinance.error}</div> : activeTab === "Overview" ? <Overview transactions={transactions} balance={balance} onViewTransactions={() => setActiveTab("Transactions")} onNotice={notify} /> : activeTab === "Transactions" ? <Transactions transactions={transactions} exportCsv={exportCsv} remove={id => { void removeTransaction(id); }} /> : activeTab === "Accounts" ? <Accounts accounts={accounts} onSubmit={addAccount} /> : <Feature tab={activeTab} budgets={backendFinance.budgets} loans={backendFinance.loans} goals={backendFinance.goals} loanPayments={backendFinance.loanPayments} onAddBudget={backendFinance.addBudget} onAddLoan={backendFinance.addLoan} onAddGoal={backendFinance.addGoal} onAddLoanPayment={backendFinance.addLoanPayment} onRemoveBudget={backendFinance.removeBudget} onRemoveLoan={backendFinance.removeLoan} onRemoveGoal={backendFinance.removeGoal} onRemoveLoanPayment={backendFinance.removeLoanPayment} onNotice={notify} />;
  return <main className="shell"><Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={auth.user!} onProfileClick={() => notify("Use the profile menu in the top bar to sign out.")} /><section className="content"><Topbar user={auth.user!} onLogout={logout} onNotice={notify} /><PageHeading activeTab={activeTab} onAddTransaction={() => setShowAdd(true)} />{content}<footer>MoneyFlow <span>·</span> Built for a clearer relationship with money</footer></section>{showAdd && <AddTransactionModal accounts={accounts} onClose={() => setShowAdd(false)} onSubmit={addTransaction} />}{toast && <div className="toast">✓ {toast}</div>}</main>;
}
