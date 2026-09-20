"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  X,
  Wallet,
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Tv,
  MoreHorizontal,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTodayDateString, formatDateDisplay } from "@/lib/date";
import { formatMinorUnits, parseMajorToMinor } from "@/lib/money";
import { createExpenseAction, updateExpenseAction } from "../actions/budget-actions";
import { expenseCategories } from "../schemas";
import type { ExpenseCategory, ExpenseData } from "../types";

const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  FOOD: { label: "Food & Dining", icon: Utensils },
  TRANSPORT: { label: "Transportation", icon: Car },
  BILLS: { label: "Bills & Utilities", icon: Receipt },
  SHOPPING: { label: "Shopping", icon: ShoppingBag },
  HEALTH: { label: "Health & Medical", icon: HeartPulse },
  ENTERTAINMENT: { label: "Entertainment", icon: Tv },
  OTHER: { label: "Other", icon: MoreHorizontal },
};

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string; // YYYY-MM-DD
  expenseToEdit?: ExpenseData | null;
  currency: string;
  onExpenseSaved?: (expense: ExpenseData) => void;
}

export function ExpenseModal({
  isOpen,
  onClose,
  defaultDate,
  expenseToEdit,
  currency,
  onExpenseSaved,
}: ExpenseModalProps) {
  const [spentOn, setSpentOn] = useState(defaultDate ?? getTodayDateString());
  const [category, setCategory] = useState<ExpenseCategory>("FOOD");
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (expenseToEdit) {
      setSpentOn(expenseToEdit.spentOn);
      setCategory(expenseToEdit.category);
      setAmountStr((expenseToEdit.amountMinor / 100).toFixed(2));
      setNote(expenseToEdit.note ?? "");
    } else {
      setSpentOn(defaultDate ?? getTodayDateString());
      setCategory("FOOD");
      setAmountStr("");
      setNote("");
    }
    setErrorMessage(null);
  }, [expenseToEdit, defaultDate, isOpen]);

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
  const isValidAmount = parsedMinor !== null && parsedMinor > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!spentOn) {
      setErrorMessage("Please select a date.");
      return;
    }

    if (!isValidAmount || parsedMinor === null) {
      setErrorMessage("Please enter a valid expense amount greater than 0.");
      return;
    }

    startTransition(async () => {
      if (expenseToEdit) {
        const res = await updateExpenseAction({
          id: expenseToEdit.id,
          spentOn,
          category,
          amountMinor: parsedMinor,
          note: note.trim() || undefined,
        });

        if (!res.ok) {
          setErrorMessage(res.error);
          return;
        }

        if (onExpenseSaved) {
          onExpenseSaved({
            ...expenseToEdit,
            spentOn,
            category,
            amountMinor: parsedMinor,
            note: note.trim() || null,
          });
        }
      } else {
        const res = await createExpenseAction({
          spentOn,
          category,
          amountMinor: parsedMinor,
          note: note.trim() || undefined,
        });

        if (!res.ok) {
          setErrorMessage(res.error);
          return;
        }

        if (res.data && onExpenseSaved) {
          onExpenseSaved(res.data);
        }
      }

      onClose();
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h2 id="expense-modal-title" className="text-lg font-bold text-foreground">
                {expenseToEdit ? "Edit Expense" : "Log Expense"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {spentOn ? formatDateDisplay(spentOn) : "Budget Tracker"}
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
            <label htmlFor="expense-amount" className="text-xs font-semibold text-foreground">
              Amount ({currency})
            </label>
            <div className="relative">
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                disabled={isPending}
                required
                autoFocus
                className="font-mono text-lg font-bold"
              />
            </div>
            {isValidAmount && (
              <span className="text-xs text-primary font-mono font-medium block">
                Formatted: {formatMinorUnits(parsedMinor, currency)}
              </span>
            )}
          </div>

          {/* Category Selector Grid */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-foreground">
              Category
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {expenseCategories.map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const Icon = config.icon;
                const isSelected = category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    disabled={isPending}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card/70 text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Input */}
          <div className="space-y-1.5">
            <label htmlFor="expense-date" className="text-xs font-semibold text-foreground">
              Date Spent
            </label>
            <Input
              id="expense-date"
              type="date"
              value={spentOn}
              onChange={(e) => setSpentOn(e.target.value)}
              disabled={isPending}
              required
              className="font-mono text-sm"
            />
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label htmlFor="expense-note" className="text-xs font-semibold text-foreground">
              Note (Optional)
            </label>
            <Input
              id="expense-note"
              type="text"
              maxLength={255}
              placeholder="e.g. Lunch with team, monthly internet, fuel..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
              className="text-sm"
            />
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
                <span>{expenseToEdit ? "Update Expense" : "Save Expense"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
