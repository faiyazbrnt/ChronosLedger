import { z } from "zod";

export const expenseCategories = [
  "FOOD",
  "TRANSPORT",
  "BILLS",
  "SHOPPING",
  "HEALTH",
  "ENTERTAINMENT",
  "OTHER",
] as const;

export const expenseSchema = z.object({
  spentOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  category: z.enum(expenseCategories, {
    message: "Please select a valid expense category",
  }),
  amountMinor: z.number().int().positive("Amount must be greater than zero"),
  note: z.string().max(255, "Note cannot exceed 255 characters").optional().nullable(),
});

export const updateExpenseSchema = expenseSchema.extend({
  id: z.string().uuid("Invalid expense ID"),
});

export const deleteExpenseSchema = z.object({
  id: z.string().uuid("Invalid expense ID"),
});

export const allowanceSchema = z.object({
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  amountMinor: z.number().int().min(0, "Allowance cannot be negative"),
});

export const budgetCycleSchema = z.object({
  cycleType: z.enum(["WEEKLY", "MONTHLY", "SEMI_MONTHLY"]),
  amountMinor: z.number().int().min(0, "Budget cannot be negative"),
  anchorDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid anchor date (YYYY-MM-DD)")
    .optional()
    .nullable(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type DeleteExpenseInput = z.infer<typeof deleteExpenseSchema>;
export type AllowanceInput = z.infer<typeof allowanceSchema>;
export type BudgetCycleInput = z.infer<typeof budgetCycleSchema>;
