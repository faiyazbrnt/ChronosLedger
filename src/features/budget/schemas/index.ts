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
  spentOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  category: z.enum(expenseCategories),
  amountMinor: z.number().int().positive("Amount must be greater than zero"),
  note: z.string().max(255).optional(),
});

export const allowanceSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  amountMinor: z.number().int().min(0, "Allowance cannot be negative"),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type AllowanceInput = z.infer<typeof allowanceSchema>;
