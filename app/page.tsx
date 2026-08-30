"use client";

import { useState } from "react";

type Transaction = { name: string; category: string; date: string; amount: number; type: "expense" | "income" };

const initialTransactions: Transaction[] = [
  { name: "Salary deposit", category: "Income", date: "Today", amount: 4200, type: "income" },
  { name: "Rent payment", category: "Housing", date: "Yesterday", amount: 1450, type: "expense" },
  { name: "Kroger", category: "Groceries", date: "Yesterday", amount: 86.42, type: "expense" },
  { name: "Spotify", category: "Subscriptions", date: "Aug 27", amount: 11.99, type: "expense" }
];

export default function Home() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [toast, setToast] = useState("");

  const addTransaction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = Number(data.get("amount"));
    const type = data.get("type") as "expense" | "income";
    setTransactions([{ name: String(data.get("name")), category: String(data.get("category")), date: "Just now", amount, type }, ...transactions]);
    setShowAdd(false);
    setToast("Transaction added");
    window.setTimeout(() => setToast(""), 2500);
  };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✦</span><span>Money<span className="brand-accent">Flow</span></span></div>
        <div className="profile"><div className="avatar">AS</div><div><strong>Samuel</strong><small>Personal workspace</small></div><span className="chevron">⌄</span></div>
        <nav className="nav">
          {["Overview", "Transactions", "Accounts", "Budgets", "Loans", "Goals"].map((item, index) => <button className={activeTab === item ? "nav-item active" : "nav-item"} onClick={() => setActiveTab(item)} key={item}><span className="nav-icon">{["⌂", "↕", "▣", "◒", "▤", "◎"][index]}</span>{item}</button>)}
        </nav>
        <div className="sidebar-bottom"><button className="nav-item"><span className="nav-icon">⚙</span>Settings</button><div className="secure-note"><span>◉</span><div><strong>Your data is private</strong><small>Encrypted and only visible to you</small></div></div></div>
      </aside>

      <section className="content">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark">✦</span>Money<span className="brand-accent">Flow</span></div><div className="top-actions"><button className="icon-button">⌕</button><button className="icon-button notification">♢<i /></button><div className="avatar small">AS</div></div></header>
        <div className="page-heading"><div><p className="eyebrow">SATURDAY, AUGUST 30, 2026</p><h1>Good evening, Samuel <span>✦</span></h1><p className="subheading">Here&apos;s how your money is doing this month.</p></div><button className="primary-button" onClick={() => setShowAdd(true)}><span>＋</span> Add transaction</button></div>

        <div className="stats-grid"><article className="stat-card balance-card"><div className="stat-label">TOTAL BALANCE <span className="help">?</span></div><div className="stat-value">$8,426<span className="cents">.18</span></div><div className="stat-foot positive">↗ 12.8% <span>vs last month</span></div><div className="sparkline"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></article><article className="stat-card"><div className="stat-label">INCOME <span className="period">THIS MONTH⌄</span></div><div className="stat-value">$4,200<span className="cents">.00</span></div><div className="stat-foot positive">↗ 4.2% <span>vs last month</span></div></article><article className="stat-card"><div className="stat-label">SPENDING <span className="period">THIS MONTH⌄</span></div><div className="stat-value">$1,847<span className="cents">.63</span></div><div className="stat-foot negative">↘ 8.1% <span>vs last month</span></div></article><article className="stat-card"><div className="stat-label">SAVINGS RATE <span className="help">?</span></div><div className="stat-value">56<span className="cents">%</span></div><div className="progress"><span style={{ width: "56%" }} /></div><div className="stat-foot">Great job! <span>Target is 40%</span></div></article></div>

        <div className="section-grid"><section className="panel spending-panel"><div className="panel-heading"><div><h2>Spending overview</h2><p>Where your money went this month</p></div><button className="select-button">This month⌄</button></div><div className="chart-area"><div className="donut"><div className="donut-center"><strong>$1,847</strong><small>total spent</small></div></div><div className="legend"><Legend color="#5874e8" label="Housing" amount="$1,450" percent="78.5%" /><Legend color="#e5ad54" label="Food & groceries" amount="$205.42" percent="11.1%" /><Legend color="#8b78d5" label="Subscriptions" amount="$124.20" percent="6.7%" /><Legend color="#b9c5f4" label="Other" amount="$67.99" percent="3.7%" /></div></div></section><section className="panel upcoming-panel"><div className="panel-heading"><div><h2>Upcoming</h2><p>Payments due soon</p></div><button className="text-button">View all →</button></div><Upcoming icon="▤" title="Education loan" meta="Due in 11 days · Sep 11" amount="$223.67" color="blue" /><Upcoming icon="⌂" title="Rent" meta="Due in 15 days · Sep 15" amount="$1,450.00" color="purple" /><Upcoming icon="◌" title="Car insurance" meta="Due in 22 days · Sep 22" amount="$118.40" color="gold" /><button className="add-recurring">＋ Add recurring payment</button></section></div>

        <section className="panel transactions-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Your latest money activity</p></div><button className="text-button">View all →</button></div><div className="transaction-list">{transactions.map((transaction, index) => <div className="transaction" key={`${transaction.name}-${index}`}><div className={`transaction-icon ${transaction.type}`}>{transaction.type === "income" ? "↗" : transaction.category === "Housing" ? "⌂" : transaction.category === "Groceries" ? "✣" : "◌"}</div><div className="transaction-main"><strong>{transaction.name}</strong><small>{transaction.category} · {transaction.date}</small></div><strong className={transaction.type === "income" ? "amount income" : "amount"}>{transaction.type === "income" ? "+" : "−"}${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>)}</div></section>
        <footer>MoneyFlow <span>·</span> Built for a clearer relationship with money</footer>
      </section>

      {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><form className="modal" onSubmit={addTransaction} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">QUICK ENTRY</p><h2>Add transaction</h2></div><button type="button" className="close-button" onClick={() => setShowAdd(false)}>×</button></div><label>Type<select name="type" defaultValue="expense"><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Name<input name="name" placeholder="e.g. Coffee shop" required /></label><label>Amount<input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required /></label><label>Category<select name="category" defaultValue="Other"><option>Housing</option><option>Food & groceries</option><option>Transportation</option><option>Subscriptions</option><option>Other</option></select></label><button className="primary-button full" type="submit">Save transaction</button></form></div>}
      {toast && <div className="toast">✓ {toast}</div>}
    </main>
  );
}

function Legend({ color, label, amount, percent }: { color: string; label: string; amount: string; percent: string }) { return <div className="legend-item"><span className="legend-dot" style={{ background: color }} /><span>{label}</span><strong>{amount}</strong><small>{percent}</small></div>; }
function Upcoming({ icon, title, meta, amount, color }: { icon: string; title: string; meta: string; amount: string; color: string }) { return <div className="upcoming"><span className={`upcoming-icon ${color}`}>{icon}</span><div><strong>{title}</strong><small>{meta}</small></div><b>{amount}</b></div>; }
