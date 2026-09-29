import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";
import {
  getTodayDateString,
  getMondayOfWeek,
  formatDateToISO,
  isValidDateString,
} from "@/lib/date";
import { DtrView, getAllDtrEntries, type DtrEntryData } from "@/features/dtr";
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

  const [settings, rawEntries] = await Promise.all([
    getUserSettings(user.id),
    getAllDtrEntries(user.id),
  ]);

  const serializedEntries: DtrEntryData[] = rawEntries.map((e) => ({
    id: e.id,
    userId: e.userId,
    workDate: formatDateToISO(e.workDate),
    timeInMinutes: e.timeInMinutes,
    timeOutMinutes: e.timeOutMinutes,
    lunchMinutesApplied: e.lunchMinutesApplied,
    breaks: e.breaks?.map((b) => ({
      id: b.id,
      category: b.category,
      durationMinutes: b.durationMinutes,
    })),
    note: e.note,
    activity: e.activity,
    activityDescription: e.activityDescription,
    remarks: e.remarks,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));

  const hasRenderedHoursTarget = Boolean(
    settings?.renderedHoursTarget && settings.renderedHoursTarget > 0
  );

  return (
    <DtrView
      initialEntries={serializedEntries}
      initialSettings={settings}
      initialWeekMonday={activeMonday}
      hasRenderedHoursTarget={hasRenderedHoursTarget}
    />
  );
}
