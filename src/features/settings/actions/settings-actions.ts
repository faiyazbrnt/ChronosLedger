"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema, type SettingsInput } from "../schemas";
import { updateUserSettings } from "../services/settings-service";
import { ensureProfileAndSettings } from "@/lib/profile-bootstrap";
import { getSafeServerActionError } from "@/lib/server-action-error";
import type { SettingsActionResponse, UserSettingsData } from "../types";

export async function updateSettingsAction(
  rawInput: SettingsInput
): Promise<SettingsActionResponse<UserSettingsData>> {
  const result = settingsSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Please correct the errors in the form.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return {
      ok: false,
      error: "You must be signed in to save settings.",
    };
  }

  try {
    await ensureProfileAndSettings({ userId: user.id, email: user.email ?? "" });
    const updated = await updateUserSettings({
      userId: user.id,
      lunchDeductionEnabled: result.data.lunchDeductionEnabled,
      lunchBreakMinutes: result.data.lunchBreakMinutes,
      currency: result.data.currency,
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/budget");
    revalidatePath("/dtr");

    return {
      ok: true,
      data: updated,
    };
  } catch (error) {
    return {
      ok: false,
      error: getSafeServerActionError(error, "update settings", "We couldn't update your settings. Please try again."),
    };
  }
}
