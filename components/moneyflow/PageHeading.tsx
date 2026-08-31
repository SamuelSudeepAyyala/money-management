import { useEffect, useState } from "react";
import { Tab } from "./types";
import { getWelcomeMessage } from "./welcomeMessages";

export function PageHeading({ activeTab, displayName, onAddTransaction }: { activeTab: Tab; displayName: string; onAddTransaction: () => void }) {
  const [message, setMessage] = useState(`Welcome, ${displayName}`);
  useEffect(() => { setMessage(getWelcomeMessage(new Date(), displayName)); }, [displayName]);
  return <div className="page-heading"><div><p className="eyebrow">PERSONAL FINANCE · PRIVATE WORKSPACE</p><h1>{activeTab === "Overview" ? message : activeTab}<span> ✦</span></h1><p className="subheading">{activeTab === "Overview" ? "Here's how your money is doing this month." : `Manage your ${activeTab.toLowerCase()} in one place.`}</p></div><button type="button" className="primary-button" onClick={onAddTransaction}><span>＋</span> Add transaction</button></div>;
}
