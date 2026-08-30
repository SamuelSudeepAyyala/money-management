"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "Overview" | "Transactions" | "Accounts" | "Budgets" | "Loans" | "Goals";
type Transaction = { id: string; name: string; category: string; date: string; amount: number; type: "expense" | "income"; account: string; notes?: string };
type Account = { id: string; name: string; type: string; balance: number; currency: string };

const demoAccounts: Account[] = [
  { id: "checking", name: "Bank of America Checking", type: "Checking", balance: 8426.18, currency: "USD" },
  { id: "savings", name: "Emergency Savings", type: "Savings", balance: 5200, currency: "USD" },
  { id: "cash", name: "Cash wallet", type: "Cash", balance: 185, currency: "USD" }
];
const demoTransactions: Transaction[] = [
  { id: "salary", name: "Salary deposit", category: "Income", date: "Today", amount: 4200, type: "income", account: "Bank of America Checking" },
  { id: "rent", name: "Rent payment", category: "Housing", date: "Yesterday", amount: 1450, type: "expense", account: "Bank of America Checking" },
  { id: "kroger", name: "Kroger", category: "Food & groceries", date: "Yesterday", amount: 86.42, type: "expense", account: "Bank of America Checking" },
  { id: "spotify", name: "Spotify", category: "Subscriptions", date: "Aug 27", amount: 11.99, type: "expense", account: "Bank of America Checking" }
];
const demoTransactionIds = new Set(demoTransactions.map(t => t.id));
const currency = (amount: number) => `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions);
  const [accounts, setAccounts] = useState<Account[]>(demoAccounts);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("moneyflow-demo-transactions");
    if (saved) {
      try { setTransactions(JSON.parse(saved)); } catch { window.localStorage.removeItem("moneyflow-demo-transactions"); }
    }
  }, []);
  useEffect(() => window.localStorage.setItem("moneyflow-demo-transactions", JSON.stringify(transactions)), [transactions]);
  useEffect(() => {
    const saved = window.localStorage.getItem("moneyflow-demo-accounts");
    if (saved) {
      try { setAccounts(JSON.parse(saved)); } catch { window.localStorage.removeItem("moneyflow-demo-accounts"); }
    }
  }, []);
  useEffect(() => window.localStorage.setItem("moneyflow-demo-accounts", JSON.stringify(accounts)), [accounts]);

  const totals = useMemo(() => ({ income: transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0), spending: transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) }), [transactions]);
  const balanceAdjustment = useMemo(() => transactions.filter(t => !demoTransactionIds.has(t.id)).reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0), [transactions]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2500); };
  const addTransaction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const type = data.get("type") as "expense" | "income";
    const next: Transaction = { id: crypto.randomUUID(), name: String(data.get("name")), category: String(data.get("category")), date: "Just now", amount: Number(data.get("amount")), type, account: String(data.get("account")), notes: String(data.get("notes") || "") };
    setTransactions(current => [next, ...current]); setShowAdd(false); notify("Transaction added");
  };
  const addAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    setAccounts(current => [...current, { id: crypto.randomUUID(), name: String(data.get("name")), type: String(data.get("type")), balance: Number(data.get("balance")), currency: "USD" }]); notify("Account added"); event.currentTarget.reset();
  };
  const resetDemo = () => { setTransactions(demoTransactions); setAccounts(demoAccounts); notify("Demo data reset"); };

  return <main className="shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">✦</span><span>Money<span className="brand-accent">Flow</span></span></div><div className="profile"><div className="avatar">AS</div><div><strong>Samuel</strong><small>Personal workspace</small></div><span className="chevron">⌄</span></div><nav className="nav">{(["Overview", "Transactions", "Accounts", "Budgets", "Loans", "Goals"] as Tab[]).map((item, index) => <button className={activeTab === item ? "nav-item active" : "nav-item"} onClick={() => setActiveTab(item)} key={item}><span className="nav-icon">{["⌂", "↕", "▣", "◒", "▤", "◎"][index]}</span>{item}</button>)}</nav><div className="sidebar-bottom"><button className="nav-item" onClick={resetDemo}><span className="nav-icon">↺</span>Reset demo</button><div className="secure-note"><span>◉</span><div><strong>Demo mode</strong><small>Saved in this browser only</small></div></div></div></aside>
    <section className="content"><header className="topbar"><div className="mobile-brand"><span className="brand-mark">✦</span>Money<span className="brand-accent">Flow</span></div><div className="top-actions"><button className="icon-button">⌕</button><button className="icon-button notification">♢<i /></button><div className="avatar small">AS</div></div></header>
      <div className="page-heading"><div><p className="eyebrow">PERSONAL FINANCE · DEMO MODE</p><h1>{activeTab === "Overview" ? "Good evening, Samuel" : activeTab}<span> ✦</span></h1><p className="subheading">{activeTab === "Overview" ? "Here's how your money is doing this month." : `Manage your ${activeTab.toLowerCase()} in one place.`}</p></div><button className="primary-button" onClick={() => setShowAdd(true)}><span>＋</span> Add transaction</button></div>
      {activeTab === "Overview" ? <Overview transactions={transactions} totals={totals} balance={accounts.reduce((sum, account) => sum + account.balance, 0) + balanceAdjustment} /> : activeTab === "Transactions" ? <Transactions transactions={transactions} remove={(id) => { setTransactions(current => current.filter(t => t.id !== id)); notify("Transaction removed"); }} /> : activeTab === "Accounts" ? <Accounts accounts={accounts} onSubmit={addAccount} /> : <Feature tab={activeTab} />}
      <footer>MoneyFlow <span>·</span> Built for a clearer relationship with money</footer>
    </section>
    {showAdd && <AddModal accounts={accounts} onClose={() => setShowAdd(false)} onSubmit={addTransaction} />}{toast && <div className="toast">✓ {toast}</div>}
  </main>;
}

function Overview({ transactions, totals, balance }: { transactions: Transaction[]; totals: { income: number; spending: number }; balance: number }) {
  const rate = totals.income ? Math.max(0, Math.round((1 - totals.spending / totals.income) * 100)) : 0;
  return <><div className="stats-grid"><article className="stat-card balance-card"><div className="stat-label">TOTAL BALANCE <span className="help">?</span></div><div className="stat-value">{currency(balance)}</div><div className="stat-foot positive">↗ 12.8% <span>vs last month</span></div><div className="sparkline"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></article><article className="stat-card"><div className="stat-label">INCOME <span className="period">THIS MONTH⌄</span></div><div className="stat-value">{currency(totals.income)}</div><div className="stat-foot positive">↗ Updated live <span>from transactions</span></div></article><article className="stat-card"><div className="stat-label">SPENDING <span className="period">THIS MONTH⌄</span></div><div className="stat-value">{currency(totals.spending)}</div><div className="stat-foot negative">↘ Tracked live <span>from transactions</span></div></article><article className="stat-card"><div className="stat-label">SAVINGS RATE <span className="help">?</span></div><div className="stat-value">{rate}<span className="cents">%</span></div><div className="progress"><span style={{ width: `${rate}%` }} /></div><div className="stat-foot">Based on entries <span>Target is 40%</span></div></article></div><div className="section-grid"><section className="panel spending-panel"><div className="panel-heading"><div><h2>Spending overview</h2><p>Where your money went this month</p></div><button className="select-button">This month⌄</button></div><div className="chart-area"><div className="donut"><div className="donut-center"><strong>{currency(totals.spending)}</strong><small>total spent</small></div></div><div className="legend">{["Housing", "Food & groceries", "Subscriptions", "Other"].map((cat, i) => { const amount = transactions.filter(t => t.type === "expense" && (i === 3 ? !["Housing", "Food & groceries", "Subscriptions"].includes(t.category) : t.category === cat)).reduce((s, t) => s + t.amount, 0); return <Legend key={cat} color={["#5874e8", "#e5ad54", "#8b78d5", "#b9c5f4"][i]} label={cat} amount={currency(amount)} percent={totals.spending ? `${((amount / totals.spending) * 100).toFixed(1)}%` : "0%"} />; })}</div></div></section><section className="panel upcoming-panel"><div className="panel-heading"><div><h2>Upcoming</h2><p>Payments due soon</p></div><button className="text-button">View all →</button></div><Upcoming icon="▤" title="Education loan" meta="Due in 11 days · Sep 11" amount="$223.67" color="blue" /><Upcoming icon="⌂" title="Rent" meta="Due in 15 days · Sep 15" amount="$1,450.00" color="purple" /><Upcoming icon="◌" title="Car insurance" meta="Due in 22 days · Sep 22" amount="$118.40" color="gold" /></section></div><Transactions transactions={transactions.slice(0, 5)} compact /></>;
}
function Transactions({ transactions, compact = false, remove }: { transactions: Transaction[]; compact?: boolean; remove?: (id: string) => void }) { return <section className="panel transactions-panel"><div className="panel-heading"><div><h2>{compact ? "Recent transactions" : "All transactions"}</h2><p>{compact ? "Your latest money activity" : `${transactions.length} transactions in demo mode`}</p></div>{compact && <button className="text-button">View all →</button>}</div><div className="transaction-list">{transactions.length ? transactions.map(t => <div className="transaction" key={t.id}><div className={`transaction-icon ${t.type}`}>{t.type === "income" ? "↗" : t.category === "Housing" ? "⌂" : "✣"}</div><div className="transaction-main"><strong>{t.name}</strong><small>{t.category} · {t.account} · {t.date}</small></div><strong className={t.type === "income" ? "amount income" : "amount"}>{t.type === "income" ? "+" : "−"}{currency(t.amount)} {remove && <button className="delete-link" onClick={() => remove(t.id)}>×</button>}</strong></div>) : <div className="empty-state">No transactions yet. Add your first one.</div>}</div></section>; }
function Accounts({ accounts, onSubmit }: { accounts: Account[]; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) { return <div className="feature-grid"><section className="panel"><div className="panel-heading"><div><h2>Your accounts</h2><p>Balances across your money</p></div></div>{accounts.map(a => <div className="account-row" key={a.id}><div className="account-icon">▣</div><div><strong>{a.name}</strong><small>{a.type} · {a.currency}</small></div><b>{currency(a.balance)}</b></div>)}</section><form className="panel inline-form" onSubmit={onSubmit}><h2>Add an account</h2><p>Create a checking, savings, cash, or credit account.</p><label>Name<input name="name" placeholder="e.g. Credit card" required /></label><label>Type<select name="type" defaultValue="Checking"><option>Checking</option><option>Savings</option><option>Cash</option><option>Credit card</option><option>Investment</option></select></label><label>Starting balance<input name="balance" type="number" step="0.01" defaultValue="0" /></label><button className="primary-button full" type="submit">Save account</button></form></div>; }
function Feature({ tab }: { tab: Tab }) {
  const config: Record<string, { title: string; text: string; fields: string[]; seed: string[] }> = {
    Budgets: { title: "Monthly budgets", text: "Set limits and understand category spending.", fields: ["Category", "Monthly limit"], seed: ["Food & groceries · $205 of $400"] },
    Loans: { title: "Loan center", text: "Track principal, interest, due dates, and payoff progress.", fields: ["Loan name", "Remaining balance"], seed: ["Education loan · $223.67 due Sep 11"] },
    Goals: { title: "Financial goals", text: "Turn your plans into visible progress.", fields: ["Goal name", "Target amount"], seed: ["Emergency fund · 52% complete"] }
  };
  const selected = config[tab];
  const storageKey = `moneyflow-demo-${tab.toLowerCase()}`;
  const [records, setRecords] = useState(selected ? selected.seed : []);
  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try { setRecords(JSON.parse(saved)); } catch { window.localStorage.removeItem(storageKey); }
    }
  }, [storageKey]);
  useEffect(() => window.localStorage.setItem(storageKey, JSON.stringify(records)), [records, storageKey]);
  if (!selected) return null;
  const addRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const first = String(data.get("first")); const second = Number(data.get("second"));
    setRecords(current => [...current, `${first} · ${currency(second)}`]); setShowForm(false); event.currentTarget.reset();
  };
  return <div className="feature-grid"><section className="panel empty-feature"><div className="feature-symbol">{tab === "Loans" ? "▤" : tab === "Goals" ? "◎" : "◒"}</div><h2>{selected.title}</h2><p>{selected.text}</p><div className="record-list">{records.map((record, index) => <div className="feature-placeholder" key={`${record}-${index}`}>{record}</div>)}</div>{showForm ? <form className="inline-form feature-form" onSubmit={addRecord}><label>{selected.fields[0]}<input name="first" required /></label><label>{selected.fields[1]}<input name="second" type="number" min="0" step="0.01" required /></label><button className="primary-button full" type="submit">Save record</button></form> : <button className="primary-button" onClick={() => setShowForm(true)}>＋ Add {tab.slice(0, -1).toLowerCase()}</button>}</section><section className="panel checklist"><h2>What you can manage here</h2>{["Add and edit records", "See progress over time", "Keep everything in one view"].map(item => <div key={item}>✓ <span>{item}</span></div>)}</section></div>;
}
function AddModal({ accounts, onClose, onSubmit }: { accounts: Account[]; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) { return <div className="modal-backdrop" onClick={onClose}><form className="modal" onSubmit={onSubmit} onClick={e => e.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">QUICK ENTRY</p><h2>Add transaction</h2></div><button type="button" className="close-button" onClick={onClose}>×</button></div><label>Type<select name="type" defaultValue="expense"><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Name<input name="name" placeholder="e.g. Coffee shop" required /></label><label>Amount<input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required /></label><label>Category<select name="category" defaultValue="Other"><option>Housing</option><option>Food & groceries</option><option>Transportation</option><option>Subscriptions</option><option>Other</option></select></label><label>Account<select name="account" defaultValue={accounts[0]?.name}>{accounts.map(a => <option key={a.id}>{a.name}</option>)}</select></label><label>Notes<input name="notes" placeholder="Optional note" /></label><button className="primary-button full" type="submit">Save transaction</button></form></div>; }
function Legend({ color, label, amount, percent }: { color: string; label: string; amount: string; percent: string }) { return <div className="legend-item"><span className="legend-dot" style={{ background: color }} /><span>{label}</span><strong>{amount}</strong><small>{percent}</small></div>; }
function Upcoming({ icon, title, meta, amount, color }: { icon: string; title: string; meta: string; amount: string; color: string }) { return <div className="upcoming"><span className={`upcoming-icon ${color}`}>{icon}</span><div><strong>{title}</strong><small>{meta}</small></div><b>{amount}</b></div>; }
