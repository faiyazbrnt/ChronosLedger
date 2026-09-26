export type SettingsActionResponse<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export interface UserSettingsData {
  userId: string;
  currency: string;
  renderedHoursTarget?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileData {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
}
