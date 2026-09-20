import React from "react";
import Link from "next/link";
import {
  Clock,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Coffee,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMinorUnits } from "@/lib/money";
import { formatDateDisplay } from "@/lib/date";
import type { DashboardData, DashboardExpenseCategory } from "../types";

const CATEGORY_STYLES: Record<
  DashboardExpenseCategory,
  { label: string; bg: string; text: string; border: string }
> = {
  FOOD: {
    label: "Food & Dining",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-500/30",
  },
  TRANSPORT: {
    label: "Transportation",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-500/30",
  },
  BILLS: {
    label: "Bills & Utilities",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-500/30",
  },
  SHOPPING: {
    label: "Shopping",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-800 dark:text-purple-300",
    border: "border-purple-500/30",
  },
  HEALTH: {
    label: "Health",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-500/30",
  },
  ENTERTAINMENT: {
    label: "Entertainment",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-800 dark:text-indigo-300",
    border: "border-indigo-500/30",
  },
  OTHER: {
    label: "Other",
    bg: "bg-neutral-500/10 dark:bg-neutral-500/20",
    text: "text-neutral-800 dark:text-neutral-300",
    border: "border-neutral-500/30",
  },
};

interface DashboardViewProps {
  data: DashboardData;
}

export function DashboardView({ data }: DashboardViewProps) {
  const { user, settings, currentWeek, weeklyDtr, weeklyBudget, recentShifts, recentExpenses } = data;
  const currency = settings.currency;

  const isOverBudget = weeklyBudget.status === "OVER_BUDGET";
  const isNearLimit = weeklyBudget.status === "NEAR_LIMIT";

  const userDisplayName = user.email ? user.email.split("@")[0] : "there";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Dashboard
            </h1>
            <Badge variant="outline" className="gap-1 font-mono text-xs border-primary/30">
              <Calendar className="h-3 w-3 text-primary" />
              {currentWeek.displayLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{userDisplayName}</span>. Here is your weekly summary.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link href="/dtr">
            <Button variant="outline" size="sm" className="gap-1.5 focus-visible:ring-2 focus-visible:ring-primary">
              <Clock className="h-4 w-4" />
              <span>Log Shift</span>
            </Button>
          </Link>
          <Link href="/budget">
            <Button size="sm" className="gap-1.5 focus-visible:ring-2 focus-visible:ring-primary">
              <Wallet className="h-4 w-4" />
              <span>Add Expense</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Budget Status Alert Banner (When Over Budget or Near Limit) */}
      {isOverBudget && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive dark:border-destructive/50 dark:bg-destructive/15"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Over Weekly Budget</h2>
              <p className="text-xs opacity-90">
                You have exceeded this week&apos;s allowance by{" "}
                <span className="font-bold">
                  {formatMinorUnits(Math.abs(weeklyBudget.remainingMinor), currency)}
                </span>
                . Total spent: {formatMinorUnits(weeklyBudget.totalSpentMinor, currency)}.
              </p>
            </div>
          </div>
          <Link href="/budget">
            <Button variant="outline" size="sm" className="shrink-0 border-destructive/40 hover:bg-destructive/20 text-destructive">
              Review Expenses
            </Button>
          </Link>
        </div>
      )}

      {isNearLimit && !isOverBudget && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 dark:border-amber-500/50 dark:bg-amber-500/15"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Near Allowance Limit ({weeklyBudget.percentUsed}%)</h2>
              <p className="text-xs opacity-90">
                You have{" "}
                <span className="font-bold">
                  {formatMinorUnits(weeklyBudget.remainingMinor, currency)}
                </span>{" "}
                remaining. Recommended safe rate: {formatMinorUnits(weeklyBudget.safeToSpendPerDayMinor, currency)} / day.
              </p>
            </div>
          </div>
          <Link href="/budget">
            <Button variant="outline" size="sm" className="shrink-0 border-amber-500/40 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200">
              View Budget
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Weekly Hours Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              This Week Hours
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black tracking-tight text-foreground">
                {weeklyDtr.formattedHours}
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {weeklyDtr.decimalHours} hrs
              </span>
            </div>

            {/* Target Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Target: {weeklyDtr.targetHours}h / week</span>
                <span className="font-semibold text-foreground">{weeklyDtr.percentTarget}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, weeklyDtr.percentTarget)}%` }}
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {weeklyDtr.daysWorked} of 7 days logged
              </span>
              <Link href="/dtr" className="text-primary font-semibold hover:underline flex items-center gap-0.5">
                Timesheet <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Remaining Allowance Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Remaining Allowance
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div
                className={`text-3xl font-black tracking-tight ${
                  isOverBudget
                    ? "text-destructive"
                    : isNearLimit
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-primary"
                }`}
              >
                {formatMinorUnits(weeklyBudget.remainingMinor, currency)}
              </div>
              {weeklyBudget.isInherited && (
                <Badge variant="secondary" className="text-[10px] font-mono">
                  Inherited
                </Badge>
              )}
            </div>

            {/* Allowance Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Spent {formatMinorUnits(weeklyBudget.totalSpentMinor, currency)} of{" "}
                  {formatMinorUnits(weeklyBudget.allowanceMinor, currency)}
                </span>
                <span className="font-semibold text-foreground">{weeklyBudget.percentUsed}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget
                      ? "bg-destructive"
                      : isNearLimit
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, weeklyBudget.percentUsed)}%` }}
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50">
              <span className="flex items-center gap-1 font-medium">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Safe: {formatMinorUnits(weeklyBudget.safeToSpendPerDayMinor, currency)} / day
              </span>
              <Link href="/budget" className="text-primary font-semibold hover:underline flex items-center gap-0.5">
                Budget <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Sync & Health Overview Card */}
        <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Account Overview
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2.5">
              {/* Budget Health Pill */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-xs text-muted-foreground">Budget Health</span>
                <div className="flex items-center gap-1.5">
                  {isOverBudget ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-xs font-bold text-destructive">Over Budget</span>
                    </>
                  ) : isNearLimit ? (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Near Limit</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">On Track</span>
                    </>
                  )}
                </div>
              </div>

              {/* Lunch Snapshot Rule */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-xs text-muted-foreground">Lunch Deduction</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Coffee className="h-3.5 w-3.5 text-primary" />
                  {settings.lunchDeductionEnabled
                    ? `${settings.lunchBreakMinutes}m auto-break`
                    : "No deduction"}
                </div>
              </div>

              {/* Base Currency */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-xs text-muted-foreground">Active Currency</span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {currency}
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end text-xs text-muted-foreground border-t border-border/50">
              <Link href="/settings" className="text-primary font-semibold hover:underline flex items-center gap-0.5">
                Preferences <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent DTR Shifts */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Work Shifts</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Latest shifts recorded with snapshot lunch deductions
                </CardDescription>
              </div>
              <Link href="/dtr" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {recentShifts.length > 0 ? (
              <div className="divide-y divide-border/60 border rounded-xl overflow-hidden bg-background/50">
                {recentShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {formatDateDisplay(shift.workDate)}
                        </span>
                        {shift.lunchMinutesApplied > 0 && (
                          <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                            -{shift.lunchMinutesApplied}m lunch
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {shift.formattedTime}
                      </p>
                      {shift.note && (
                        <p className="text-xs italic text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                          &ldquo;{shift.note}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-primary font-mono">
                        {shift.formattedDuration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 bg-background/40 p-8 text-center my-auto">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No shifts recorded yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Log your daily time record to track total weekly hours and target progress.
                </p>
                <Link href="/dtr" className="inline-block mt-4">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <PlusCircle className="h-4 w-4" />
                    <span>Log First Shift</span>
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Expenses</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Latest tracked spending across your weekly budget
                </CardDescription>
              </div>
              <Link href="/budget" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {recentExpenses.length > 0 ? (
              <div className="divide-y divide-border/60 border rounded-xl overflow-hidden bg-background/50">
                {recentExpenses.map((exp) => {
                  const style = CATEGORY_STYLES[exp.category] ?? CATEGORY_STYLES.OTHER;
                  return (
                    <div
                      key={exp.id}
                      className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {formatDateDisplay(exp.spentOn)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {style.label}
                          </span>
                        </div>
                        {exp.note ? (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                            {exp.note}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            No note
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-foreground font-mono">
                          {exp.formattedAmount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 bg-background/40 p-8 text-center my-auto">
                <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No expenses logged yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Add your daily expenses to monitor remaining allowance and safe spending rates.
                </p>
                <Link href="/budget" className="inline-block mt-4">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <PlusCircle className="h-4 w-4" />
                    <span>Add First Expense</span>
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
