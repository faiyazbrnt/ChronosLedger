"use client";

import React, { useState, useTransition } from "react";
import {
  Wallet,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  PieChart,
  CalendarDays,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Tv,
  MoreHorizontal,
  Loader2,
  Flame,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getMondayOfWeek,
  getSundayOfWeek,
  addWeeks,
  formatDateDisplay,
  formatMonthDisplay,
  getTodayDateString,
} from "@/lib/date";
import { formatMinorUnits } from "@/lib/money";
import {
  calculateRemaining,
  calculateSafeToSpendPerDay,
  calculateCategoryTotals,
} from "../lib/calc-budget";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteExpenseAction } from "../actions/budget-actions";
import { ExpenseModal } from "./expense-modal";
import { AllowanceModal } from "./allowance-modal";

const CategoryChart = dynamic(
  () => import("./category-chart").then((mod) => mod.CategoryChart),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
    ssr: false,
  }
);
import type {
  ExpenseData,
  WeeklyAllowanceData,
  ExpenseCategory,
  BudgetHealthStatus,
} from "../types";

const CATEGORY_ICONS: Record<
  ExpenseCategory,
  React.ComponentType<{ className?: string }>
> = {
  FOOD: Utensils,
  TRANSPORT: Car,
  BILLS: Receipt,
  SHOPPING: ShoppingBag,
  HEALTH: HeartPulse,
  ENTERTAINMENT: Tv,
  OTHER: MoreHorizontal,
};

interface BudgetViewProps {
  initialExpenses?: ExpenseData[];
  initialAllowance?: WeeklyAllowanceData | null;
  currency?: string;
  initialWeekMonday?: string;
}

