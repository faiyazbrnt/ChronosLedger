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
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}
