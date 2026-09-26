"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  settingsSchema,
  profileSchema,
  targetHoursSchema,
  type SettingsInput,
  type ProfileInput,
  type TargetHoursInput,
} from "../schemas";
import {
  updateUserSettings,
  updateUserProfile,
  updateRenderedHoursTarget,
} from "../services/settings-service";
import { ensureProfileAndSettings } from "@/lib/profile-bootstrap";
import { getSafeServerActionError } from "@/lib/server-action-error";
import type {
  SettingsActionResponse,
  UserSettingsData,
  UserProfileData,
} from "../types";

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
      currency: result.data.currency,
      renderedHoursTarget: result.data.renderedHoursTarget,
    });

    revalidatePath("/dashboard");
    revalidatePath("/budget");
    revalidatePath("/dtr");
    revalidatePath("/calendar");

    return {
      ok: true,
      data: updated,
    };
  } catch (error) {
    return {
      ok: false,
      error: getSafeServerActionError(
        error,
        "update settings",
        "We couldn't update your settings. Please try again."
      ),
    };
  }
}

export async function updateProfileAction(
  rawInput: ProfileInput
): Promise<SettingsActionResponse<UserProfileData>> {
  const result = profileSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Invalid profile data provided.",
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
      error: "You must be signed in to update your profile.",
    };
  }

  try {
    await ensureProfileAndSettings({ userId: user.id, email: user.email ?? "" });
    const updated = await updateUserProfile({
      userId: user.id,
      name: result.data.name,
      avatar: result.data.avatar,
    });

    revalidatePath("/", "layout");

    return {
      ok: true,
      data: updated,
    };
  } catch (error) {
    return {
      ok: false,
      error: getSafeServerActionError(
        error,
        "update profile",
        "We couldn't update your profile. Please try again."
      ),
    };
  }
}

export async function updateRenderedHoursTargetAction(
  rawInput: TargetHoursInput
): Promise<SettingsActionResponse<{ targetHours: number }>> {
  const result = targetHoursSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Target hours must be a positive integer greater than 0.",
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
      error: "You must be signed in to set your target hours.",
    };
  }

  try {
    await ensureProfileAndSettings({ userId: user.id, email: user.email ?? "" });
    const updated = await updateRenderedHoursTarget({
      userId: user.id,
      renderedHoursTarget: result.data.renderedHoursTarget,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dtr");
    revalidatePath("/calendar");

    return {
      ok: true,
      data: { targetHours: updated.renderedHoursTarget ?? result.data.renderedHoursTarget },
    };
  } catch (error) {
    return {
      ok: false,
      error: getSafeServerActionError(
        error,
        "update target hours",
        "We couldn't save your target hours. Please try again."
      ),
    };
  }
}
