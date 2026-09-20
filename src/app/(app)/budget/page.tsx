import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Preload user settings for currency preference
  const settings = await getUserSettings(user.id);
  const currency = settings?.currency ?? "PHP";

  // Preload weekly allowance (with historical fallback if not set)
  const mondayDate = parseISODate(activeMonday);
  const rawAllowance = await getWeeklyAllowance({
    userId: user.id,
    weekStart: mondayDate,
  });

  const serializedAllowance: WeeklyAllowanceData | null = rawAllowance
    ? {
        id: rawAllowance.id,
        userId: rawAllowance.userId,
        weekStart: formatDateToISO(rawAllowance.weekStart),
        amountMinor: rawAllowance.amountMinor,
        isInherited: rawAllowance.isInherited,
      }
    : null;

  // Preload expenses around the active week (spanning 4 weeks before and after for smooth navigation)
  const rangeStart = parseISODate(addWeeks(activeMonday, -4));
  const rangeEnd = parseISODate(addWeeks(activeMonday, 5));

  const rawExpenses = await getExpensesForRange({
    userId: user.id,
    startDate: rangeStart,
    endDate: rangeEnd,
  });

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
