export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "BILLS"
  | "SHOPPING"
  | "HEALTH"
  | "ENTERTAINMENT"
  | "OTHER";

export type BudgetHealthStatus = "ON_TRACK" | "NEAR_LIMIT" | "OVER_BUDGET";

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
  isInherited?: boolean; // True if carried over from previous week
}

export interface BudgetSummaryData {
  allowanceMinor: number;
  totalSpentMinor: number;
  remainingMinor: number;
  safeToSpendPerDayMinor: number;
  percentUsed: number;
  status: BudgetHealthStatus;
  categoryTotals: Record<string, number>;
  currency: string;
}
