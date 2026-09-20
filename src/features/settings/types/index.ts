export type SettingsActionResponse<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export interface UserSettingsData {
  userId: string;
  lunchDeductionEnabled: boolean;
  lunchBreakMinutes: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
