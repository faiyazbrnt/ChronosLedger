export type AuthActionResponse<T = void> =
  | { ok: true; data?: T }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
      unverified?: boolean;
      email?: string;
    };

export interface UserProfile {
  id: string;
  email: string;
  verifiedAt: Date | null;
  createdAt: Date;
}
