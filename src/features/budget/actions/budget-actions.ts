"use server";

import { expenseSchema, allowanceSchema, type ExpenseInput, type AllowanceInput } from "../schemas";
import type { BudgetActionResponse } from "../types";

export async function createExpenseAction(
  rawInput: ExpenseInput
): Promise<BudgetActionResponse> {
  const result = expenseSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  // Implementation wired in Phase 6
  return { ok: true };
}

export async function setAllowanceAction(
  rawInput: AllowanceInput
): Promise<BudgetActionResponse> {
  const result = allowanceSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  // Implementation wired in Phase 6
  return { ok: true };
}

export async function deleteExpenseAction(
  expenseId: string
): Promise<BudgetActionResponse> {
  if (!expenseId) {
    return { ok: false, error: "Expense ID is required" };
  }

  // Implementation wired in Phase 6
  return { ok: true };
}
