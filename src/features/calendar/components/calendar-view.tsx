"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { PHILIPPINE_HOLIDAYS } from "../lib/ph-holidays";

type Entry = { id: string; workDate: string; timeInMinutes: number; timeOutMinutes: number; lunchMinutesApplied: number };
const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date: Date) { return format(date, "yyyy-MM-dd"); }
function minutes(value: number) { return `${Math.floor(value / 60)}h ${value % 60}m`; }

export function CalendarView({ initialEntries }: { initialEntries: Entry[] }) {
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const entries = useMemo(() => new Map(initialEntries.map((entry) => [entry.workDate, entry])), [initialEntries]);
  const holidays = useMemo(() => new Map(PHILIPPINE_HOLIDAYS.map((holiday) => [holiday.date, holiday])), []);
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) });
  const selectedEntry = selected ? entries.get(selected) : undefined;
  const selectedHoliday = selected ? holidays.get(selected) : undefined;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold tracking-tight">Calendar</h1><p className="text-sm text-muted-foreground">Work shifts and Philippine holidays in Asia/Manila.</p></div><Button variant="outline" onClick={() => setMonth(new Date())}>Today</Button></div>
    <Card><CardHeader className="flex-row items-center justify-between"><Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setMonth((value) => addMonths(value, -1))}><ChevronLeft /></Button><CardTitle>{format(month, "MMMM yyyy")}</CardTitle><Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setMonth((value) => addMonths(value, 1))}><ChevronRight /></Button></CardHeader><CardContent><div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">{weekdayLabels.map((day, index) => <div className={index > 4 ? "rounded bg-muted py-2" : "py-2"} key={day}>{day}</div>)}</div><div className="grid grid-cols-7 gap-1">{days.map((day) => { const key = dateKey(day); const entry = entries.get(key); const holiday = holidays.get(key); const weekend = day.getDay() === 0 || day.getDay() === 6; const states = [entry ? "var(--success)" : null, holiday ? "var(--destructive)" : null].filter(Boolean) as string[]; const fill = states.length === 2 ? `linear-gradient(135deg, ${states[0]} 0 50%, var(--card) 50.5% 51%, ${states[1]} 51.5% 100%)` : states[0] ?? (weekend ? "var(--muted)" : "var(--card)"); const worked = entry ? Math.max(0, entry.timeOutMinutes - entry.timeInMinutes - entry.lunchMinutesApplied) : 0; const label = `${format(day, "MMMM d, EEEE")}${entry ? `, shift logged, ${minutes(worked)}` : ", no shift logged"}${holiday ? `, holiday: ${holiday.name}` : ""}${weekend ? ", weekend" : ""}`; return <button type="button" key={key} aria-label={label} onClick={() => setSelected(key)} style={{ background: fill }} className={`relative min-h-16 rounded-lg border border-border/50 p-2 text-left text-sm font-semibold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSameMonth(day, month) ? "" : "opacity-40"} ${dateKey(new Date()) === key ? "ring-2 ring-ring ring-offset-1 ring-offset-background" : ""}`}><span className="rounded bg-card/80 px-1 text-foreground">{format(day, "d")}</span>{holiday && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" aria-label="Holiday" />}{entry && <span className="absolute bottom-1 right-2 text-[10px] text-foreground">{minutes(worked)}</span>}</button>; })}</div></CardContent></Card>
    <div className="flex flex-wrap gap-4 text-xs"><span><i className="mr-1 inline-block h-3 w-3 rounded bg-success align-middle" />Shift logged</span><span><i className="mr-1 inline-block h-3 w-3 rounded bg-destructive align-middle" />Holiday</span><span><i className="mr-1 inline-block h-3 w-3 rounded bg-muted align-middle" />Weekend</span><span><i className="mr-1 inline-block h-3 w-5 align-middle" style={{ background: "linear-gradient(135deg, var(--success) 0 50%, var(--destructive) 50% 100%)" }} />Shift + holiday</span></div>
    {selected && <Card><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold">{format(new Date(`${selected}T12:00:00`), "MMMM d, yyyy")}</p>{selectedHoliday && <p className="text-sm text-muted-foreground">Holiday: {selectedHoliday.name} ({selectedHoliday.type})</p>}{selectedEntry && <p className="text-sm text-muted-foreground">Shift: {minutes(selectedEntry.timeInMinutes)}–{minutes(selectedEntry.timeOutMinutes)} · {minutes(Math.max(0, selectedEntry.timeOutMinutes - selectedEntry.timeInMinutes - selectedEntry.lunchMinutesApplied))}</p>}{!selectedEntry && <p className="text-sm text-muted-foreground">No shift logged.</p>}</div>{!selectedEntry && <Link className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/dtr?date=${selected}`}>Log Shift</Link>}</CardContent></Card>}
  </div>;
}
