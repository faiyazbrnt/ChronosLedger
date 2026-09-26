"use client";

import React, { useState } from "react";
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
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  Target,
  Edit3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotify } from "@/components/ui";
import { formatMinorUnits } from "@/lib/money";
import { formatDateDisplay } from "@/lib/date";
import { RenderedHoursModal } from "./rendered-hours-modal";
import type { DashboardData, DashboardExpenseCategory, RenderedHoursSummary } from "../types";

const CATEGORY_STYLES: Record<
  DashboardExpenseCategory,
  { label: string; bg: string; text: string; border: string }
> = {
  FOOD: {
    label: "Food & Dining",
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/30",
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
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/30",
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
  updateTargetAction?: (input: { renderedHoursTarget: number }) => Promise<{
    ok: boolean;
    error?: string;
    data?: { targetHours: number };
  }>;
}

export function DashboardView({ data, updateTargetAction }: DashboardViewProps) {
  const { user, settings, currentWeek, weeklyBudget, recentShifts, recentExpenses } = data;
  const currency = settings.currency;
  const notify = useNotify();

  const [renderedHours, setRenderedHours] = useState<RenderedHoursSummary>(data.renderedHours);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);

  const isOverBudget = weeklyBudget.status === "OVER_BUDGET";
  const isNearLimit = weeklyBudget.status === "NEAR_LIMIT";
  const userDisplayName = user.email ? user.email.split("@")[0] : "there";

  const budgetCardTitle =
    weeklyBudget.cycleType === "MONTHLY"
      ? "Monthly Allowance"
      : weeklyBudget.cycleType === "SEMI_MONTHLY"
      ? "15-Day Allowance"
      : "Weekly Allowance";

  async function handleSaveTarget(newTarget: number) {
    if (!updateTargetAction) {
      return { ok: false, error: "Action not available." };
    }
    const res = await updateTargetAction({ renderedHoursTarget: newTarget });
    return res;
  }

  function handleTargetSavedSuccess(newTarget: number) {
    const totalMinutes = renderedHours.totalWorkedMinutes;
    const targetMinutes = newTarget * 60;
    const percentTarget =
      targetMinutes > 0
        ? Math.min(100, Math.round((totalMinutes / targetMinutes) * 100))
        : 0;

    setRenderedHours((prev) => ({
      ...prev,
      targetHours: newTarget,
      hasTarget: true,
      percentTarget,
    }));

    notify.success(`Training target updated to ${newTarget} hours. Shift logging is now unblocked!`);
  }

  function handleLogShiftClick(e: React.MouseEvent) {
    if (!renderedHours.hasTarget) {
      e.preventDefault();
      notify.info("Please configure your required rendered hours target before logging a shift.");
      setIsTargetModalOpen(true);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Target Modal */}
      <RenderedHoursModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        currentTarget={renderedHours.targetHours}
        onSave={handleSaveTarget}
        onSuccess={handleTargetSavedSuccess}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Dashboard
            </h1>
            <Badge variant="outline" className="gap-1 font-mono text-xs border-primary/30">
              <Calendar className="h-3 w-3 text-primary" />
              {currentWeek.displayLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{userDisplayName}</span>. Here is your overview.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link href="/dtr" onClick={handleLogShiftClick}>
            <Button
              variant={renderedHours.hasTarget ? "outline" : "secondary"}
              size="sm"
              className={`gap-1.5 focus-visible:ring-2 focus-visible:ring-primary ${
                !renderedHours.hasTarget ? "opacity-90 hover:opacity-100 border-amber-500/40 text-amber-900 dark:text-amber-200" : ""
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Log Shift</span>
              {!renderedHours.hasTarget && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300 ml-1">
                  Target Required
                </Badge>
              )}
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

      {/* Hard Gate Prompt: Target Hours Unset Alert Banner */}
      {!renderedHours.hasTarget && (
        <div
          role="alert"
          aria-live="polite"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Rendered Hours Target Required</h2>
              <p className="text-xs opacity-90 mt-0.5">
                Before you can log work shifts, you must set your total required training hours (e.g. 300 hrs). Your progress will be tracked continuously.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setIsTargetModalOpen(true)}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-none shadow-sm gap-1.5"
          >
            <Target className="h-3.5 w-3.5" />
            <span>Set Target Now</span>
          </Button>
        </div>
      )}

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
              <h2 className="text-sm font-bold">Over {budgetCardTitle}</h2>
              <p className="text-xs opacity-90">
                You have exceeded this cycle&apos;s allowance by{" "}
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
          className="flex items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-warning/40 bg-warning/10 text-warning"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20 text-warning">
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
            <Button variant="outline" size="sm" className="shrink-0 border-warning/40 hover:bg-warning/20 text-warning">
              View Budget
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Rendered Hours KPI Card (OJT Progress Tracking) */}
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Rendered Hours (OJT)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black tracking-tight text-foreground">
                {renderedHours.formattedTotalHours}
                {renderedHours.hasTarget && (
                  <span className="text-lg font-bold text-muted-foreground ml-1">
                    / {renderedHours.targetHours}h
                  </span>
                )}
              </div>
              {renderedHours.hasTarget ? (
                <span className="text-xs font-mono font-bold text-primary">
                  {renderedHours.percentTarget}%
                </span>
              ) : (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/40">
                  Target Unset
                </Badge>
              )}
            </div>

            {/* Target Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {renderedHours.hasTarget
                    ? `Target: ${renderedHours.targetHours} hrs total`
                    : "No target set"}
                </span>
                <span className="font-semibold text-foreground">
                  {renderedHours.hasTarget
                    ? `${renderedHours.decimalTotalHours} hrs rendered`
                    : "Logging locked"}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, renderedHours.percentTarget)}%` }}
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Continuous running total
              </span>
              <button
                type="button"
                onClick={() => setIsTargetModalOpen(true)}
                className="text-primary hover:text-primary/80 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="h-3 w-3" />
                <span>{renderedHours.hasTarget ? "Edit target" : "Set target"}</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Remaining Allowance Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              {budgetCardTitle}
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
                    ? "text-warning"
                    : "text-primary"
                }`}
              >
                {formatMinorUnits(weeklyBudget.remainingMinor, currency)}
              </div>
              {weeklyBudget.cycleLabel ? (
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30">
                  {weeklyBudget.cycleLabel}
                </Badge>
              ) : weeklyBudget.isInherited ? (
                <Badge variant="secondary" className="text-[10px] font-mono">
                  Inherited
                </Badge>
              ) : null}
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
                      ? "bg-warning"
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
              <Link href="/budget" className="text-link font-semibold hover:underline flex items-center gap-0.5">
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
              {/* Training Target Status */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-xs text-muted-foreground">Training Target</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  {renderedHours.hasTarget ? (
                    <span>{renderedHours.targetHours} hrs required</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">Target Unset</span>
                  )}
                </div>
              </div>

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
                      <AlertCircle className="h-3.5 w-3.5 text-warning" />
                      <span className="text-xs font-bold text-warning">Near Limit</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs font-bold text-success">On Track</span>
                    </>
                  )}
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
              <Link href="/dtr" className="text-link font-semibold hover:underline flex items-center gap-0.5">
                Timesheet <ChevronRight className="h-3 w-3" />
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
                  Latest shifts recorded toward your rendered hours target
                </CardDescription>
              </div>
              <Link href="/dtr" className="text-xs font-semibold text-link hover:underline flex items-center gap-0.5">
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
                        {shift.timeOutMinutes === null ? (
                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                            In Progress
                          </Badge>
                        ) : shift.lunchMinutesApplied > 0 ? (
                          <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                            -{shift.lunchMinutesApplied}m snapshot
                          </Badge>
                        ) : null}
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
                  Log your daily time record to build your running rendered-hours total.
                </p>
                <Link href="/dtr" onClick={handleLogShiftClick} className="inline-block mt-4">
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
                  Latest tracked spending across your budget cycle
                </CardDescription>
              </div>
              <Link href="/budget" className="text-xs font-semibold text-link hover:underline flex items-center gap-0.5">
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
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {style.label}
                          </span>
                        </div>
                        {exp.note && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                            {exp.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-foreground">
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
                <p className="text-sm font-semibold text-foreground">No expenses logged</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Track your daily expenses to monitor allowance health and spending rates.
                </p>
                <Link href="/budget" className="inline-block mt-4">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <PlusCircle className="h-4 w-4" />
                    <span>Log First Expense</span>
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
