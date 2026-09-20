import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";
import {
  getTodayDateString,
  getMondayOfWeek,
  parseISODate,
  addWeeks,
  formatDateToISO,
  isValidDateString,
} from "@/lib/date";
import {
  BudgetView,
  getExpensesForRange,
  getWeeklyAllowance,
  type ExpenseData,
  type WeeklyAllowanceData,
} from "@/features/budget";
import { getUserSettings } from "@/features/settings";

interface BudgetPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const todayStr = getTodayDateString();
  const weekParam = resolvedParams.week;
  const activeMonday =
    weekParam && isValidDateString(weekParam)
      ? getMondayOfWeek(weekParam)
      : getMondayOfWeek(todayStr);

  const mondayDate = parseISODate(activeMonday);
  const rangeStart = parseISODate(addWeeks(activeMonday, -4));
  const rangeEnd = parseISODate(addWeeks(activeMonday, 5));

  // Preload settings, allowance, and expenses in parallel
  const [settings, rawAllowance, rawExpenses] = await Promise.all([
    getUserSettings(user.id),
    getWeeklyAllowance({
      userId: user.id,
      weekStart: mondayDate,
    }),
    getExpensesForRange({
      userId: user.id,
      startDate: rangeStart,
      endDate: rangeEnd,
    }),
  ]);

  const currency = settings?.currency ?? "PHP";

  const serializedAllowance: WeeklyAllowanceData | null = rawAllowance
    ? {
        id: rawAllowance.id,
        userId: rawAllowance.userId,
        weekStart: formatDateToISO(rawAllowance.weekStart),
        amountMinor: rawAllowance.amountMinor,
        isInherited: rawAllowance.isInherited,
      }
    : null;

  const serializedExpenses: ExpenseData[] = rawExpenses.map((e) => ({
    id: e.id,
    userId: e.userId,
    spentOn: formatDateToISO(e.spentOn),
    category: e.category,
    amountMinor: e.amountMinor,
    note: e.note,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));

  return (
    <BudgetView
      initialExpenses={serializedExpenses}
      initialAllowance={serializedAllowance}
      currency={currency}
      initialWeekMonday={activeMonday}
    />
  );
}
