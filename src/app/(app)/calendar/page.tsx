import { redirect } from "next/navigation";
import { CalendarView } from "@/features/calendar";
import { getDtrEntriesForMonth } from "@/features/dtr";
import { getAuthUser } from "@/lib/supabase/server";
import { formatDateToISO } from "@/lib/date";

export default async function CalendarPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  const entries = await getDtrEntriesForMonth({ userId: user.id, startDate: new Date("2026-01-01T00:00:00"), endDate: new Date("2027-12-31T23:59:59") });
  return <CalendarView initialEntries={entries.map((entry) => ({ ...entry, workDate: formatDateToISO(entry.workDate) }))} />;
}
