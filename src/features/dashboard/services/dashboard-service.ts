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
import { getCyclePeriod } from "@/lib/cycle";
import {
  calculateWeeklyDtrSummary,
  calculateWeeklyBudgetSummary,
  calculateRenderedHoursSummary,
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
    budgetConfig,
    weekDtrEntries,
    allDtrEntries,
    exactAllowance,
    historicalAllowance,
    weekExpenses,
    recentDtrEntries,
    recentExpenseEntries,
  ] = await Promise.all([
    prisma.profile.findUnique({ where: { id: userId } }),
    prisma.settings.findUnique({ where: { userId } }),
    prisma.budgetConfig.findUnique({ where: { userId } }),
    prisma.dtrEntry.findMany({
      where: {
        userId,
        workDate: {
          gte: mondayDate,
          lte: sundayDate,
        },
      },
      include: { breaks: true },
      orderBy: { workDate: "asc" },
    }),
    prisma.dtrEntry.findMany({
      where: { userId },
      include: { breaks: true },
      orderBy: { workDate: "desc" },
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
      include: { breaks: true },
      orderBy: [{ workDate: "desc" }, { createdAt: "desc" }],
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

  const currency = settings?.currency ?? "PHP";
  const renderedHoursTarget = settings?.renderedHoursTarget ?? null;

  // Rendered Hours (OJT running total across all shifts)
  const renderedHours = calculateRenderedHoursSummary(allDtrEntries, renderedHoursTarget);

  // Weekly DTR summary
  const weeklyDtr = calculateWeeklyDtrSummary(weekDtrEntries);

  // Cycle & Budget calculation
  let allowanceMinor = 0;
  let isInherited = false;
  let cycleType: "WEEKLY" | "MONTHLY" | "SEMI_MONTHLY" = "WEEKLY";
  let cycleLabel: string | undefined = undefined;
  let activeExpenses = weekExpenses;
  let daysRemainingInCycle = 7;

  if (budgetConfig) {
    cycleType = budgetConfig.cycleType;
    allowanceMinor = budgetConfig.amountMinor;
    const period = getCyclePeriod({
      targetDate: todayStr,
      cycleType: budgetConfig.cycleType,
      anchorDate: budgetConfig.anchorDate ? formatDateToISO(budgetConfig.anchorDate) : null,
    });
    cycleLabel = period.displayLabel;
    daysRemainingInCycle = period.daysRemaining;

    // Fetch expenses for the cycle if not weekly
    if (cycleType !== "WEEKLY") {
      activeExpenses = await prisma.expense.findMany({
        where: {
          userId,
          spentOn: {
            gte: parseISODate(period.startDate),
            lte: parseISODate(period.endDate),
          },
        },
        orderBy: [{ spentOn: "desc" }, { createdAt: "desc" }],
      });
    }
  } else {
    const allowanceRecord = exactAllowance ?? historicalAllowance;
    isInherited = !exactAllowance && Boolean(historicalAllowance);
    allowanceMinor = allowanceRecord?.amountMinor ?? 0;

    const now = new Date();
    const dayOfWeekMondayZero = (now.getDay() + 6) % 7;
    daysRemainingInCycle = Math.max(1, 7 - dayOfWeekMondayZero);
  }

  const weeklyBudget = {
    ...calculateWeeklyBudgetSummary(
      allowanceMinor,
      activeExpenses,
      daysRemainingInCycle,
      isInherited
    ),
    cycleType,
    cycleLabel,
  };

  const recentShifts: RecentShiftItem[] = recentDtrEntries.map((entry) => {
    let workedMinutes = 0;
    let formattedDuration = "In Progress";
    let formattedTime = `${formatMinutesToTimeString(entry.timeInMinutes)} – In Progress`;

    if (entry.timeOutMinutes !== null) {
      const raw = entry.timeOutMinutes - entry.timeInMinutes;
      let breakDeduction = 0;
      if (entry.breaks && entry.breaks.length > 0) {
        breakDeduction = entry.breaks.reduce((sum, b) => sum + b.durationMinutes, 0);
      } else {
        breakDeduction = entry.lunchMinutesApplied;
      }
      workedMinutes = Math.max(0, raw - breakDeduction);
      const hours = Math.floor(workedMinutes / 60);
      const mins = workedMinutes % 60;
      formattedDuration = `${hours}h ${String(mins).padStart(2, "0")}m`;
      formattedTime = `${formatMinutesToTimeString(entry.timeInMinutes)} – ${formatMinutesToTimeString(entry.timeOutMinutes)}`;
    }

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
      renderedHoursTarget,
    },
    currentWeek: {
      monday: mondayStr,
      sunday: sundayStr,
      displayLabel: `${formatDateDisplay(mondayStr)} – ${formatDateDisplay(sundayStr)}`,
    },
    renderedHours,
    weeklyDtr,
    weeklyBudget,
    recentShifts,
    recentExpenses,
  };
}
