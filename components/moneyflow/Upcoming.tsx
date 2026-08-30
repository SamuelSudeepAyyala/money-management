export function Upcoming({ icon, title, meta, amount, color }: { icon: string; title: string; meta: string; amount: string; color: string }) {
  return <div className="upcoming"><span className={`upcoming-icon ${color}`}>{icon}</span><div><strong>{title}</strong><small>{meta}</small></div><b>{amount}</b></div>;
}

