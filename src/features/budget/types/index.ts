export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "BILLS"
  | "SHOPPING"
  | "HEALTH"
  | "ENTERTAINMENT"
  | "OTHER";

export type BudgetCycleType = "WEEKLY" | "MONTHLY" | "SEMI_MONTHLY";

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

export interface BudgetConfigData {
  id: string;
  userId: string;
  cycleType: BudgetCycleType;
  amountMinor: number;
  anchorDate?: string | null; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

export interface CyclePeriod {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysRemaining: number;
  totalDays: number;
  displayLabel: string;
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
  cycleType?: BudgetCycleType;
  cyclePeriod?: CyclePeriod;
}
