import type {
  WeeklyDtrSummary,
  WeeklyBudgetSummary,
  RenderedHoursSummary,
  DashboardBudgetStatus,
} from "../types";

export interface ShiftCalculationItem {
  timeInMinutes: number;
  timeOutMinutes: number | null;
  lunchMinutesApplied: number;
  breaks?: Array<{ durationMinutes: number }>;
}

export function calculateRenderedHoursSummary(
  entries: ShiftCalculationItem[],
  targetHours: number | null
): RenderedHoursSummary {
  const totalWorkedMinutes = entries.reduce((total, entry) => {
    if (entry.timeOutMinutes === null) return total;
    const raw = entry.timeOutMinutes - entry.timeInMinutes;
    if (raw <= 0) return total;

    let breakDeduction = 0;
    if (entry.breaks && entry.breaks.length > 0) {
      breakDeduction = entry.breaks.reduce((sum, b) => sum + b.durationMinutes, 0);
    } else {
      breakDeduction = entry.lunchMinutesApplied;
    }

    const net = Math.max(0, raw - breakDeduction);
    return total + net;
  }, 0);

  const hours = Math.floor(totalWorkedMinutes / 60);
  const minutes = totalWorkedMinutes % 60;
  const formattedTotalHours = `${hours}h ${String(minutes).padStart(2, "0")}m`;
  const decimalTotalHours = (totalWorkedMinutes / 60).toFixed(2);

  const hasTarget = typeof targetHours === "number" && targetHours > 0;
  const targetMinutes = hasTarget ? targetHours * 60 : 0;
  const percentTarget =
    targetMinutes > 0
      ? Math.min(100, Math.round((totalWorkedMinutes / targetMinutes) * 100))
      : 0;

  return {
    totalWorkedMinutes,
    formattedTotalHours,
    decimalTotalHours,
    targetHours,
    percentTarget,
    hasTarget,
  };
}

export function calculateWeeklyDtrSummary(
  entries: ShiftCalculationItem[],
  targetHours = 40
): WeeklyDtrSummary {
  const totalMinutesWorked = entries.reduce((total, entry) => {
    if (entry.timeOutMinutes === null) return total;
    const raw = entry.timeOutMinutes - entry.timeInMinutes;
    if (raw <= 0) return total;

    let breakDeduction = 0;
    if (entry.breaks && entry.breaks.length > 0) {
      breakDeduction = entry.breaks.reduce((sum, b) => sum + b.durationMinutes, 0);
    } else {
      breakDeduction = entry.lunchMinutesApplied;
    }

    const net = Math.max(0, raw - breakDeduction);
    return total + net;
  }, 0);

  const hours = Math.floor(totalMinutesWorked / 60);
  const minutes = totalMinutesWorked % 60;
  const formattedHours = `${hours}h ${String(minutes).padStart(2, "0")}m`;
  const decimalHours = (totalMinutesWorked / 60).toFixed(2);

  const targetMinutes = targetHours * 60;
  const percentTarget =
    targetMinutes > 0
      ? Math.min(100, Math.round((totalMinutesWorked / targetMinutes) * 100))
      : 0;

  return {
    totalMinutesWorked,
    formattedHours,
    decimalHours,
    daysWorked: entries.filter((e) => e.timeOutMinutes !== null).length,
    targetHours,
    percentTarget,
  };
}

export function calculateWeeklyBudgetSummary(
  allowanceMinor: number,
  expenses: Array<{ amountMinor: number }>,
  daysRemainingInWeek = 7,
  isInherited = false
): WeeklyBudgetSummary {
  const totalSpentMinor = expenses.reduce(
    (total, exp) => total + exp.amountMinor,
    0
  );
  const remainingMinor = allowanceMinor - totalSpentMinor;

  const effectiveDays = Math.max(1, daysRemainingInWeek);
  const safeToSpendPerDayMinor =
    remainingMinor > 0 ? Math.floor(remainingMinor / effectiveDays) : 0;

  let percentUsed = 0;
  if (allowanceMinor > 0) {
    percentUsed = Math.round((totalSpentMinor / allowanceMinor) * 100);
  } else if (totalSpentMinor > 0) {
    percentUsed = 100;
  }

  let status: DashboardBudgetStatus = "ON_TRACK";
  if (allowanceMinor > 0 && totalSpentMinor > allowanceMinor) {
    status = "OVER_BUDGET";
  } else if (allowanceMinor > 0 && percentUsed >= 75) {
    status = "NEAR_LIMIT";
  }

  return {
    allowanceMinor,
    totalSpentMinor,
    remainingMinor,
    safeToSpendPerDayMinor,
    percentUsed,
    status,
    isInherited,
  };
}
