import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";
import { DashboardView, getDashboardData } from "@/features/dashboard";
import { updateRenderedHoursTargetAction } from "@/features/settings";

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData(user.id);

  return (
    <DashboardView
      data={data}
      updateTargetAction={updateRenderedHoursTargetAction}
    />
  );
}
