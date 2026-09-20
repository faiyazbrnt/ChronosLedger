import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardView, getDashboardData } from "@/features/dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData(user.id);

  return <DashboardView data={data} />;
}
