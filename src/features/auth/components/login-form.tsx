"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { loginSchema, type LoginInput } from "../schemas";
import { loginAction, resendVerificationAction } from "../actions/auth-actions";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(
    urlError === "verification_failed"
      ? "Email verification failed or link expired. Please sign in or request a new link."
      : null
  );
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginInput) => {
    setGeneralError(null);
    setResendSuccess(null);
    setUnverifiedEmail(null);

    startTransition(async () => {
      const response = await loginAction(values);

      if (!response.ok) {
        if (response.unverified) {
          setUnverifiedEmail(response.email ?? values.email);
          setGeneralError(response.error);
        } else if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            if (messages?.[0]) {
              setError(field as keyof LoginInput, {
                type: "server",
                message: messages[0],
              });
            }
          });
          setGeneralError(response.error);
        } else {
          setGeneralError(response.error);
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  const handleResend = () => {
    if (!unverifiedEmail) return;
    setResendSuccess(null);

    startResendTransition(async () => {
      const res = await resendVerificationAction({ email: unverifiedEmail });
      if (res.ok) {
        setResendSuccess("Verification email sent! Please check your inbox.");
      } else {
        setGeneralError(res.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Global Error Banner */}
      {generalError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2.5 bg-destructive/10 text-destructive border border-destructive/20"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p>{generalError}</p>
            {unverifiedEmail && (
              <div className="pt-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isResending}
                  onClick={handleResend}
                  className="h-7 text-xs border-destructive/30 hover:bg-destructive/15 text-destructive"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Sending link...
                    </>
                  ) : (
                    <>
                      <Mail className="h-3 w-3 mr-1.5" />
                      Resend verification email
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resend Success Banner */}
      {resendSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{resendSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-foreground tracking-tight"
          >
            Email address
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isPending}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="text-xs text-destructive font-medium"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-foreground tracking-tight"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isPending}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y/1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="text-xs text-destructive font-medium"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full mt-2"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Footer Navigation */}
      <div className="text-center text-xs text-muted-foreground pt-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
