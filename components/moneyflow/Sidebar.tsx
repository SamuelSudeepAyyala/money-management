import { Tab } from "./types";
import { ApiUser } from "../../services/api";

export function Sidebar({ activeTab, onTabChange, user, onProfileClick }: { activeTab: Tab; onTabChange: (tab: Tab) => void; user: ApiUser; onProfileClick: () => void }) {
  const tabs: Tab[] = ["Overview", "Transactions", "Accounts", "Budgets", "Loans", "Goals"];
  return <aside className="sidebar"><div className="brand"><span className="brand-mark">✦</span><span>Money<span className="brand-accent">Flow</span></span></div><button type="button" className="profile profile-button" onClick={onProfileClick} aria-label="Open profile menu"><div className="avatar">{user.display_name.slice(0, 2).toUpperCase()}</div><div><strong>{user.display_name}</strong><small>Private workspace</small></div><span className="chevron">⌄</span></button><nav className="nav">{tabs.map((item, index) => <button type="button" className={activeTab === item ? "nav-item active" : "nav-item"} onClick={() => onTabChange(item)} key={item}><span className="nav-icon">{["⌂", "↕", "▣", "◒", "▤", "◎"][index]}</span>{item}</button>)}</nav><div className="sidebar-bottom"><div className="secure-note"><span>◉</span><div><strong>Private & synced</strong><small>Your data is stored securely</small></div></div></div></aside>;
}
