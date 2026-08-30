import { Tab } from "./types";

export function Sidebar({ activeTab, onTabChange, onReset }: { activeTab: Tab; onTabChange: (tab: Tab) => void; onReset: () => void }) {
  const tabs: Tab[] = ["Overview", "Transactions", "Accounts", "Budgets", "Loans", "Goals"];
  return <aside className="sidebar"><div className="brand"><span className="brand-mark">✦</span><span>Money<span className="brand-accent">Flow</span></span></div><div className="profile"><div className="avatar">AS</div><div><strong>Samuel</strong><small>Personal workspace</small></div><span className="chevron">⌄</span></div><nav className="nav">{tabs.map((item, index) => <button className={activeTab === item ? "nav-item active" : "nav-item"} onClick={() => onTabChange(item)} key={item}><span className="nav-icon">{["⌂", "↕", "▣", "◒", "▤", "◎"][index]}</span>{item}</button>)}</nav><div className="sidebar-bottom"><button className="nav-item" onClick={onReset}><span className="nav-icon">↺</span>Reset demo</button><div className="secure-note"><span>◉</span><div><strong>Demo mode</strong><small>Saved in this browser only</small></div></div></div></aside>;
}

