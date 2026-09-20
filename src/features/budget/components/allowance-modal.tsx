"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X, Wallet, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateDisplay } from "@/lib/date";
import { formatMinorUnits, parseMajorToMinor } from "@/lib/money";
import { setAllowanceAction } from "../actions/budget-actions";
import type { WeeklyAllowanceData } from "../types";

interface AllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: string; // YYYY-MM-DD (Monday)
  currentAllowanceMinor: number;
  currency: string;
  onAllowanceSaved?: (allowance: WeeklyAllowanceData) => void;
}

export function AllowanceModal({
  isOpen,
  onClose,
  weekStart,
  currentAllowanceMinor,
  currency,
  onAllowanceSaved,
}: AllowanceModalProps) {
  const [amountStr, setAmountStr] = useState(
    currentAllowanceMinor > 0 ? (currentAllowanceMinor / 100).toFixed(2) : ""
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setAmountStr(
      currentAllowanceMinor > 0 ? (currentAllowanceMinor / 100).toFixed(2) : ""
    );
    setErrorMessage(null);
  }, [currentAllowanceMinor, weekStart, isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isValidAmount || parsedMinor === null) {
      setErrorMessage("Please enter a valid allowance amount.");
      return;
    }

    startTransition(async () => {
      const res = await setAllowanceAction({
        weekStart,
        amountMinor: parsedMinor,
      });

      if (!res.ok) {
        setErrorMessage(res.error);
        return;
      }

      if (res.data && onAllowanceSaved) {
        onAllowanceSaved(res.data);
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
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h2 id="allowance-modal-title" className="text-lg font-bold text-foreground">
                Set Weekly Allowance
              </h2>
              <p className="text-xs text-muted-foreground">
                Week starting {formatDateDisplay(weekStart)}
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
          {/* Amount Input */}
          <div className="space-y-1.5">
            <label htmlFor="allowance-amount" className="text-xs font-semibold text-foreground">
              Allowance Amount ({currency})
            </label>
            <div className="relative">
              <Input
                id="allowance-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                disabled={isPending}
                required
                autoFocus
                className="font-mono text-xl font-black"
              />
            </div>
            {isValidAmount && parsedMinor !== null && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-mono font-medium pt-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Formatted: {formatMinorUnits(parsedMinor, currency)}</span>
              </div>
            )}
          </div>

          {/* Inheritance Notice */}
          <div className="p-3.5 rounded-xl border border-border bg-card/60 text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Automatic Carryover:</span> Setting
            this allowance applies to the week starting {formatDateDisplay(weekStart)}. Subsequent
            weeks will automatically inherit this amount unless specifically updated.
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
                <span>Save Allowance</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
