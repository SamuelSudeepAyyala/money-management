import { useState } from "react";
import { usePersistentState } from "../../hooks/usePersistentState";
import { currency } from "./format";
import { Tab } from "./types";

export function Feature({ tab }: { tab: Tab }) {
  const config: Record<string, { title: string; text: string; fields: string[]; seed: string[] }> = { Budgets: { title: "Monthly budgets", text: "Set limits and understand category spending.", fields: ["Category", "Monthly limit"], seed: ["Food & groceries · $205 of $400"] }, Loans: { title: "Loan center", text: "Track principal, interest, due dates, and payoff progress.", fields: ["Loan name", "Remaining balance"], seed: ["Education loan · $223.67 due Sep 11"] }, Goals: { title: "Financial goals", text: "Turn your plans into visible progress.", fields: ["Goal name", "Target amount"], seed: ["Emergency fund · 52% complete"] } };
  const selected = config[tab]; const storageKey = `moneyflow-demo-${tab.toLowerCase()}`;
  const [records, setRecords] = usePersistentState<string[]>(storageKey, selected ? selected.seed : []); const [showForm, setShowForm] = useState(false);
  if (!selected) return null;
  const addRecord = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); setRecords(current => [...current, `${String(data.get("first"))} · ${currency(Number(data.get("second")))}`]); setShowForm(false); event.currentTarget.reset(); };
  return <div className="feature-grid"><section className="panel empty-feature"><div className="feature-symbol">{tab === "Loans" ? "▤" : tab === "Goals" ? "◎" : "◒"}</div><h2>{selected.title}</h2><p>{selected.text}</p><div className="record-list">{records.map((record, index) => <div className="feature-placeholder" key={`${record}-${index}`}>{record}</div>)}</div>{showForm ? <form className="inline-form feature-form" onSubmit={addRecord}><label>{selected.fields[0]}<input name="first" autoComplete="off" required /></label><label>{selected.fields[1]}<input name="second" type="number" min="0" step="0.01" required /></label><button className="primary-button full" type="submit">Save record</button></form> : <button type="button" className="primary-button" onClick={() => setShowForm(true)}>＋ Add {tab.slice(0, -1).toLowerCase()}</button>}</section><section className="panel checklist"><h2>What you can manage here</h2>{["Add and edit records", "See progress over time", "Keep everything in one view"].map(item => <div key={item}>✓ <span>{item}</span></div>)}</section></div>;
}
