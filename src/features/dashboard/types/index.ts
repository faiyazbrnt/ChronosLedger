export type DashboardExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "BILLS"
  | "SHOPPING"
  | "HEALTH"
  | "ENTERTAINMENT"
  | "OTHER";

export type DashboardBudgetStatus = "ON_TRACK" | "NEAR_LIMIT" | "OVER_BUDGET";

export interface RecentShiftItem {
  id: string;
  workDate: string; // YYYY-MM-DD
  timeInMinutes: number;
  timeOutMinutes: number;
  lunchMinutesApplied: number;
  workedMinutes: number;
  formattedTime: string; // e.g. "8:30 AM – 6:30 PM"
  formattedDuration: string; // e.g. "9h 00m"
  note: string | null;
}

export interface RecentExpenseItem {
  id: string;
  spentOn: string; // YYYY-MM-DD
  category: DashboardExpenseCategory;
  amountMinor: number;
  formattedAmount: string;
  note: string | null;
}

export interface WeeklyDtrSummary {
  totalMinutesWorked: number;
  formattedHours: string;
  decimalHours: string;
  daysWorked: number;
  targetHours: number; // default 40
  percentTarget: number;
}

export interface WeeklyBudgetSummary {
  allowanceMinor: number;
  totalSpentMinor: number;
  remainingMinor: number;
  safeToSpendPerDayMinor: number;
  percentUsed: number;
  status: DashboardBudgetStatus;
  isInherited: boolean;
}

export interface DashboardData {
  user: {
    email: string;
  };
  settings: {
    currency: string;
    lunchDeductionEnabled: boolean;
    lunchBreakMinutes: number;
  };
  currentWeek: {
    monday: string;
    sunday: string;
    displayLabel: string;
  };
  weeklyDtr: WeeklyDtrSummary;
  weeklyBudget: WeeklyBudgetSummary;
  recentShifts: RecentShiftItem[];
  recentExpenses: RecentExpenseItem[];
}
