"use server";

import { settingsSchema, type SettingsInput } from "../schemas";
import type { SettingsActionResponse } from "../types";

export async function updateSettingsAction(
  rawInput: SettingsInput
): Promise<SettingsActionResponse> {
  const result = settingsSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  // Implementation wired in Phase 4
  return { ok: true };
}
