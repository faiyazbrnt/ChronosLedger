"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  type LoginInput,
  type RegisterInput,
  type ResendVerificationInput,
} from "../schemas";
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
    return {
      ok: false,
      error: error.message,
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
    return {
      ok: false,
      error: error.message,
    };
  }

  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
