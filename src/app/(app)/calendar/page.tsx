import { redirect } from "next/navigation";
import { CalendarView, type CalendarEntry } from "@/features/calendar";
import { getDtrEntriesForMonth, saveDailyActivityReportAction } from "@/features/dtr";
import { getAuthUser } from "@/lib/supabase/server";
import { formatDateToISO } from "@/lib/date";

export default async function CalendarPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const rawEntries = await getDtrEntriesForMonth({
    userId: user.id,
    startDate: new Date("2025-01-01T00:00:00Z"),
    endDate: new Date("2027-12-31T23:59:59Z"),
  });

  const serializedEntries: CalendarEntry[] = rawEntries.map((entry) => ({
    id: entry.id,
    workDate: formatDateToISO(entry.workDate),
    timeInMinutes: entry.timeInMinutes,
    timeOutMinutes: entry.timeOutMinutes,
    lunchMinutesApplied: entry.lunchMinutesApplied,
    note: entry.note,
    activity: entry.activity,
    activityDescription: entry.activityDescription,
    remarks: entry.remarks,
    breaks: entry.breaks?.map((b) => ({
      category: b.category,
      durationMinutes: b.durationMinutes,
    })),
  }));

  return (
    <CalendarView
      initialEntries={serializedEntries}
      saveActivityReportAction={saveDailyActivityReportAction}
    />
  );
}
