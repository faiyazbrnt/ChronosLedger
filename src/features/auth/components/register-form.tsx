"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import { Button, Input, PasswordInput } from "@/components/ui";
import { registerSchema, type RegisterInput } from "../schemas";
import { registerAction } from "../actions/auth-actions";

export function RegisterForm() {
  const router = useRouter();

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterInput) => {
    setGeneralError(null);

    startTransition(async () => {
      const response = await registerAction(values);

      if (!response.ok) {
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            if (messages?.[0]) {
              setError(field as keyof RegisterInput, {
                type: "server",
                message: messages[0],
              });
            }
          });
        }
        setGeneralError(response.error);
        return;
      }

      const emailParam = encodeURIComponent(values.email);
      router.push(`/verify-email?email=${emailParam}`);
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
          <p className="flex-1">{generalError}</p>
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
          <label
            htmlFor="password"
            className="text-xs font-semibold text-foreground tracking-tight"
          >
            Password
          </label>
          <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              disabled={isPending}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
          />
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

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold text-foreground tracking-tight"
          >
            Confirm password
          </label>
          <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              disabled={isPending}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p
              id="confirmPassword-error"
              role="alert"
              className="text-xs text-destructive font-medium"
            >
              {errors.confirmPassword.message}
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
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Footer Navigation */}
      <div className="text-center text-xs text-muted-foreground pt-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-link underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
