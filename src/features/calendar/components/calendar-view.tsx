"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, FileText, Calendar } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, useNotify } from "@/components/ui";
import { PHILIPPINE_HOLIDAYS } from "../lib/ph-holidays";
import {
  DailyActivityReportModal,
  type ActivityReportData,
} from "./daily-activity-report-modal";

export interface CalendarEntry {
  id: string;
  workDate: string; // YYYY-MM-DD
  timeInMinutes: number;
  timeOutMinutes: number | null;
  lunchMinutesApplied: number;
  breaks?: Array<{ category: string; durationMinutes: number }>;
  note?: string | null;
  activity?: string | null;
  activityDescription?: string | null;
  remarks?: string | null;
}

// Week starts on Sunday (Sun -> Sat) per Task 8
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function minutesToDuration(value: number) {
  return `${Math.floor(value / 60)}h ${String(value % 60).padStart(2, "0")}m`;
}

interface CalendarViewProps {
  initialEntries: CalendarEntry[];
  saveActivityReportAction?: (data: {
    id: string;
    activity?: string | null;
    activityDescription?: string | null;
    remarks?: string | null;
  }) => Promise<{ ok: boolean; error?: string }>;
}

export function CalendarView({
  initialEntries,
  saveActivityReportAction,
}: CalendarViewProps) {
  const notify = useNotify();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [activeReportEntry, setActiveReportEntry] = useState<ActivityReportData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Local map of entries for optimistic updates
  const [entriesMap, setEntriesMap] = useState<Map<string, CalendarEntry>>(
    () => new Map(initialEntries.map((entry) => [entry.workDate, entry]))
  );

  const holidays = useMemo(
    () => new Map(PHILIPPINE_HOLIDAYS.map((holiday) => [holiday.date, holiday])),
    []
  );

  // Date grid calculation: weekStartsOn: 0 (Sunday)
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
    });
  }, [month]);

  const selectedEntry = selected ? entriesMap.get(selected) : undefined;
  const selectedHoliday = selected ? holidays.get(selected) : undefined;

  function calculateWorkedMinutes(entry: CalendarEntry): number {
    if (entry.timeOutMinutes === null) return 0;
    const raw = entry.timeOutMinutes - entry.timeInMinutes;
    if (raw <= 0) return 0;
    let deduction = 0;
    if (entry.breaks && entry.breaks.length > 0) {
      deduction = entry.breaks.reduce((sum, b) => sum + b.durationMinutes, 0);
    } else {
      deduction = entry.lunchMinutesApplied;
    }
    return Math.max(0, raw - deduction);
  }

  function handleDayClick(dayDateStr: string, entry?: CalendarEntry) {
    setSelected(dayDateStr);
    if (entry) {
      // Task 7: clicking a shift-logged day opens the Daily Activity Report modal
      setActiveReportEntry({
        id: entry.id,
        workDate: entry.workDate,
        timeInMinutes: entry.timeInMinutes,
        timeOutMinutes: entry.timeOutMinutes,
        activity: entry.activity,
        activityDescription: entry.activityDescription,
        remarks: entry.remarks,
      });
      setIsReportModalOpen(true);
    }
  }

  async function handleSaveReport(data: {
    id: string;
    activity?: string | null;
    activityDescription?: string | null;
    remarks?: string | null;
  }) {
    if (!saveActivityReportAction) {
      return { ok: false, error: "Save action not available." };
    }
    return saveActivityReportAction(data);
  }

  function handleReportSuccess(updated: {
    activity: string;
    activityDescription: string;
    remarks: string;
  }) {
    if (!activeReportEntry) return;

    setEntriesMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(activeReportEntry.workDate);
      if (existing) {
        next.set(activeReportEntry.workDate, {
          ...existing,
          activity: updated.activity,
          activityDescription: updated.activityDescription,
          remarks: updated.remarks,
        });
      }
      return next;
    });

    notify.success("Daily Activity Report saved successfully.");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Activity Report Modal */}
      <DailyActivityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        entry={activeReportEntry}
        onSave={handleSaveReport}
        onSuccess={handleReportSuccess}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Work shifts and Philippine holidays in Asia/Manila. Click any shift to view or edit Daily Activity Reports.
          </p>
        </div>
        <Button variant="outline" onClick={() => setMonth(new Date())}>
          Today
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={() => setMonth((value) => addMonths(value, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg font-bold">
            {format(month, "MMMM yyyy")}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next month"
            onClick={() => setMonth((value) => addMonths(value, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Weekday Header: Sun to Sat */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
            {weekdayLabels.map((day, index) => (
              <div
                key={day}
                className={
                  index === 0 || index === 6
                    ? "rounded bg-muted/60 py-2 font-bold text-foreground"
                    : "py-2"
                }
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = dateKey(day);
              const entry = entriesMap.get(key);
              const holiday = holidays.get(key);
              const weekend = day.getDay() === 0 || day.getDay() === 6;

              const states = [
                entry ? "var(--success)" : null,
                holiday ? "var(--destructive)" : null,
              ].filter(Boolean) as string[];

              const fill =
                states.length === 2
                  ? `linear-gradient(135deg, ${states[0]} 0 50%, var(--card) 50.5% 51%, ${states[1]} 51.5% 100%)`
                  : states[0] ?? (weekend ? "var(--muted)" : "var(--card)");

              const worked = entry ? calculateWorkedMinutes(entry) : 0;
              const hasActivity = Boolean(
                entry?.activity || entry?.activityDescription || entry?.remarks
              );

              const label = `${format(day, "MMMM d, EEEE")}${
                entry
                  ? entry.timeOutMinutes !== null
                    ? `, shift logged, ${minutesToDuration(worked)}`
                    : `, shift in progress`
                  : ", no shift logged"
              }${holiday ? `, holiday: ${holiday.name}` : ""}${weekend ? ", weekend" : ""}`;

              return (
                <button
                  type="button"
                  key={key}
                  aria-label={label}
                  onClick={() => handleDayClick(key, entry)}
                  style={{ background: fill }}
                  className={`relative min-h-16 rounded-xl border border-border/50 p-2 text-left text-sm font-semibold text-foreground shadow-sm transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${
                    isSameMonth(day, month) ? "" : "opacity-35"
                  } ${
                    dateKey(new Date()) === key
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-card/85 px-1.5 py-0.5 text-xs font-mono font-bold text-foreground shadow-xs">
                      {format(day, "d")}
                    </span>
                    <div className="flex items-center gap-1">
                      {hasActivity && (
                        <span
                          className="h-3.5 w-3.5 rounded bg-primary/20 text-primary flex items-center justify-center p-0.5"
                          title="Daily Activity Report logged"
                        >
                          <FileText className="h-2.5 w-2.5" />
                        </span>
                      )}
                      {holiday && (
                        <span
                          className="h-2 w-2 rounded-full bg-destructive"
                          aria-label="Holiday"
                          title={`Holiday: ${holiday.name}`}
                        />
                      )}
                    </div>
                  </div>

                  {entry && (
                    <span className="absolute bottom-1.5 right-2 text-[10px] font-mono font-bold bg-card/85 px-1 py-0.5 rounded text-foreground shadow-xs">
                      {entry.timeOutMinutes !== null
                        ? minutesToDuration(worked)
                        : "In Progress"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground items-center">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded bg-success align-middle" />
          Shift logged
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded bg-destructive align-middle" />
          Holiday
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded bg-muted align-middle" />
          Weekend
        </span>
        <span className="flex items-center gap-1.5">
          <i
            className="inline-block h-3 w-5 rounded align-middle"
            style={{
              background:
                "linear-gradient(135deg, var(--success) 0 50%, var(--destructive) 50% 100%)",
            }}
          />
          Shift + holiday
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="h-3 w-3 text-primary" />
          Activity report filed
        </span>
      </div>

      {/* Selected Day Details Card (Shown when a day is selected) */}
      {selected && (
        <Card className="animate-in fade-in duration-200">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="space-y-1">
              <p className="font-bold text-base flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                {format(new Date(`${selected}T12:00:00`), "MMMM d, yyyy (EEEE)")}
              </p>
              {selectedHoliday && (
                <p className="text-sm font-medium text-destructive">
                  Holiday: {selectedHoliday.name} ({selectedHoliday.type})
                </p>
              )}
              {selectedEntry ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Shift:{" "}
                    {selectedEntry.timeOutMinutes !== null
                      ? `${minutesToDuration(selectedEntry.timeInMinutes)} – ${minutesToDuration(selectedEntry.timeOutMinutes)} · ${minutesToDuration(calculateWorkedMinutes(selectedEntry))} worked`
                      : `${minutesToDuration(selectedEntry.timeInMinutes)} (In Progress)`}
                  </p>
                  {selectedEntry.activity && (
                    <p className="text-xs text-foreground font-semibold flex items-center gap-1">
                      <FileText className="h-3 w-3 text-primary" />
                      Activity: {selectedEntry.activity}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No shift logged for this day.</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedEntry ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveReportEntry({
                      id: selectedEntry.id,
                      workDate: selectedEntry.workDate,
                      timeInMinutes: selectedEntry.timeInMinutes,
                      timeOutMinutes: selectedEntry.timeOutMinutes,
                      activity: selectedEntry.activity,
                      activityDescription: selectedEntry.activityDescription,
                      remarks: selectedEntry.remarks,
                    });
                    setIsReportModalOpen(true);
                  }}
                  className="gap-1.5"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <span>
                    {selectedEntry.activity ? "Edit Activity Report" : "Add Activity Report"}
                  </span>
                </Button>
              ) : (
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={`/dtr?date=${selected}`}
                >
                  Log Shift
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
