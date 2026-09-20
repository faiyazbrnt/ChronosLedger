export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "BILLS"
  | "SHOPPING"
  | "HEALTH"
  | "ENTERTAINMENT"
  | "OTHER";

export type BudgetActionResponse<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export interface ExpenseData {
  id: string;
  userId: string;
  spentOn: string; // YYYY-MM-DD
  category: ExpenseCategory;
  amountMinor: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyAllowanceData {
  id: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  amountMinor: number;
}
