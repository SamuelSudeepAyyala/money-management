import { useState } from "react";
import { ApiUser } from "../../services/api";

export function Topbar({ user, onLogout, onNotice }: { user: ApiUser; onLogout: () => void; onNotice: (message: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="topbar"><div className="mobile-brand"><span className="brand-mark">✦</span>Money<span className="brand-accent">Flow</span></div><div className="top-actions"><button type="button" className="icon-button" aria-label="Search" onClick={() => onNotice("Search will be available in the next milestone.")}>⌕</button><button type="button" className="icon-button notification" aria-label="Notifications" onClick={() => onNotice("You have no new notifications.")}>♢<i /></button><div className="profile-menu"><button type="button" className="avatar small avatar-button" aria-label="Open profile menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{user.display_name.slice(0, 2).toUpperCase()}</button>{menuOpen && <div className="profile-dropdown"><strong>{user.display_name}</strong><small>{user.email}</small><button type="button" className="logout-button" onClick={onLogout}>Log out</button></div>}</div></div></header>;
}