export function BudgetView({
  initialExpenses = [],
  initialAllowance,
  currency = "PHP",
  initialWeekMonday,
}: BudgetViewProps) {
  const todayStr = getTodayDateString();
  const currentWeekMonday = getMondayOfWeek(todayStr);

  const [selectedMonday, setSelectedMonday] = useState(
    initialWeekMonday ?? currentWeekMonday
  );
  const [activeTab, setActiveTab] = useState<"this-week" | "monthly">("this-week");

  // Expenses & Allowance state
  const [expenses, setExpenses] = useState<ExpenseData[]>(initialExpenses);
  const [allowance, setAllowance] = useState<WeeklyAllowanceData | null>(
    initialAllowance ?? null
  );

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAllowanceModalOpen, setIsAllowanceModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseData | null>(null);

  // Deletion state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const selectedSunday = getSundayOfWeek(selectedMonday);

  // Filter expenses for current week
  const weekExpenses = expenses.filter(
    (e) => e.spentOn >= selectedMonday && e.spentOn <= selectedSunday
  );

  const allowanceMinor = allowance?.amountMinor ?? 0;
  const weekTotalSpentMinor = weekExpenses.reduce(
    (acc, curr) => acc + curr.amountMinor,
    0
  );
  const remainingMinor = calculateRemaining(allowanceMinor, weekTotalSpentMinor);

  // Calculate days left in the week through Sunday
  const today = new Date(todayStr + "T00:00:00Z");
  const sunday = new Date(selectedSunday + "T00:00:00Z");
  const diffDays = Math.ceil(
    (sunday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysLeft = Math.max(1, diffDays + 1);

  const safeToSpendPerDayMinor = calculateSafeToSpendPerDay(
    remainingMinor,
    daysLeft
  );

  // Budget Status & Health Logic
  let status: BudgetHealthStatus = "ON_TRACK";
  const percentUsed =
    allowanceMinor > 0 ? (weekTotalSpentMinor / allowanceMinor) * 100 : 0;

  if (remainingMinor < 0) {
    status = "OVER_BUDGET";
  } else if (percentUsed >= 76) {
    status = "NEAR_LIMIT";
  }

  // Monthly summary calculations
  const [selectedYear, selectedMonth] = selectedMonday.split("-");
  const monthPrefix = `${selectedYear}-${selectedMonth}`;
  const monthExpenses = expenses.filter((e) => e.spentOn.startsWith(monthPrefix));
  const monthTotalSpentMinor = monthExpenses.reduce(
    (acc, curr) => acc + curr.amountMinor,
    0
  );

  const monthCategoryTotals = calculateCategoryTotals(monthExpenses);

  // Find top category for the month
  let topCategory: { name: string; amount: number } | null = null;
  Object.entries(monthCategoryTotals).forEach(([cat, amount]) => {
    if (!topCategory || amount > topCategory.amount) {
      topCategory = { name: cat, amount };
    }
  });

  // Group week expenses by day
  const groupedExpenses = weekExpenses.reduce<Record<string, ExpenseData[]>>(
    (acc, exp) => {
      acc[exp.spentOn] = acc[exp.spentOn] ?? [];
      acc[exp.spentOn]!.push(exp);
      return acc;
    },
    {}
  );

  const sortedGroupDates = Object.keys(groupedExpenses).sort((a, b) =>
    b.localeCompare(a)
  );

  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
    setActionError(null);
  };

  const handleOpenEditExpense = (expense: ExpenseData) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
    setActionError(null);
  };

  const handleExpenseSaved = (saved: ExpenseData) => {
    setExpenses((prev) => {
      const filtered = prev.filter((e) => e.id !== saved.id);
      return [saved, ...filtered];
    });
  };

  const handleAllowanceSaved = (updated: WeeklyAllowanceData) => {
    setAllowance(updated);
  };

  const handleDeleteExpense = (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    setActionError(null);
    setDeletingId(id);

    startTransition(async () => {
      const res = await deleteExpenseAction(id);
      setDeletingId(null);
      if (!res.ok) {
        setActionError(res.error);
        return;
      }
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Budget Tracker
            </h1>
            <Badge variant="secondary" className="text-[10px] font-mono">
              Finance
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage weekly allowances, track daily expenses, and view monthly category spending.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAllowanceModalOpen(true)}
            className="text-xs font-semibold gap-1.5"
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Set Allowance</span>
          </Button>
          <Button
            size="sm"
            onClick={handleOpenAddExpense}
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* Global Action Error Alert */}
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

      {/* Week Navigator & Tab Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* Tab Controls */}
        <div className="flex p-1 space-x-1 rounded-xl bg-card border border-border w-full sm:w-auto" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "this-week"}
            onClick={() => setActiveTab("this-week")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "this-week"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>This Week</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "monthly"}
            onClick={() => setActiveTab("monthly")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "monthly"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PieChart className="h-3.5 w-3.5" />
            <span>Monthly</span>
          </button>
        </div>
      </div>

      {/* Tab 1: This Week */}
      {activeTab === "this-week" && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Allowance Card */}
            <Card className="shadow-xs">
              <CardHeader className="pb-1.5 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[11px] uppercase font-bold tracking-wider">
                    Weekly Allowance
                  </CardDescription>
                  {allowance?.isInherited && (
                    <Badge variant="outline" className="text-[10px]">
                      Inherited
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                  {formatMinorUnits(allowanceMinor, currency)}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <button
                  type="button"
                  onClick={() => setIsAllowanceModalOpen(true)}
                  className="text-xs text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  {allowanceMinor > 0 ? "Adjust allowance" : "Set allowance"}
                </button>
              </CardContent>
            </Card>

            {/* Total Spent Card */}
            <Card className="shadow-xs">
              <CardHeader className="pb-1.5 pt-4 px-4">
                <CardDescription className="text-[11px] uppercase font-bold tracking-wider">
                  Total Spent
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                  {formatMinorUnits(weekTotalSpentMinor, currency)}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <span className="text-xs text-muted-foreground">
                  {weekExpenses.length} {weekExpenses.length === 1 ? "expense" : "expenses"} logged
                </span>
              </CardContent>
            </Card>

            {/* Remaining Card */}
            <Card
              className={`shadow-xs border-l-4 ${
                status === "OVER_BUDGET"
                  ? "border-l-destructive"
                  : status === "NEAR_LIMIT"
                  ? "border-l-amber-500"
                  : "border-l-primary"
              }`}
            >
              <CardHeader className="pb-1.5 pt-4 px-4">
                <CardDescription className="text-[11px] uppercase font-bold tracking-wider">
                  Remaining
                </CardDescription>
                <CardTitle
                  className={`text-2xl sm:text-3xl font-black font-mono ${
                    status === "OVER_BUDGET"
                      ? "text-destructive"
                      : status === "NEAR_LIMIT"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-foreground"
                  }`}
                >
                  {remainingMinor < 0
                    ? `-${formatMinorUnits(Math.abs(remainingMinor), currency)}`
                    : formatMinorUnits(remainingMinor, currency)}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {status === "OVER_BUDGET" ? (
                  <span className="text-xs text-destructive font-medium flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 shrink-0" />
                    Over budget by {formatMinorUnits(Math.abs(remainingMinor), currency)}
                  </span>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Safe to spend: {formatMinorUnits(safeToSpendPerDayMinor, currency)} / day ({daysLeft}d left)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Budget Health & Progress Bar */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {status === "OVER_BUDGET" ? (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  ) : status === "NEAR_LIMIT" ? (
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  )}
                  <CardTitle className="text-base font-bold text-foreground">
                    {status === "OVER_BUDGET"
                      ? "Budget Status: Over Budget"
                      : status === "NEAR_LIMIT"
                      ? "Budget Status: Near Limit"
                      : "Budget Status: On Track"}
                  </CardTitle>
                </div>

                <Badge
                  variant={
                    status === "OVER_BUDGET"
                      ? "destructive"
                      : status === "NEAR_LIMIT"
                      ? "secondary"
                      : "outline"
                  }
                  className="font-mono text-xs w-fit"
                >
                  {percentUsed.toFixed(0)}% Used
                </Badge>
              </div>

              <CardDescription className="text-xs">
                {status === "OVER_BUDGET"
                  ? `You have spent ${formatMinorUnits(weekTotalSpentMinor, currency)}, exceeding your ${formatMinorUnits(allowanceMinor, currency)} allowance.`
                  : status === "NEAR_LIMIT"
                  ? `You have consumed ${percentUsed.toFixed(0)}% of your allowance with ${daysLeft} days remaining in the week.`
                  : `Spending is well-balanced with ${formatMinorUnits(remainingMinor, currency)} remaining for the rest of the week.`}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 pb-5 pt-1 space-y-2">
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    status === "OVER_BUDGET"
                      ? "bg-destructive"
                      : status === "NEAR_LIMIT"
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, percentUsed))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-mono pt-0.5">
                <span>Spent: {formatMinorUnits(weekTotalSpentMinor, currency)}</span>
                <span>Allowance: {formatMinorUnits(allowanceMinor, currency)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Daily Grouped Expenses */}
          <Card className="shadow-xs">
            <CardHeader className="p-4 sm:p-6 border-b border-border/80">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">This Week&apos;s Expenses</CardTitle>
                  <CardDescription className="text-xs">
                    Expenses grouped by day with per-day subtotals
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenAddExpense}
                  className="text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Expense</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {sortedGroupDates.length > 0 ? (
                <div className="divide-y divide-border">
                  {sortedGroupDates.map((dateStr) => {
                    const dayExpenses = groupedExpenses[dateStr] ?? [];
                    const dayTotalMinor = dayExpenses.reduce(
                      (acc, curr) => acc + curr.amountMinor,
                      0
                    );

                    return (
                      <div key={dateStr} className="p-4 sm:p-5 space-y-3">
                        {/* Day Group Header */}
                        <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                          <span className="font-bold text-foreground">
                            {formatDateDisplay(dateStr)}
                          </span>
                          <span className="font-mono font-bold text-foreground bg-muted/60 px-2.5 py-0.5 rounded-md">
                            Day Total: {formatMinorUnits(dayTotalMinor, currency)}
                          </span>
                        </div>

                        {/* Expenses on this day */}
                        <div className="space-y-2">
                          {dayExpenses.map((exp) => {
                            const Icon = CATEGORY_ICONS[exp.category] ?? MoreHorizontal;

                            return (
                              <div
                                key={exp.id}
                                className="flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-card/60 hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="truncate">
                                    <span className="text-xs font-semibold text-foreground capitalize block truncate">
                                      {exp.category.toLowerCase()}
                                    </span>
                                    {exp.note && (
                                      <span className="text-[11px] text-muted-foreground truncate block">
                                        {exp.note}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-sm font-bold text-foreground font-mono">
                                    {formatMinorUnits(exp.amountMinor, currency)}
                                  </span>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleOpenEditExpense(exp)}
                                      aria-label="Edit expense"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleDeleteExpense(exp.id)}
                                      disabled={deletingId === exp.id}
                                      aria-label="Delete expense"
                                    >
                                      {deletingId === exp.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty Week State */
                <div className="p-8 text-center bg-card/40">
                  <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <h3 className="text-base font-semibold text-foreground">
                    No expenses recorded for this week
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                    Track daily spending by logging expenses across categories (Food, Transport, Bills, Shopping, Health, Entertainment, Other).
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAddExpense}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Expense</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Monthly */}
      {activeTab === "monthly" && (
        <div className="space-y-6">
          {/* Monthly KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-xs">
              <CardHeader className="pb-1.5 pt-4 px-4">
                <CardDescription className="text-[11px] uppercase font-bold tracking-wider">
                  Monthly Total Spent
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                  {formatMinorUnits(monthTotalSpentMinor, currency)}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-xs text-muted-foreground">
                  {formatMonthDisplay(selectedMonday)} ({monthExpenses.length} transactions)
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="pb-1.5 pt-4 px-4">
                <CardDescription className="text-[11px] uppercase font-bold tracking-wider">
                  Daily Average Spent
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                  {formatMinorUnits(
                    monthTotalSpentMinor > 0 ? Math.round(monthTotalSpentMinor / 30) : 0,
                    currency
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-xs text-muted-foreground">Across calendar month</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="pb-1.5 pt-4 px-4">
                <CardDescription className="text-[11px] uppercase font-bold tracking-wider">
                  Top Spending Category
                </CardDescription>
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground capitalize">
                  {topCategory ? (topCategory as { name: string; amount: number }).name.toLowerCase() : "None"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-xs text-muted-foreground font-mono">
                  {topCategory
                    ? formatMinorUnits((topCategory as { name: string; amount: number }).amount, currency)
                    : "No spending logged yet"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown Chart */}
          <Card className="shadow-xs">
            <CardHeader className="p-4 sm:p-6 border-b border-border/80">
              <CardTitle className="text-base font-bold">Category Distribution</CardTitle>
              <CardDescription className="text-xs">
                Visual breakdown of expenditures by category for {formatMonthDisplay(selectedMonday)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <CategoryChart
                categoryTotals={monthCategoryTotals}
                totalSpentMinor={monthTotalSpentMinor}
                currency={currency}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        defaultDate={selectedMonday <= todayStr && todayStr <= selectedSunday ? todayStr : selectedMonday}
        expenseToEdit={expenseToEdit}
        currency={currency}
        onExpenseSaved={handleExpenseSaved}
      />

      {/* Allowance Modal */}
      <AllowanceModal
        isOpen={isAllowanceModalOpen}
        onClose={() => setIsAllowanceModalOpen(false)}
        weekStart={selectedMonday}
        currentAllowanceMinor={allowanceMinor}
        currency={currency}
        onAllowanceSaved={handleAllowanceSaved}
      />
    </div>
  );
}
