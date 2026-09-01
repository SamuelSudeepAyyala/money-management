import { useEffect, useMemo, useRef, useState } from "react";
import { localDateString } from "../../services/localDate";

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLabel(value: string) {
  return value ? parseDate(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Choose a date";
}

export function CalendarInput({ name, defaultValue = "", required = false }: { name: string; defaultValue?: string; required?: boolean }) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => { const date = defaultValue ? parseDate(defaultValue) : new Date(); return new Date(date.getFullYear(), date.getMonth(), 1); });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  const days = useMemo(() => { const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay(); const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(); return [...Array(first).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)]; }, [month]);
  const choose = (day: number) => { const selected = new Date(month.getFullYear(), month.getMonth(), day); setValue(localDateString(selected)); setOpen(false); };
  return <div className="calendar-field" ref={ref}><input type="hidden" name={name} value={value} /><button type="button" className={`calendar-trigger${value ? " selected" : ""}`} onClick={() => setOpen(current => !current)} aria-haspopup="dialog" aria-expanded={open} aria-required={required}><span className="calendar-glyph">▣</span><span>{formatLabel(value)}</span><span className="calendar-caret">⌄</span></button>{open && <div className="calendar-popover" role="dialog" aria-label="Choose date"><div className="calendar-header"><button type="button" className="calendar-nav" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">‹</button><strong>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</strong><button type="button" className="calendar-nav" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month">›</button></div><div className="calendar-weekdays">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-days">{days.map((day, index) => day ? <button type="button" className={value === localDateString(new Date(month.getFullYear(), month.getMonth(), day)) ? "calendar-day active" : "calendar-day"} key={day} onClick={() => choose(day)}>{day}</button> : <span key={`blank-${index}`} />)}</div><div className="calendar-footer"><button type="button" onClick={() => { setValue(""); setOpen(false); }}>Clear</button><button type="button" onClick={() => { const today = new Date(); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setValue(localDateString(today)); setOpen(false); }}>Today</button></div></div>}</div>;
}
