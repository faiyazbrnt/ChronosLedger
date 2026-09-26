"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { X, Clock, AlertCircle, Loader2, Plus, Trash2, Coffee } from "lucide-react";
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
import { notifyActivityChanged } from "@/lib/activity-client";
import type { DtrEntryData, DtrBreakItem } from "../types";

interface EditableBreak {
  id?: string;
  category: string;
  durationValue: string; // user entered value
  unit: "minutes" | "hours";
}

interface DtrModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string; // YYYY-MM-DD
  entryToEdit?: DtrEntryData | null;
  defaultLunchMinutes?: number;
  lunchEnabled?: boolean;
  onEntrySaved?: (entry: DtrEntryData) => void;
}

export function DtrModal({
  isOpen,
  onClose,
  defaultDate,
  entryToEdit,
  onEntrySaved,
}: DtrModalProps) {
  const isEditing = Boolean(entryToEdit);

  const [workDate, setWorkDate] = useState(defaultDate ?? getTodayDateString());
  const [timeInStr, setTimeInStr] = useState("08:30");
  const [timeOutStr, setTimeOutStr] = useState("17:30");
  const [breaks, setBreaks] = useState<EditableBreak[]>([]);
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Populate form when opening or when entryToEdit changes
  useEffect(() => {
    if (entryToEdit) {
      setWorkDate(entryToEdit.workDate);
      setTimeInStr(formatMinutesTo24H(entryToEdit.timeInMinutes));
      setTimeOutStr(
        entryToEdit.timeOutMinutes !== null
          ? formatMinutesTo24H(entryToEdit.timeOutMinutes)
          : "17:30"
      );
      setNote(entryToEdit.note ?? "");

      // If entry has structured breaks, load them
      if (entryToEdit.breaks && entryToEdit.breaks.length > 0) {
        setBreaks(
          entryToEdit.breaks.map((b) => ({
            id: b.id,
            category: b.category,
            durationValue: String(b.durationMinutes),
            unit: "minutes",
          }))
        );
      } else if (entryToEdit.lunchMinutesApplied > 0) {
        // Historical entry snapshot preserved as a break item
        setBreaks([
          {
            category: "Lunch (Historical Snapshot)",
            durationValue: String(entryToEdit.lunchMinutesApplied),
            unit: "minutes",
          },
        ]);
      } else {
        setBreaks([]);
      }
    } else {
      // Log Shift: clock in only
      setWorkDate(defaultDate ?? getTodayDateString());
      setTimeInStr("08:30");
      setTimeOutStr("17:30");
      setBreaks([]);
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Live calculation derived values
  const timeInMins = parseTimeToMinutes(timeInStr) ?? 0;
  const timeOutMins = isEditing ? parseTimeToMinutes(timeOutStr) : null;

  // Compute break duration in minutes for each break row
  const parsedBreaks: DtrBreakItem[] = breaks.map((b) => {
    const numeric = parseFloat(b.durationValue) || 0;
    const durationMinutes =
      b.unit === "hours" ? Math.round(numeric * 60) : Math.round(numeric);
    return {
      id: b.id,
      category: b.category,
      durationMinutes: Math.max(0, durationMinutes),
    };
  });

  const totalBreakDeduction = parsedBreaks.reduce(
    (sum, b) => sum + b.durationMinutes,
    0
  );

  const isValidTimes =
    !isEditing || (timeOutMins !== null && timeOutMins > timeInMins);
  const rawShiftMinutes =
    isEditing && timeOutMins !== null && timeOutMins > timeInMins
      ? timeOutMins - timeInMins
      : 0;
  const netWorkedMinutes =
    isEditing && timeOutMins !== null && timeOutMins > timeInMins
      ? calculateWorkedMinutes({
          timeInMinutes: timeInMins,
          timeOutMinutes: timeOutMins,
          breaks: parsedBreaks,
        })
      : 0;

  const handleAddBreak = () => {
    setBreaks((prev) => [
      ...prev,
      {
        category: prev.length === 0 ? "Lunch" : "Coffee break",
        durationValue: "30",
        unit: "minutes",
      },
    ]);
  };

  const handleRemoveBreak = (index: number) => {
    setBreaks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBreak = (
    index: number,
    field: keyof EditableBreak,
    value: string
  ) => {
    setBreaks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!workDate) {
      setErrorMessage("Please select a date.");
      return;
    }

    if (isEditing && (!isValidTimes || timeOutMins === null)) {
      setErrorMessage("Time out must be later than time in.");
      return;
    }

    // Verify all break entries have a category
    if (isEditing) {
      for (const b of breaks) {
        if (!b.category.trim()) {
          setErrorMessage("Please provide a category description for all break entries.");
          return;
        }
      }
    }

    startTransition(async () => {
      const response = await saveDtrEntryAction({
        workDate,
        timeInMinutes: timeInMins,
        timeOutMinutes: isEditing ? timeOutMins : null,
        breaks: isEditing
          ? parsedBreaks.map((b) => ({
              category: b.category.trim() || "Break",
              durationMinutes: b.durationMinutes,
            }))
          : [],
        note: note.trim() || undefined,
      });

      if (!response.ok) {
        setErrorMessage(response.error);
        return;
      }

      if (response.data && onEntrySaved) {
        onEntrySaved(response.data);
      }
      notifyActivityChanged();
      onClose();
    });
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dtr-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
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
                {isEditing ? "Edit Time Record" : "Log Shift (Clock In)"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {workDate ? formatDateDisplay(workDate) : "Daily Time Record"} ·{" "}
                {isEditing ? "Close out or amend shift & breaks" : "Start your shift record"}
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
            <Input
              id="dtr-date"
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              disabled={isPending || isEditing}
              required
              className="font-mono text-sm"
            />
            {isEditing && (
              <p className="text-[11px] text-muted-foreground">
                Date cannot be changed for an existing shift.
              </p>
            )}
          </div>

          {/* Time In & Time Out */}
          <div className={`grid ${isEditing ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-4`}>
            {/* Time In (Always shown) */}
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

            {/* Time Out (Shown only when editing/closing out) */}
            {isEditing && (
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
                  {timeOutMins !== null
                    ? formatMinutesToTimeString(timeOutMins)
                    : "--:--"}
                </span>
              </div>
            )}
          </div>

          {/* EDITING ONLY: Manual Break Entries Section */}
          {isEditing && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Coffee className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    Break Times
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {breaks.length} logged
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBreak}
                  disabled={isPending}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Break</span>
                </Button>
              </div>

              {breaks.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-border/80 text-center text-xs text-muted-foreground bg-muted/20">
                  No breaks added. Zero time will be deducted.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {breaks.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl border border-border/60 bg-muted/20"
                    >
                      {/* Break Category (Free Text) */}
                      <Input
                        type="text"
                        placeholder="e.g. Lunch, Coffee, Errand"
                        value={b.category}
                        onChange={(e) =>
                          handleUpdateBreak(idx, "category", e.target.value)
                        }
                        disabled={isPending}
                        className="text-xs flex-1 h-8"
                      />

                      {/* Duration Input */}
                      <Input
                        type="number"
                        min="0"
                        step={b.unit === "hours" ? "0.25" : "1"}
                        placeholder={b.unit === "hours" ? "1.0" : "30"}
                        value={b.durationValue}
                        onChange={(e) =>
                          handleUpdateBreak(idx, "durationValue", e.target.value)
                        }
                        disabled={isPending}
                        className="w-20 text-xs h-8 font-mono"
                      />

                      {/* Unit Toggle (Minutes / Hours) */}
                      <div className="flex rounded-lg border border-border bg-card p-0.5 text-[10px] font-semibold shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateBreak(idx, "unit", "minutes")}
                          className={`px-1.5 py-1 rounded ${
                            b.unit === "minutes"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Mins
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateBreak(idx, "unit", "hours")}
                          className={`px-1.5 py-1 rounded ${
                            b.unit === "hours"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Hrs
                        </button>
                      </div>

                      {/* Delete Break Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBreak(idx)}
                        disabled={isPending}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        aria-label="Remove break"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDITING ONLY: Live Calculation Preview Banner */}
          {isEditing && (
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Calculated Worked Time
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {totalBreakDeduction > 0
                    ? `-${totalBreakDeduction}m breaks deducted`
                    : "No break deduction"}
                </Badge>
              </div>

              {isValidTimes && timeOutMins !== null ? (
                <div className="pt-1">
                  <div className="text-2xl font-black text-foreground font-mono">
                    {formatWorkedHoursAndMinutes(netWorkedMinutes)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({formatWorkedDecimalHours(netWorkedMinutes)} hrs)
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Shift: {formatMinutesToTimeString(timeInMins)} –{" "}
                    {formatMinutesToTimeString(timeOutMins)} (
                    {formatWorkedHoursAndMinutes(rawShiftMinutes)})
                    {totalBreakDeduction > 0 ? ` − ${totalBreakDeduction}m breaks` : ""}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-destructive font-medium pt-1">
                  Time out must be later than time in to calculate hours.
                </p>
              )}
            </div>
          )}

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
              disabled={isPending || (isEditing && !isValidTimes)}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Update Shift" : "Clock In (Start Shift)"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
