"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseISODate, formatDateToISO } from "@/lib/date";
import { recordActivity } from "@/lib/activity";
import { ensureProfileAndSettings } from "@/lib/profile-bootstrap";
import { getSafeServerActionError } from "@/lib/server-action-error";
import {
  dtrEntrySchema,
  activityReportSchema,
  deleteDtrEntrySchema,
  type DtrEntryInput,
  type ActivityReportInput,
} from "../schemas";
import {
  saveDtrEntryWithSnapshot,
  saveActivityReport,
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

  if (authError || !user || !user.email) {
    return {
      ok: false,
      error: "You must be signed in to record daily hours.",
    };
  }

  try {
    const workDate = parseISODate(result.data.workDate);

    let savedResult: Awaited<ReturnType<typeof saveDtrEntryWithSnapshot>>;
    try {
      savedResult = await saveDtrEntryWithSnapshot({
        userId: user.id,
        workDate,
        timeInMinutes: result.data.timeInMinutes,
        timeOutMinutes: result.data.timeOutMinutes ?? null,
        breaks: result.data.breaks,
        note: result.data.note?.trim() || null,
        activity: result.data.activity,
        activityDescription: result.data.activityDescription,
        remarks: result.data.remarks,
      });
    } catch (saveErr: unknown) {
      // Safe fallback: if profile/settings record was missing, bootstrap and retry once
      const errMsg = saveErr instanceof Error ? saveErr.message : String(saveErr);
      if (
        !errMsg.includes("target on the Dashboard") &&
        (errMsg.includes("Foreign key") || errMsg.includes("Record to update not found") || errMsg.includes("does not exist"))
      ) {
        await ensureProfileAndSettings({ userId: user.id, email: user.email ?? "" });
        savedResult = await saveDtrEntryWithSnapshot({
          userId: user.id,
          workDate,
          timeInMinutes: result.data.timeInMinutes,
          timeOutMinutes: result.data.timeOutMinutes ?? null,
          breaks: result.data.breaks,
          note: result.data.note?.trim() || null,
          activity: result.data.activity,
          activityDescription: result.data.activityDescription,
          remarks: result.data.remarks,
        });
      } else {
        throw saveErr;
      }
    }

    const { entry: saved, wasCreated } = savedResult;

    // Asynchronously record activity without blocking response delivery
    void recordActivity(
      user.id,
      `${wasCreated ? "Shift logged" : "Shift updated"}: ${result.data.workDate}`,
      "shift"
    ).catch(() => {});

    // Revalidate the active DTR route
    revalidatePath("/dtr");

    const serialized: DtrEntryData = {
      id: saved.id,
      userId: saved.userId,
      workDate: formatDateToISO(saved.workDate),
      timeInMinutes: saved.timeInMinutes,
      timeOutMinutes: saved.timeOutMinutes,
      lunchMinutesApplied: saved.lunchMinutesApplied,
      breaks: saved.breaks?.map((b) => ({
        id: b.id,
        category: b.category,
        durationMinutes: b.durationMinutes,
      })),
      note: saved.note,
      activity: saved.activity,
      activityDescription: saved.activityDescription,
      remarks: saved.remarks,
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
      error: getSafeServerActionError(
        error,
        "save DTR entry",
        "We couldn't save the shift. Please try again."
      ),
    };
  }
}

export async function saveDailyActivityReportAction(
  rawInput: ActivityReportInput
): Promise<DtrActionResponse> {
  const result = activityReportSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Please correct the report inputs.",
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
      error: "You must be signed in to save an activity report.",
    };
  }

  try {
    await saveActivityReport({
      id: result.data.id,
      userId: user.id,
      activity: result.data.activity?.trim() || null,
      activityDescription: result.data.activityDescription?.trim() || null,
      remarks: result.data.remarks?.trim() || null,
    });

    void recordActivity(user.id, "Activity report updated", "shift").catch(() => {});

    revalidatePath("/calendar");
    revalidatePath("/dtr");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: getSafeServerActionError(
        error,
        "save activity report",
        "We couldn't save your daily activity report. Please try again."
      ),
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
    void recordActivity(user.id, "Shift deleted", "shift").catch(() => {});

    revalidatePath("/dtr");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: getSafeServerActionError(
        error,
        "delete DTR entry",
        "We couldn't delete the shift. Please try again."
      ),
    };
  }
}
