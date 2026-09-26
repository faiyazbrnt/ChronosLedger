"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X, Wallet, AlertCircle, Loader2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatMinorUnits, parseMajorToMinor } from "@/lib/money";
import { getTodayDateString } from "@/lib/date";
import { getCyclePeriod } from "../lib/calc-budget";
import { setBudgetCycleAction } from "../actions/budget-actions";
import type { BudgetCycleType, BudgetConfigData, WeeklyAllowanceData } from "../types";

const CYCLE_OPTIONS: Array<{
  type: BudgetCycleType;
  label: string;
  desc: string;
}> = [
  {
    type: "WEEKLY",
    label: "Weekly",
    desc: "7 days (Monday to Sunday)",
  },
  {
    type: "MONTHLY",
    label: "Monthly",
    desc: "Full calendar month (1st to last day)",
  },
  {
    type: "SEMI_MONTHLY",
    label: "Every 15 Days",
    desc: "Semi-monthly pay cycle anchored to payday",
  },
];

interface AllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart?: string; // YYYY-MM-DD
  currentAllowanceMinor: number;
  currentCycleType?: BudgetCycleType;
  currentAnchorDate?: string | null;
  currency: string;
  referenceDate?: string; // YYYY-MM-DD
  onBudgetConfigSaved?: (config: BudgetConfigData) => void;
  onAllowanceSaved?: (allowance: WeeklyAllowanceData) => void;
}

export function AllowanceModal({
  isOpen,
  onClose,
  currentAllowanceMinor,
  currentCycleType = "WEEKLY",
  currentAnchorDate,
  currency,
  referenceDate,
  onBudgetConfigSaved,
  onAllowanceSaved,
}: AllowanceModalProps) {
  const todayStr = getTodayDateString();
  const refDate = referenceDate ?? todayStr;

  const [cycleType, setCycleType] = useState<BudgetCycleType>(currentCycleType);
  const [amountStr, setAmountStr] = useState(
    currentAllowanceMinor > 0 ? (currentAllowanceMinor / 100).toFixed(2) : ""
  );
  const [anchorDate, setAnchorDate] = useState<string>(
    currentAnchorDate ?? `${todayStr.slice(0, 7)}-01`
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCycleType(currentCycleType);
    setAmountStr(
      currentAllowanceMinor > 0 ? (currentAllowanceMinor / 100).toFixed(2) : ""
    );
    setAnchorDate(currentAnchorDate ?? `${todayStr.slice(0, 7)}-01`);
    setErrorMessage(null);
  }, [currentAllowanceMinor, currentCycleType, currentAnchorDate, isOpen, todayStr]);

  // Handle ESC key
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

  const parsedMinor = parseMajorToMinor(amountStr);
  const isValidAmount = parsedMinor !== null && parsedMinor >= 0;

  // Live preview of the active cycle dates and daily allocation
  const previewPeriod = getCyclePeriod({
    targetDate: refDate,
    cycleType,
    anchorDate: cycleType === "SEMI_MONTHLY" ? anchorDate : null,
  });

  const dailyAllocationMinor =
    isValidAmount && parsedMinor !== null && previewPeriod.totalDays > 0
      ? Math.floor(parsedMinor / previewPeriod.totalDays)
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isValidAmount || parsedMinor === null) {
      setErrorMessage("Please enter a valid expense budget amount.");
      return;
    }

    if (cycleType === "SEMI_MONTHLY" && !anchorDate) {
      setErrorMessage("Please select an anchor payday date for the 15-day cycle.");
      return;
    }

    startTransition(async () => {
      const res = await setBudgetCycleAction({
        cycleType,
        amountMinor: parsedMinor,
        anchorDate: cycleType === "SEMI_MONTHLY" ? anchorDate : null,
      });

      if (!res.ok) {
        setErrorMessage(res.error);
        return;
      }

      if (res.data) {
        if (onBudgetConfigSaved) {
          onBudgetConfigSaved(res.data);
        }
        if (onAllowanceSaved) {
          onAllowanceSaved({
            id: res.data.id,
            userId: res.data.userId,
            weekStart: previewPeriod.startDate,
            amountMinor: res.data.amountMinor,
            isInherited: false,
          });
        }
      }
      onClose();
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="allowance-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="allowance-modal-title"
                className="text-lg font-bold text-foreground"
              >
                Configure Budget Cycle
              </h2>
              <p className="text-xs text-muted-foreground">
                Set your cycle frequency, budget amount, and pay periods
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cycle Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Budget Cycle Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CYCLE_OPTIONS.map((opt) => {
                const isSelected = cycleType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setCycleType(opt.type)}
                    disabled={isPending}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
                        : "border-border/70 hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span className="text-xs font-bold text-foreground">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Semi-Monthly Payday Anchor Date */}
          {cycleType === "SEMI_MONTHLY" && (
            <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Payday Anchor Date</span>
              </div>
              <Input
                type="date"
                value={anchorDate}
                onChange={(e) => setAnchorDate(e.target.value)}
                disabled={isPending}
                required
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                15-day expense periods will automatically align to this payday date.
              </p>
            </div>
          )}

          {/* Available Expense Amount */}
          <div className="space-y-1.5">
            <label
              htmlFor="cycle-amount"
              className="text-xs font-semibold text-foreground"
            >
              Available Expense Amount for this Cycle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground font-mono">
                {currency}
              </span>
              <Input
                id="cycle-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                disabled={isPending}
                required
                className="pl-14 font-mono text-base font-bold"
              />
            </div>
          </div>

          {/* Live Cycle Summary Preview Banner */}
          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Current Cycle Window
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {previewPeriod.totalDays} Days
              </Badge>
            </div>
            <div className="text-xs font-mono font-bold text-foreground">
              {previewPeriod.displayLabel}
            </div>
            {isValidAmount && parsedMinor !== null && parsedMinor > 0 && (
              <div className="pt-1 border-t border-border/40 text-[11px] text-muted-foreground flex justify-between">
                <span>Daily allowance rate:</span>
                <span className="font-bold text-foreground font-mono">
                  {formatMinorUnits(dailyAllocationMinor, currency)} / day
                </span>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-2">
              {[1000, 2500, 5000, 10000, 20000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountStr(preset.toFixed(2))}
                  disabled={isPending}
                  className="px-2.5 py-1 text-xs rounded-lg border border-border/70 hover:bg-muted font-mono transition-colors"
                >
                  {formatMinorUnits(preset * 100, currency)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
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
              disabled={isPending || !isValidAmount}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Budget Cycle</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
