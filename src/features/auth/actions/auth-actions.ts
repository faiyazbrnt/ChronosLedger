"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResendVerificationInput,
  type ResetPasswordInput,
} from "../schemas";
import { recordActivity } from "@/lib/activity";
import { ensureProfileAndSettings } from "@/lib/profile-bootstrap";
import type { AuthActionResponse } from "../types";

async function getOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const proto =
    headerList.get("x-forwarded-proto") ||
    (host && host.includes("localhost") ? "http" : "https");

  if (headerList.get("origin")) {
    return headerList.get("origin")!;
  }

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function loginAction(
  rawInput: LoginInput
): Promise<AuthActionResponse> {
  const result = loginSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Please enter a valid email and password.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    const errorMsgLower = error.message.toLowerCase();
    if (
      errorMsgLower.includes("not confirmed") ||
      errorMsgLower.includes("unconfirmed") ||
      errorMsgLower.includes("email_not_confirmed")
    ) {
      return {
        ok: false,
        error:
          "Your email address is not verified yet. Please check your inbox or resend the verification link.",
        unverified: true,
        email: result.data.email,
      };
    }

    return {
      ok: false,
      error: error.message,
    };
  }

  // Block sign-in if email has not been confirmed
  if (data.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error:
        "Your email address is not verified yet. Please check your inbox or resend the verification link.",
      unverified: true,
      email: result.data.email,
    };
  }

  if (!data.user?.email) {
    return { ok: false, error: "We couldn't verify your account email. Please try again." };
  }

  try {
    await ensureProfileAndSettings({ userId: data.user.id, email: data.user.email });
  } catch (error) {
    console.error("Account initialization after login failed.", error);
    return { ok: false, error: "We couldn't prepare your account. Please try again." };
  }

  return { ok: true };
}

export async function registerAction(
  rawInput: RegisterInput
): Promise<AuthActionResponse<{ email: string }>> {
  const result = registerSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Please correct the errors in the form.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const origin = await getOrigin();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    console.error("Supabase signup failed.", error);
    return {
      ok: false,
      error: error.message.toLowerCase().includes("email rate limit")
        ? "Too many account attempts were made. Please wait a few minutes before trying again."
        : "We couldn't create your account. Please try again.",
    };
  }

  // If identities is empty array, Supabase has existing user with email confirm enabled
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      ok: false,
      error: "An account with this email already exists. Please sign in instead.",
    };
  }

  return {
    ok: true,
    data: {
      email: result.data.email,
    },
  };
}

export async function resendVerificationAction(
  rawInput: ResendVerificationInput
): Promise<AuthActionResponse> {
  const result = resendVerificationSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Please enter a valid email address.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const origin = await getOrigin();
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: result.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    console.error("Supabase verification resend failed.", error);
    return {
      ok: false,
      error: error.message.toLowerCase().includes("email rate limit")
        ? "Too many verification emails were requested. Please wait a few minutes before trying again."
        : "We couldn't send a verification email. Please try again.",
    };
  }

  return { ok: true };
}

export async function requestPasswordResetAction(
  rawInput: ForgotPasswordInput
): Promise<AuthActionResponse> {
  const result = forgotPasswordSchema.safeParse(rawInput);
  // Keep this response generic whether validation fails or the user is unknown.
  if (!result.success) return { ok: true };

  const supabase = await createClient();
  const origin = await getOrigin();
  await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });
  return { ok: true };
}

export async function resetPasswordAction(
  rawInput: ResetPasswordInput
): Promise<AuthActionResponse> {
  const result = resetPasswordSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      ok: false,
      error: "Please correct the password fields.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "This reset link is invalid or has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: result.data.password });
  if (error) return { ok: false, error: "This reset link is invalid or has expired. Request a new one." };

  if (user.email) {
    await ensureProfileAndSettings({ userId: user.id, email: user.email });
  }
  await recordActivity(user.id, "Password changed", "security");
  await supabase.auth.signOut();
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
