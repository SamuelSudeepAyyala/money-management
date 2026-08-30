import { Tab } from "./types";

export function PageHeading({ activeTab, onAddTransaction }: { activeTab: Tab; onAddTransaction: () => void }) {
  return <div className="page-heading"><div><p className="eyebrow">PERSONAL FINANCE · DEMO MODE</p><h1>{activeTab === "Overview" ? "Good evening, Samuel" : activeTab}<span> ✦</span></h1><p className="subheading">{activeTab === "Overview" ? "Here's how your money is doing this month." : `Manage your ${activeTab.toLowerCase()} in one place.`}</p></div><button className="primary-button" onClick={onAddTransaction}><span>＋</span> Add transaction</button></div>;
}

