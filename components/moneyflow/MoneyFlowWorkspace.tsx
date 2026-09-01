"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useBackendFinance } from "../../hooks/useBackendFinance";
import { apiBaseUrl, financeApi } from "../../services/api";
import { downloadTransactionsCsv } from "../../services/transactionExport";
import { Accounts } from "./Accounts";
import { AddTransactionModal } from "./AddTransactionModal";
import { AuthScreen } from "./AuthScreen";
import { Feature } from "./Feature";
import { Overview } from "./Overview";
import { PageHeading } from "./PageHeading";
import { RecurringBills } from "./RecurringBills";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Transactions } from "./Transactions";
import { Tab, Transaction } from "./types";

export function MoneyFlowWorkspace() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview"); const [showAdd, setShowAdd] = useState(false); const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null); const [toast, setToast] = useState("");
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
  const editTransaction = async (event: React.FormEvent<HTMLFormElement>) => { try { if (!editingTransaction) return; await backendFinance.editTransaction(editingTransaction.id, event); setEditingTransaction(null); notify("Transaction updated"); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not update transaction"); } };
  const exportCsv = () => { downloadTransactionsCsv(transactions); notify("CSV exported"); };
  const backup = async () => { try { const data = await financeApi.exportFinances(); const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `moneyflow-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); notify("Full backup downloaded."); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not download backup."); } };
  const logout = async () => { await auth.logout(); notify("You have been logged out"); };
  const content = backendFinance.error ? <div className="auth-error" role="alert">{backendFinance.error}</div> : activeTab === "Overview" ? <Overview transactions={transactions} balance={balance} recurringBills={backendFinance.recurringBills} onViewTransactions={() => setActiveTab("Transactions")} onViewRecurringBills={() => setActiveTab("Recurring Bills")} onNotice={notify} /> : activeTab === "Transactions" ? <Transactions transactions={transactions} exportCsv={exportCsv} edit={setEditingTransaction} remove={id => { void removeTransaction(id); }} /> : activeTab === "Accounts" ? <Accounts accounts={accounts} onSubmit={addAccount} onRemove={async id => { try { await backendFinance.removeAccount(id); notify("Account archived; transactions were preserved."); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not archive account."); } }} /> : activeTab === "Recurring Bills" ? <RecurringBills bills={backendFinance.recurringBills} onSubmit={async event => { try { await backendFinance.addRecurringBill(event); notify("Recurring bill saved successfully."); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not save recurring bill."); } }} onRemove={async id => { try { await backendFinance.removeRecurringBill(id); notify("Recurring bill archived."); } catch (cause) { notify(cause instanceof Error ? cause.message : "Could not archive recurring bill."); } }} /> : <Feature tab={activeTab} budgets={backendFinance.budgets} loans={backendFinance.loans} goals={backendFinance.goals} loanPayments={backendFinance.loanPayments} onAddBudget={backendFinance.addBudget} onAddLoan={backendFinance.addLoan} onAddGoal={backendFinance.addGoal} onAddLoanPayment={backendFinance.addLoanPayment} onRemoveBudget={backendFinance.removeBudget} onRemoveLoan={backendFinance.removeLoan} onRemoveGoal={backendFinance.removeGoal} onRemoveLoanPayment={backendFinance.removeLoanPayment} onNotice={notify} />;
  return <main className="shell"><Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={auth.user!} onProfileClick={() => notify("Use the profile menu in the top bar to sign out.")} /><section className="content"><Topbar user={auth.user!} onLogout={logout} onNotice={notify} onBackup={() => { void backup(); }} /><PageHeading activeTab={activeTab} displayName={auth.user!.display_name} onAddTransaction={() => setShowAdd(true)} />{content}<footer>MoneyFlow <span>·</span> Built for a clearer relationship with money</footer></section>{showAdd && <AddTransactionModal accounts={accounts} onClose={() => setShowAdd(false)} onSubmit={addTransaction} />}{editingTransaction && <AddTransactionModal accounts={accounts} initialTransaction={editingTransaction} onClose={() => setEditingTransaction(null)} onSubmit={editTransaction} />}{toast && <div className="toast">✓ {toast}</div>}</main>;
}
