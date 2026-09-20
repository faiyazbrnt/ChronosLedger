"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseISODate, formatDateToISO } from "@/lib/date";
import {
  expenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
  allowanceSchema,
  type ExpenseInput,
  type UpdateExpenseInput,
  type AllowanceInput,
} from "../schemas";
import {
  createExpense,
  updateExpense,
  deleteExpense,
  upsertWeeklyAllowance,
} from "../services/budget-service";
import type {
  BudgetActionResponse,
  ExpenseData,
  WeeklyAllowanceData,
} from "../types";

export async function createExpenseAction(
  rawInput: ExpenseInput
): Promise<BudgetActionResponse<ExpenseData>> {
  const result = expenseSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Please correct the expense fields.",
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
      error: "You must be signed in to log an expense.",
    };
  }

  try {
    const spentOn = parseISODate(result.data.spentOn);
    const created = await createExpense({
      userId: user.id,
      spentOn,
      category: result.data.category,
      amountMinor: result.data.amountMinor,
      note: result.data.note?.trim() || null,
    });

    revalidatePath("/budget");
    revalidatePath("/dashboard");

    const serialized: ExpenseData = {
      id: created.id,
      userId: created.userId,
      spentOn: formatDateToISO(created.spentOn),
      category: created.category,
      amountMinor: created.amountMinor,
      note: created.note,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    return {
      ok: true,
      data: serialized,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to record expense.",
    };
  }
}

export async function updateExpenseAction(
  rawInput: UpdateExpenseInput
): Promise<BudgetActionResponse> {
  const result = updateExpenseSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Please correct the expense fields.",
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
      error: "You must be signed in to update an expense.",
    };
  }

  try {
    const spentOn = parseISODate(result.data.spentOn);
    await updateExpense({
      id: result.data.id,
      userId: user.id,
      spentOn,
      category: result.data.category,
      amountMinor: result.data.amountMinor,
      note: result.data.note?.trim() || null,
    });

    revalidatePath("/budget");
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update expense.",
    };
  }
}

export async function deleteExpenseAction(
  expenseId: string
): Promise<BudgetActionResponse> {
  const result = deleteExpenseSchema.safeParse({ id: expenseId });
  if (!result.success) {
    return {
      ok: false,
      error: "Invalid expense ID.",
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
      error: "You must be signed in to delete an expense.",
    };
  }

  try {
    await deleteExpense({
      id: result.data.id,
      userId: user.id,
    });

    revalidatePath("/budget");
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete expense.",
    };
  }
}

export async function setAllowanceAction(
  rawInput: AllowanceInput
): Promise<BudgetActionResponse<WeeklyAllowanceData>> {
  const result = allowanceSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Please enter a valid allowance amount.",
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
      error: "You must be signed in to configure your allowance.",
    };
  }

  try {
    const weekStart = parseISODate(result.data.weekStart);
    const updated = await upsertWeeklyAllowance({
      userId: user.id,
      weekStart,
      amountMinor: result.data.amountMinor,
    });

    revalidatePath("/budget");
    revalidatePath("/dashboard");

    const serialized: WeeklyAllowanceData = {
      id: updated.id,
      userId: updated.userId,
      weekStart: formatDateToISO(updated.weekStart),
      amountMinor: updated.amountMinor,
      isInherited: false,
    };

    return {
      ok: true,
      data: serialized,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to save allowance.",
    };
  }
}
