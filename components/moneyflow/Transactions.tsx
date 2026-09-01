import { useMemo, useState } from "react";
import { localDateString } from "../../services/localDate";
import { filterTransactions } from "../../services/reporting";
import { currency } from "./format";
import { Transaction } from "./types";

function categoryIcon(transaction: Transaction) {
  if (transaction.type === "income") return "↗";
  const icons: Record<string, string> = { Housing: "⌂", "Food & groceries": "✣", "Dining out": "♨", Transportation: "➜", Shopping: "◇", Subscriptions: "↻", Utilities: "ϟ", Healthcare: "＋", Education: "▤", "Personal care": "✧", "Gifts & donations": "♡", Entertainment: "▶" };
  return icons[transaction.category] || "•";
}

function dateLabel(date: string) {
  const value = new Date(`${date}T00:00:00`);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (value.toDateString() === today.toDateString()) return "Today";
  if (value.toDateString() === yesterday.toDateString()) return "Yesterday";
  return value.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function ActionIcon({ name }: { name: "edit" | "delete" }) {
  return <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={name === "edit" ? "M4 16.5V20h3.5L18.8 8.7l-3.5-3.5L4 16.5Zm11.9-12.2 3.5 3.5 1.1-1.1a1.5 1.5 0 0 0 0-2.1l-1.4-1.4a1.5 1.5 0 0 0-2.1 0l-1.1 1.1Z" : "M5 7h14m-9 4v5m4-5v5M9 7V5.5h6V7m-8 0 .7 13h8.6L17 7"} /></svg>;
}

export function Transactions({ transactions, compact = false, remove, edit, exportCsv, onViewAll }: { transactions: Transaction[]; compact?: boolean; remove?: (id: string) => void; edit?: (transaction: Transaction) => void; exportCsv?: () => void; onViewAll?: () => void }) {
  const [month, setMonth] = useState(compact ? "" : localDateString().slice(0, 7)); const [account, setAccount] = useState(""); const [type, setType] = useState<"all" | Transaction["type"]>("all"); const [category, setCategory] = useState("");
  const accounts = useMemo(() => [...new Set(transactions.map(transaction => transaction.account))].sort(), [transactions]);
  const categories = useMemo(() => [...new Set(transactions.map(transaction => transaction.category))].sort(), [transactions]);
  const visibleTransactions = useMemo(() => filterTransactions(transactions, { month, account, type, category }), [transactions, month, account, type, category]);
  const groups = visibleTransactions.reduce<Record<string, Transaction[]>>((result, transaction) => { const key = transaction.date; (result[key] ||= []).push(transaction); return result; }, {});
  const rows = Object.entries(groups).map(([date, items]) => <div className="transaction-group" key={date}>{!compact && <h3>{dateLabel(date)}</h3>}{items.map(transaction => <div className="transaction" key={transaction.id}><div className={`transaction-icon ${transaction.type} category-${transaction.category.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{categoryIcon(transaction)}</div><div className="transaction-main"><strong>{transaction.name}</strong><small>{transaction.category} · {transaction.account} · {transaction.date}</small></div><strong className={transaction.type === "income" ? "amount income" : "amount"}>{transaction.type === "income" ? "+" : "−"}{currency(transaction.amount)} <span className="transaction-actions">{edit && <button type="button" className="icon-action edit-action" onClick={() => edit(transaction)} aria-label={`Edit ${transaction.name}`} title="Edit transaction"><ActionIcon name="edit" /></button>}{remove && <button type="button" className="icon-action delete-action" onClick={() => remove(transaction.id)} aria-label={`Remove ${transaction.name}`} title="Remove transaction"><ActionIcon name="delete" /></button>}</span></strong></div>)}</div>);
  const reset = () => { setMonth(localDateString().slice(0, 7)); setAccount(""); setType("all"); setCategory(""); };
  return <section className="panel transactions-panel"><div className="panel-heading"><div><h2>{compact ? "Recent transactions" : "All transactions"}</h2><p>{compact ? "Your latest money activity" : `${visibleTransactions.length} of ${transactions.length} transactions grouped by date`}</p></div>{compact ? <button type="button" className="text-button" onClick={onViewAll}>View all →</button> : <button type="button" className="text-button" onClick={exportCsv}>Export CSV ↓</button>}</div>{!compact && <div className="transaction-filters"><label>Month<input type="month" value={month} onChange={event => setMonth(event.target.value)} /></label><label>Account<select value={account} onChange={event => setAccount(event.target.value)}><option value="">All accounts</option>{accounts.map(item => <option key={item}>{item}</option>)}</select></label><label>Type<select value={type} onChange={event => setType(event.target.value as "all" | Transaction["type"])}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select></label><label>Category<select value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label><button type="button" className="filter-reset" onClick={reset}>Reset</button></div>}<div className="transaction-list">{visibleTransactions.length ? rows : <div className="empty-state">{transactions.length ? "No transactions match these filters." : "No transactions yet. Add your first one."}</div>}</div></section>;
}
