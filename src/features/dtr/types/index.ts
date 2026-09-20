export type DtrActionResponse<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export interface DtrEntryData {
  id: string;
  userId: string;
  workDate: string; // YYYY-MM-DD
  timeInMinutes: number;
  timeOutMinutes: number;
  lunchMinutesApplied: number;
  workedMinutes?: number; // Pure derived runtime value
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DtrWeekSummary {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  totalWorkedMinutes: number;
  formattedTotalHours: string;
  decimalTotalHours: string;
  daysWorkedCount: number;
}
