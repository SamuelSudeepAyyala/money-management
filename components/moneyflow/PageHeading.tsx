import { useEffect, useState } from "react";
import { Tab } from "./types";

function timeMessage(hour: number, name: string) {
  if (hour >= 5 && hour < 12) return `Morning, ${name} — give every dollar a direction.`;
  if (hour >= 12 && hour < 17) return `Afternoon, ${name} — a two-minute money check beats a month-end surprise.`;
  if (hour >= 17 && hour < 21) return `Evening, ${name} — see what your money accomplished today.`;
  return `Still up, ${name}? Let’s make tomorrow’s money feel lighter.`;
}

export function PageHeading({ activeTab, displayName, onAddTransaction }: { activeTab: Tab; displayName: string; onAddTransaction: () => void }) {
  const [message, setMessage] = useState(`Welcome, ${displayName}`);
  useEffect(() => { setMessage(timeMessage(new Date().getHours(), displayName)); }, [displayName]);
  return <div className="page-heading"><div><p className="eyebrow">PERSONAL FINANCE · PRIVATE WORKSPACE</p><h1>{activeTab === "Overview" ? message : activeTab}<span> ✦</span></h1><p className="subheading">{activeTab === "Overview" ? "Here's how your money is doing this month." : `Manage your ${activeTab.toLowerCase()} in one place.`}</p></div><button type="button" className="primary-button" onClick={onAddTransaction}><span>＋</span> Add transaction</button></div>;
}
