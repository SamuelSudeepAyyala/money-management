import { currency } from "./format";
import { Account } from "./types";

export function Accounts({ accounts, onSubmit }: { accounts: Account[]; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="feature-grid"><section className="panel"><div className="panel-heading"><div><h2>Your accounts</h2><p>Balances across your money</p></div></div>{accounts.map(account => <div className="account-row" key={account.id}><div className="account-icon">▣</div><div><strong>{account.name}</strong><small>{account.type} · {account.currency}</small></div><b>{currency(account.balance)}</b></div>)}</section><form className="panel inline-form" onSubmit={onSubmit}><h2>Add an account</h2><p>Create a checking, savings, cash, or credit account.</p><label>Name<input name="name" placeholder="e.g. Credit card" required /></label><label>Type<select name="type" defaultValue="Checking"><option>Checking</option><option>Savings</option><option>Cash</option><option>Credit card</option><option>Investment</option></select></label><label>Starting balance<input name="balance" type="number" step="0.01" defaultValue="0" /></label><button className="primary-button full" type="submit">Save account</button></form></div>;
}

