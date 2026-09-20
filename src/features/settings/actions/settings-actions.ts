"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema, type SettingsInput } from "../schemas";
import { updateUserSettings } from "../services/settings-service";
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

  if (authError || !user) {
    return {
      ok: false,
      error: "You must be signed in to save settings.",
    };
  }

  try {
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
      error:
        error instanceof Error ? error.message : "Failed to update settings.",
    };
  }
}
