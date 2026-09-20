import "server-only";
import { prisma } from "@/lib/prisma";
import {
  getTodayDateString,
  getMondayOfWeek,
  getSundayOfWeek,
  parseISODate,
  formatDateToISO,
  formatDateDisplay,
  formatMinutesToTimeString,
} from "@/lib/date";
import { formatMinorUnits } from "@/lib/money";
import {
  calculateWeeklyDtrSummary,
  calculateWeeklyBudgetSummary,
} from "../lib/calc-dashboard";
import type {
  DashboardData,
  DashboardExpenseCategory,
  RecentShiftItem,
  RecentExpenseItem,
} from "../types";

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const todayStr = getTodayDateString();
  const mondayStr = getMondayOfWeek(todayStr);
  const sundayStr = getSundayOfWeek(todayStr);
  const mondayDate = parseISODate(mondayStr);
  const sundayDate = parseISODate(sundayStr);

  const [
    profile,
    settings,
    weekDtrEntries,
    exactAllowance,
    historicalAllowance,
    weekExpenses,
    recentDtrEntries,
    recentExpenseEntries,
  ] = await Promise.all([
    prisma.profile.findUnique({ where: { id: userId } }),
    prisma.settings.findUnique({ where: { userId } }),
    prisma.dtrEntry.findMany({
      where: {
        userId,
        workDate: {
          gte: mondayDate,
          lte: sundayDate,
        },
      },
      orderBy: {
        workDate: "asc",
      },
    }),
    prisma.weeklyAllowance.findUnique({
      where: {
        userId_weekStart: {
          userId,
          weekStart: mondayDate,
        },
      },
    }),
    prisma.weeklyAllowance.findFirst({
      where: {
        userId,
        weekStart: {
          lt: mondayDate,
        },
      },
      orderBy: {
        weekStart: "desc",
      },
    }),
    prisma.expense.findMany({
      where: {
        userId,
        spentOn: {
          gte: mondayDate,
          lte: sundayDate,
        },
      },
      orderBy: [
        { spentOn: "desc" },
        { createdAt: "desc" },
      ],
    }),
    prisma.dtrEntry.findMany({
      where: { userId },
      orderBy: { workDate: "desc" },
      take: 5,
    }),
    prisma.expense.findMany({
      where: { userId },
      orderBy: [
        { spentOn: "desc" },
        { createdAt: "desc" },
      ],
      take: 5,
    }),
  ]);

  const allowanceRecord = exactAllowance ?? historicalAllowance;
  const isInherited = !exactAllowance && Boolean(historicalAllowance);

  const currency = settings?.currency ?? "PHP";
  const allowanceMinor = allowanceRecord?.amountMinor ?? 0;

  // Calculate days remaining in week (Monday is day 0 of week -> 7 days remaining, Sunday is day 6 -> 1 day remaining)
  const now = new Date();
  const dayOfWeekMondayZero = (now.getDay() + 6) % 7; // Mon: 0, Tue: 1, ..., Sun: 6
  const daysRemainingInWeek = Math.max(1, 7 - dayOfWeekMondayZero);

  const weeklyDtr = calculateWeeklyDtrSummary(weekDtrEntries);
  const weeklyBudget = calculateWeeklyBudgetSummary(
    allowanceMinor,
    weekExpenses,
    daysRemainingInWeek,
    isInherited
  );

  const recentShifts: RecentShiftItem[] = recentDtrEntries.map((entry) => {
    const raw = entry.timeOutMinutes - entry.timeInMinutes;
    const workedMinutes = Math.max(0, raw - entry.lunchMinutesApplied);
    const hours = Math.floor(workedMinutes / 60);
    const mins = workedMinutes % 60;
    const formattedDuration = `${hours}h ${String(mins).padStart(2, "0")}m`;
    const formattedTime = `${formatMinutesToTimeString(entry.timeInMinutes)} – ${formatMinutesToTimeString(entry.timeOutMinutes)}`;
    const workDate = formatDateToISO(entry.workDate);

    return {
      id: entry.id,
      workDate,
      timeInMinutes: entry.timeInMinutes,
      timeOutMinutes: entry.timeOutMinutes,
      lunchMinutesApplied: entry.lunchMinutesApplied,
      workedMinutes,
      formattedTime,
      formattedDuration,
      note: entry.note,
    };
  });

  const recentExpenses: RecentExpenseItem[] = recentExpenseEntries.map((exp) => {
    const spentOn = formatDateToISO(exp.spentOn);
    return {
      id: exp.id,
      spentOn,
      category: exp.category as DashboardExpenseCategory,
      amountMinor: exp.amountMinor,
      formattedAmount: formatMinorUnits(exp.amountMinor, currency),
      note: exp.note,
    };
  });

  return {
    user: {
      email: profile?.email ?? "",
    },
    settings: {
      currency,
      lunchDeductionEnabled: settings?.lunchDeductionEnabled ?? true,
      lunchBreakMinutes: settings?.lunchBreakMinutes ?? 60,
    },
    currentWeek: {
      monday: mondayStr,
      sunday: sundayStr,
      displayLabel: `${formatDateDisplay(mondayStr)} – ${formatDateDisplay(sundayStr)}`,
    },
    weeklyDtr,
    weeklyBudget,
    recentShifts,
    recentExpenses,
  };
}
