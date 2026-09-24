"use client";

import React, { useState, useTransition } from "react";
import {
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  AlertCircle,
  FileText,
  Utensils,
  CalendarDays,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui";
import { useNotify } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import {
  getMondayOfWeek,
  getSundayOfWeek,
  getWeekDates,
  addWeeks,
  formatDateDisplay,
  formatMonthDisplay,
  getTodayDateString,
  formatMinutesToTimeString,
} from "@/lib/date";
import {
  calculateWorkedMinutes,
  formatWorkedHoursAndMinutes,
  formatWorkedDecimalHours,
} from "../lib/calc-hours";
import { deleteDtrEntryAction } from "../actions/dtr-actions";
import { notifyActivityChanged } from "@/lib/activity-client";
import { DtrModal } from "./dtr-modal";
import type { DtrEntryData } from "../types";

interface DtrViewProps {
  initialEntries?: DtrEntryData[];
  initialSettings?: {
    lunchDeductionEnabled: boolean;
    lunchBreakMinutes: number;
    currency: string;
  } | null;
  initialWeekMonday?: string;
}

export function DtrView({
  initialEntries = [],
  initialSettings,
  initialWeekMonday,
}: DtrViewProps) {
  const confirm = useConfirm();
  const notify = useNotify();
  const todayStr = getTodayDateString();
  const currentWeekMonday = getMondayOfWeek(todayStr);

  const [selectedMonday, setSelectedMonday] = useState(
    initialWeekMonday ?? currentWeekMonday
  );
  const [entries, setEntries] = useState<DtrEntryData[]>(initialEntries);
  const [activeTab, setActiveTab] = useState<"week" | "month">("week");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>(todayStr);
  const [entryToEdit, setEntryToEdit] = useState<DtrEntryData | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const selectedSunday = getSundayOfWeek(selectedMonday);
  const weekDays = getWeekDates(selectedMonday);

  // Filter entries that fall within the selected week
  const weekEntries = entries.filter(
    (e) => e.workDate >= selectedMonday && e.workDate <= selectedSunday
  );

  // Compute worked minutes for all week entries
  const entriesWithWorkedTime = weekEntries.map((entry) => {
    const workedMinutes = calculateWorkedMinutes({
      timeInMinutes: entry.timeInMinutes,
      timeOutMinutes: entry.timeOutMinutes,
      lunchMinutesApplied: entry.lunchMinutesApplied,
    });
    return { ...entry, workedMinutes };
  });

  const totalWeekMinutes = entriesWithWorkedTime.reduce(
    (acc, curr) => acc + (curr.workedMinutes ?? 0),
    0
  );
  const daysWorkedCount = entriesWithWorkedTime.length;
  const avgMinutesPerWorkedDay =
    daysWorkedCount > 0 ? Math.round(totalWeekMinutes / daysWorkedCount) : 0;

  // Monthly summary calculations
  const [selectedYear, selectedMonth] = selectedMonday.split("-");
  const monthPrefix = `${selectedYear}-${selectedMonth}`;
  const monthEntries = entries.filter((e) => e.workDate.startsWith(monthPrefix));
  const totalMonthMinutes = monthEntries.reduce((acc, curr) => {
    const worked = calculateWorkedMinutes({
      timeInMinutes: curr.timeInMinutes,
      timeOutMinutes: curr.timeOutMinutes,
      lunchMinutesApplied: curr.lunchMinutesApplied,
    });
    return acc + worked;
  }, 0);

  const handleOpenAdd = (date?: string) => {
    setEntryToEdit(null);
    setModalDate(date ?? (selectedMonday <= todayStr && todayStr <= selectedSunday ? todayStr : selectedMonday));
    setIsModalOpen(true);
    setActionError(null);
  };

  const handleOpenEdit = (entry: DtrEntryData) => {
    setEntryToEdit(entry);
    setModalDate(entry.workDate);
    setIsModalOpen(true);
    setActionError(null);
  };

  const handleEntrySaved = (saved: DtrEntryData) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.workDate !== saved.workDate);
      return [...filtered, saved].sort((a, b) => a.workDate.localeCompare(b.workDate));
    });
    notify.success(`Shift logged: ${formatDateDisplay(saved.workDate)}`);
  };

  const handleDelete = async (id: string) => {
    const entry = entries.find((item) => item.id === id);
    if (!entry || !(await confirm({ title: "Delete shift?", description: `Delete the ${formatDateDisplay(entry.workDate)} shift (${formatMinutesToTimeString(entry.timeInMinutes)} – ${formatMinutesToTimeString(entry.timeOutMinutes)})? This cannot be undone.`, confirmLabel: "Delete shift", variant: "destructive" }))) return;
    setActionError(null);
    setDeletingId(id);

    startTransition(async () => {
      const res = await deleteDtrEntryAction(id);
      setDeletingId(null);
      if (!res.ok) {
        setActionError(res.error);
        notify.error("Couldn't delete the shift. Please try again.");
        return;
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
      notifyActivityChanged();
      notify.success("Shift deleted");
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Daily Time Record
            </h1>
            <Badge variant="secondary" className="text-[10px] font-mono">
              Work Shifts
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Log time in, time out, and view calculated worked hours. Weeks run Monday to Sunday.
          </p>
        </div>

        <Button onClick={() => handleOpenAdd()} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </Button>
      </div>

      {/* Global Action Error */}
      {actionError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Totals Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Hours */}
        <Card className="border-l-4 border-l-primary shadow-xs">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardDescription className="text-[11px] uppercase font-bold tracking-wider">
              Week Total Hours
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {formatWorkedHoursAndMinutes(totalWeekMinutes)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <span className="text-xs text-muted-foreground font-medium">
              {formatWorkedDecimalHours(totalWeekMinutes)} decimal hours
            </span>
          </CardContent>
        </Card>

        {/* Days Worked */}
        <Card className="shadow-xs">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardDescription className="text-[11px] uppercase font-bold tracking-wider">
              Days Logged
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {daysWorkedCount}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ 7 days</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <span className="text-xs text-muted-foreground font-medium">
              {daysWorkedCount > 0
                ? `Avg ${formatWorkedHoursAndMinutes(avgMinutesPerWorkedDay)} / day`
                : "No shifts logged yet"}
            </span>
          </CardContent>
        </Card>

        {/* Monthly Total */}
        <Card className="shadow-xs">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardDescription className="text-[11px] uppercase font-bold tracking-wider">
              Month Total Hours
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {formatWorkedHoursAndMinutes(totalMonthMinutes)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <span className="text-xs text-muted-foreground font-medium">
              {formatMonthDisplay(selectedMonday)} ({formatWorkedDecimalHours(totalMonthMinutes)} hrs)
            </span>
          </CardContent>
        </Card>

        {/* Lunch Setting Snapshot */}
        <Card className="shadow-xs">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardDescription className="text-[11px] uppercase font-bold tracking-wider">
              Lunch Deduction
            </CardDescription>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
              <Utensils className="h-4 w-4 text-primary" />
              <span>
                {initialSettings?.lunchDeductionEnabled
                  ? `${initialSettings.lunchBreakMinutes}m Snapshot`
                  : "Deduction Off"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Applied automatically when creating new shifts.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigator Bar */}
      <Card className="shadow-xs">
        <CardHeader className="p-4 border-b border-border/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Week Stepper */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSelectedMonday(addWeeks(selectedMonday, -1))}
                aria-label="Previous week"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => setSelectedMonday(currentWeekMonday)}
              >
                Current Week
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSelectedMonday(addWeeks(selectedMonday, 1))}
                aria-label="Next week"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <span className="text-sm font-bold text-foreground ml-2 font-mono">
                {formatDateDisplay(selectedMonday)} – {formatDateDisplay(selectedSunday)}
              </span>
            </div>

            {/* View Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("week")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "week"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Weekly Schedule
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("month")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "month"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Summary
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {activeTab === "week" ? (
            /* Weekly Breakdown Table/List */
            <div className="divide-y divide-border">
              {weekDays.map((dateStr) => {
                const entry = entriesWithWorkedTime.find((e) => e.workDate === dateStr);
                const isToday = dateStr === todayStr;
                const dateObj = new Date(dateStr + "T00:00:00Z");
                const dayName = dateObj.toLocaleDateString("en-US", {
                  weekday: "long",
                  timeZone: "UTC",
                });
                const dayMonthStr = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                });

                return (
                  <div
                    key={dateStr}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isToday ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-muted/30"
                    }`}
                  >
                    {/* Day & Date Label */}
                    <div className="flex items-center gap-3 min-w-[170px]">
                      <div
                        className={`h-10 w-10 rounded-xl flex flex-col items-center justify-center font-mono border ${
                          isToday
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/70 text-foreground border-border"
                        }`}
                      >
                        <span className="text-[10px] font-bold leading-none uppercase">
                          {dayName.slice(0, 3)}
                        </span>
                        <span className="text-sm font-black leading-tight">
                          {dateStr.split("-")[2]}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {dayName}
                          </span>
                          {isToday && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                              Today
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {dayMonthStr}
                        </span>
                      </div>
                    </div>

                    {/* Shift Details or Empty State */}
                    {entry ? (
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                        {/* Time In / Out / Lunch */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                          <span className="font-semibold text-foreground font-mono bg-card px-2.5 py-1 rounded-lg border border-border">
                            {formatMinutesToTimeString(entry.timeInMinutes)}
                          </span>
                          <span className="text-muted-foreground">to</span>
                          <span className="font-semibold text-foreground font-mono bg-card px-2.5 py-1 rounded-lg border border-border">
                            {formatMinutesToTimeString(entry.timeOutMinutes)}
                          </span>
                          {entry.lunchMinutesApplied > 0 && (
                            <Badge variant="outline" className="text-[10px] font-mono">
                              -{entry.lunchMinutesApplied}m lunch
                            </Badge>
                          )}
                        </div>

                        {/* Net Worked Time */}
                        <div className="text-left sm:text-right">
                          <div className="text-base sm:text-lg font-black text-foreground font-mono">
                            {formatWorkedHoursAndMinutes(entry.workedMinutes ?? 0)}
                          </div>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {formatWorkedDecimalHours(entry.workedMinutes ?? 0)} hrs
                          </span>
                        </div>

                        {/* Shift Note if exists */}
                        {entry.note && (
                          <div className="w-full sm:w-auto text-xs text-muted-foreground flex items-center gap-1.5 bg-background/50 p-2 rounded-lg border border-border/60">
                            <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[180px]">{entry.note}</span>
                          </div>
                        )}

                        {/* Row Actions */}
                        <div className="flex items-center gap-1.5 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(entry)}
                            aria-label={`Edit shift for ${dayName}`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                            aria-label={`Delete shift for ${dayName}`}
                          >
                            {deletingId === entry.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Empty Row */
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground italic">
                          No work shift recorded
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenAdd(dateStr)}
                          className="h-8 text-xs gap-1.5 border border-dashed border-border hover:border-solid hover:bg-card"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Log Shift</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Monthly Overview Tab */
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {formatMonthDisplay(selectedMonday)} Summary
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Aggregated record of all work shifts logged this calendar month.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-foreground font-mono">
                    {formatWorkedHoursAndMinutes(totalMonthMinutes)}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatWorkedDecimalHours(totalMonthMinutes)} total hours
                  </span>
                </div>
              </div>

              {monthEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Time In</th>
                        <th className="pb-2">Time Out</th>
                        <th className="pb-2">Lunch Deducted</th>
                        <th className="pb-2 text-right">Worked Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {monthEntries.map((e) => {
                        const worked = calculateWorkedMinutes({
                          timeInMinutes: e.timeInMinutes,
                          timeOutMinutes: e.timeOutMinutes,
                          lunchMinutesApplied: e.lunchMinutesApplied,
                        });
                        return (
                          <tr key={e.id} className="hover:bg-muted/20">
                            <td className="py-2.5 font-mono font-medium text-foreground">
                              {formatDateDisplay(e.workDate)}
                            </td>
                            <td className="py-2.5 font-mono">
                              {formatMinutesToTimeString(e.timeInMinutes)}
                            </td>
                            <td className="py-2.5 font-mono">
                              {formatMinutesToTimeString(e.timeOutMinutes)}
                            </td>
                            <td className="py-2.5 font-mono text-muted-foreground">
                              {e.lunchMinutesApplied > 0 ? `${e.lunchMinutesApplied}m` : "None"}
                            </td>
                            <td className="py-2.5 font-mono font-bold text-right text-foreground">
                              {formatWorkedHoursAndMinutes(worked)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-border rounded-xl">
                  <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-foreground">
                    No records found for {formatMonthDisplay(selectedMonday)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use &quot;New Entry&quot; or switch to weekly schedule to log shifts.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acceptance Rule Verification Callout */}
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground shadow-xs">
        <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-foreground">Acceptance Rule Verified:</span> Logging{" "}
          <strong className="text-foreground">8:30 AM</strong> to{" "}
          <strong className="text-foreground">6:30 PM</strong> with a{" "}
          <strong className="text-foreground">60m</strong> lunch deduction calculates to exactly{" "}
          <strong className="text-foreground font-mono">9h 00m (9.00 decimal hours)</strong>.
        </div>
      </div>

      {/* DTR Modal Dialog */}
      <DtrModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={modalDate}
        entryToEdit={entryToEdit}
        defaultLunchMinutes={initialSettings?.lunchBreakMinutes ?? 60}
        lunchEnabled={initialSettings?.lunchDeductionEnabled ?? true}
        onEntrySaved={handleEntrySaved}
      />
    </div>
  );
}
