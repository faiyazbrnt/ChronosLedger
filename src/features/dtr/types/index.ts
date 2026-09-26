export type DtrActionResponse<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export interface DtrBreakItem {
  id?: string;
  category: string;
  durationMinutes: number;
}

export interface DtrEntryData {
  id: string;
  userId: string;
  workDate: string; // YYYY-MM-DD
  timeInMinutes: number;
  timeOutMinutes: number | null;
  lunchMinutesApplied: number;
  breaks?: DtrBreakItem[];
  workedMinutes?: number; // Pure derived runtime value
  note: string | null;
  activity?: string | null;
  activityDescription?: string | null;
  remarks?: string | null;
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
