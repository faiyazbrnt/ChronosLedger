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
import { DtrView, getDtrEntriesForWeek, type DtrEntryData } from "@/features/dtr";
import { getUserSettings } from "@/features/settings";

interface DtrPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function DtrPage({ searchParams }: DtrPageProps) {
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

  // Preload settings and entries in parallel (spanning 4 weeks before and after for smooth navigation)
  const rangeStart = parseISODate(addWeeks(activeMonday, -4));
  const rangeEnd = parseISODate(addWeeks(activeMonday, 5));

  const [settings, rawEntries] = await Promise.all([
    getUserSettings(user.id),
    getDtrEntriesForWeek({
      userId: user.id,
      startDate: rangeStart,
      endDate: rangeEnd,
    }),
  ]);

  const serializedEntries: DtrEntryData[] = rawEntries.map((e) => ({
    id: e.id,
    userId: e.userId,
    workDate: formatDateToISO(e.workDate),
    timeInMinutes: e.timeInMinutes,
    timeOutMinutes: e.timeOutMinutes,
    lunchMinutesApplied: e.lunchMinutesApplied,
    note: e.note,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));

  return (
    <DtrView
      initialEntries={serializedEntries}
      initialSettings={settings}
      initialWeekMonday={activeMonday}
    />
  );
}
