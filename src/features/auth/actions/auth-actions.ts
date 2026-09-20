"use server";

import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "../schemas";
import type { AuthActionResponse } from "../types";

export async function loginAction(
  rawInput: LoginInput
): Promise<AuthActionResponse> {
  const result = loginSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  // Implementation wired in Phase 3
  return { ok: true };
}

export async function registerAction(
  rawInput: RegisterInput
): Promise<AuthActionResponse> {
  const result = registerSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  // Implementation wired in Phase 3
  return { ok: true };
}
