import type {
  WeeklyDtrSummary,
  WeeklyBudgetSummary,
  DashboardBudgetStatus,
} from "../types";

export function calculateWeeklyDtrSummary(
  entries: Array<{
    timeInMinutes: number;
    timeOutMinutes: number;
    lunchMinutesApplied: number;
  }>,
  targetHours = 40
): WeeklyDtrSummary {
  const totalMinutesWorked = entries.reduce((total, entry) => {
    const raw = entry.timeOutMinutes - entry.timeInMinutes;
    if (raw <= 0) return total;
    const net = Math.max(0, raw - entry.lunchMinutesApplied);
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
    daysWorked: entries.length,
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
