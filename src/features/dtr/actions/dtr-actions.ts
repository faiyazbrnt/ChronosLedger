"use server";

import { dtrEntrySchema, type DtrEntryInput } from "../schemas";
import type { DtrActionResponse } from "../types";

export async function saveDtrEntryAction(
  rawInput: DtrEntryInput
): Promise<DtrActionResponse> {
  const result = dtrEntrySchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  // Implementation wired in Phase 5
  return { ok: true };
}

export async function deleteDtrEntryAction(
  entryId: string
): Promise<DtrActionResponse> {
  if (!entryId) {
    return { ok: false, error: "Entry ID is required" };
  }

  // Implementation wired in Phase 5
  return { ok: true };
}
