import { FormEvent, useEffect, useState } from "react";
import { ApiRecurringBill } from "../../services/api";
import { localDateString } from "../../services/localDate";
import { CalendarInput } from "./CalendarInput";
import { Account } from "./types";

export function DueBillPrompt({ bill, accounts, onPay, onDismiss }: { bill: ApiRecurringBill; accounts: Account[]; onPay: (id: string, accountId: number, occurredOn: string) => void | Promise<void>; onDismiss: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaving(true); const data = new FormData(event.currentTarget); try { await onPay(String(bill.id), Number(data.get("account_id")), String(data.get("occurred_on"))); onDismiss(); } finally { setSaving(false); } };
  return <div className="modal-backdrop" onClick={onDismiss}><section className="modal due-bill-modal" onClick={event => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">SCHEDULED PAYMENT</p><h2>Did this payment happen?</h2></div><button type="button" className="close-button" onClick={onDismiss}>×</button></div><p className="due-bill-copy"><strong>{bill.name}</strong> was scheduled for {bill.next_due} for <strong>${Number(bill.amount).toFixed(2)}</strong>.</p>{confirming ? <form className="inline-form" onSubmit={event => { void submit(event); }}><label>Which account paid it?<select name="account_id" defaultValue={accounts[0]?.id} required>{accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label><label>Payment date<CalendarInput name="occurred_on" defaultValue={bill.next_due <= localDateString() ? bill.next_due : localDateString()} required /></label><button className="primary-button full" type="submit" disabled={saving}>{saving ? "Saving…" : "Confirm payment"}</button></form> : <div className="due-bill-actions"><button type="button" className="primary-button" onClick={() => setConfirming(true)} disabled={!accounts.length}>Yes, it happened</button><button type="button" className="secondary-button" onClick={onDismiss}>Not yet</button></div>}{!accounts.length && <p className="auth-note">Add an account before recording this payment.</p>}</section></div>;
}
