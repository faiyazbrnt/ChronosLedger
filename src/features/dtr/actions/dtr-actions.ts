"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseISODate, formatDateToISO } from "@/lib/date";
import {
  dtrEntrySchema,
  deleteDtrEntrySchema,
  type DtrEntryInput,
} from "../schemas";
import {
  saveDtrEntryWithSnapshot,
  deleteDtrEntry,
} from "../services/dtr-service";
import type { DtrActionResponse, DtrEntryData } from "../types";

export async function saveDtrEntryAction(
  rawInput: DtrEntryInput
): Promise<DtrActionResponse<DtrEntryData>> {
  const result = dtrEntrySchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Please correct the form inputs.",
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
      error: "You must be signed in to record daily hours.",
    };
  }

  try {
    const workDate = parseISODate(result.data.workDate);

    const saved = await saveDtrEntryWithSnapshot({
      userId: user.id,
      workDate,
      timeInMinutes: result.data.timeInMinutes,
      timeOutMinutes: result.data.timeOutMinutes,
      note: result.data.note?.trim() || null,
    });

    revalidatePath("/dtr");
    revalidatePath("/dashboard");

    const serialized: DtrEntryData = {
      id: saved.id,
      userId: saved.userId,
      workDate: formatDateToISO(saved.workDate),
      timeInMinutes: saved.timeInMinutes,
      timeOutMinutes: saved.timeOutMinutes,
      lunchMinutesApplied: saved.lunchMinutesApplied,
      note: saved.note,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };

    return {
      ok: true,
      data: serialized,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save DTR entry.",
    };
  }
}

export async function deleteDtrEntryAction(
  entryId: string
): Promise<DtrActionResponse> {
  const result = deleteDtrEntrySchema.safeParse({ id: entryId });
  if (!result.success) {
    return {
      ok: false,
      error: "Invalid entry ID.",
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
      error: "You must be signed in to delete an entry.",
    };
  }

  try {
    await deleteDtrEntry({
      id: result.data.id,
      userId: user.id,
    });

    revalidatePath("/dtr");
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to delete DTR entry.",
    };
  }
}
