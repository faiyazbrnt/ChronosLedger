"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  parseTimeToMinutes,
  formatMinutesTo24H,
  formatMinutesToTimeString,
  getTodayDateString,
  formatDateDisplay,
} from "@/lib/date";
import {
  calculateWorkedMinutes,
  formatWorkedHoursAndMinutes,
  formatWorkedDecimalHours,
} from "../lib/calc-hours";
import { saveDtrEntryAction } from "../actions/dtr-actions";
import type { DtrEntryData } from "../types";

interface DtrModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string; // YYYY-MM-DD
  entryToEdit?: DtrEntryData | null;
  defaultLunchMinutes: number;
  lunchEnabled: boolean;
  onEntrySaved?: (entry: DtrEntryData) => void;
}

export function DtrModal({
  isOpen,
  onClose,
  defaultDate,
  entryToEdit,
  defaultLunchMinutes,
  lunchEnabled,
  onEntrySaved,
}: DtrModalProps) {
  const [workDate, setWorkDate] = useState(defaultDate ?? getTodayDateString());
  const [timeInStr, setTimeInStr] = useState("08:30");
  const [timeOutStr, setTimeOutStr] = useState("18:30");
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Populate form when opening or when entryToEdit changes
  useEffect(() => {
    if (entryToEdit) {
      setWorkDate(entryToEdit.workDate);
      setTimeInStr(formatMinutesTo24H(entryToEdit.timeInMinutes));
      setTimeOutStr(formatMinutesTo24H(entryToEdit.timeOutMinutes));
      setNote(entryToEdit.note ?? "");
    } else {
      setWorkDate(defaultDate ?? getTodayDateString());
      setTimeInStr("08:30");
      setTimeOutStr("18:30");
      setNote("");
    }
    setErrorMessage(null);
  }, [entryToEdit, defaultDate, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  // Live calculation derived values
  const timeInMins = parseTimeToMinutes(timeInStr) ?? 0;
  const timeOutMins = parseTimeToMinutes(timeOutStr) ?? 0;
  const lunchMinutesToApply = entryToEdit
    ? entryToEdit.lunchMinutesApplied
    : lunchEnabled
    ? defaultLunchMinutes
    : 0;

  const isValidTimes = timeOutMins > timeInMins;
  const rawShiftMinutes = isValidTimes ? timeOutMins - timeInMins : 0;
  const netWorkedMinutes = isValidTimes
    ? calculateWorkedMinutes({
        timeInMinutes: timeInMins,
        timeOutMinutes: timeOutMins,
        lunchMinutesApplied: lunchMinutesToApply,
      })
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!workDate) {
      setErrorMessage("Please select a date.");
      return;
    }

    if (!isValidTimes) {
      setErrorMessage("Time out must be later than time in.");
      return;
    }

    startTransition(async () => {
      const response = await saveDtrEntryAction({
        workDate,
        timeInMinutes: timeInMins,
        timeOutMinutes: timeOutMins,
        note: note.trim() || undefined,
      });

      if (!response.ok) {
        setErrorMessage(response.error);
        return;
      }

      if (response.data && onEntrySaved) {
        onEntrySaved(response.data);
      }
      onClose();
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dtr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 id="dtr-modal-title" className="text-lg font-bold text-foreground">
                {entryToEdit ? "Edit Time Record" : "Log Shift Hours"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {workDate ? formatDateDisplay(workDate) : "Daily Time Record"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Work Date */}
          <div className="space-y-1.5">
            <label htmlFor="dtr-date" className="text-xs font-semibold text-foreground">
              Work Date
            </label>
            <div className="relative">
              <Input
                id="dtr-date"
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                disabled={isPending || Boolean(entryToEdit)}
                required
                className="font-mono text-sm"
              />
            </div>
            {entryToEdit && (
              <p className="text-[11px] text-muted-foreground">
                Date cannot be changed for an existing entry. Create a new entry for a different date.
              </p>
            )}
          </div>

          {/* Time In and Time Out */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="dtr-time-in" className="text-xs font-semibold text-foreground">
                Time In (Clock In)
              </label>
              <Input
                id="dtr-time-in"
                type="time"
                value={timeInStr}
                onChange={(e) => setTimeInStr(e.target.value)}
                disabled={isPending}
                required
                className="font-mono text-sm"
              />
              <span className="text-[11px] text-muted-foreground block">
                {formatMinutesToTimeString(timeInMins)}
              </span>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dtr-time-out" className="text-xs font-semibold text-foreground">
                Time Out (Clock Out)
              </label>
              <Input
                id="dtr-time-out"
                type="time"
                value={timeOutStr}
                onChange={(e) => setTimeOutStr(e.target.value)}
                disabled={isPending}
                required
                className="font-mono text-sm"
              />
              <span className="text-[11px] text-muted-foreground block">
                {formatMinutesToTimeString(timeOutMins)}
              </span>
            </div>
          </div>

          {/* Live Calculation Preview Banner */}
          <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Calculated Worked Time</span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {lunchMinutesToApply > 0 ? `-${lunchMinutesToApply}m lunch` : "No lunch deduction"}
              </Badge>
            </div>

            {isValidTimes ? (
              <div className="pt-1">
                <div className="text-2xl font-black text-foreground font-mono">
                  {formatWorkedHoursAndMinutes(netWorkedMinutes)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({formatWorkedDecimalHours(netWorkedMinutes)} hrs)
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Shift: {formatMinutesToTimeString(timeInMins)} – {formatMinutesToTimeString(timeOutMins)} (
                  {formatWorkedHoursAndMinutes(rawShiftMinutes)})
                  {lunchMinutesToApply > 0 ? ` − ${lunchMinutesToApply}m lunch` : ""}
                </p>
              </div>
            ) : (
              <p className="text-xs text-destructive font-medium pt-1">
                Time out must be later than time in to calculate hours.
              </p>
            )}
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label htmlFor="dtr-note" className="text-xs font-semibold text-foreground">
              Optional Note
            </label>
            <textarea
              id="dtr-note"
              rows={2}
              maxLength={500}
              placeholder="e.g. Project deployment, overtime justification, remote shift..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
              className="flex w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isValidTimes}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{entryToEdit ? "Update Shift" : "Save Shift"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
