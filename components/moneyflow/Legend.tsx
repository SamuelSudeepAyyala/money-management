export function Legend({ color, label, amount, percent }: { color: string; label: string; amount: string; percent: string }) {
  return <div className="legend-item"><span className="legend-dot" style={{ background: color }} /><span>{label}</span><strong>{amount}</strong><small>{percent}</small></div>;
}

