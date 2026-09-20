import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm, getUserSettings } from "@/features/settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings(user.id);

  const initialSettings = settings ?? {
    userId: user.id,
    lunchDeductionEnabled: true,
    lunchBreakMinutes: 60,
    currency: "PHP",
  };

  return <SettingsForm initialSettings={initialSettings} />;
}
