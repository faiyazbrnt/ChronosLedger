"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { resendVerificationAction } from "../actions/auth-actions";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResending, startResendTransition] = useTransition();

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleResend = () => {
    if (!email || secondsLeft > 0) return;
    setGeneralError(null);
    setSuccessMessage(null);

    startResendTransition(async () => {
      const res = await resendVerificationAction({ email });
      if (res.ok) {
        setSuccessMessage("A fresh verification link has been sent to your inbox.");
        setSecondsLeft(60);
      } else {
        setGeneralError(res.error);
      }
    });
  };

  return (
    <div className="space-y-6 text-center">
      {/* Icon Badge */}
      <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
        <Mail className="h-7 w-7" />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          We sent a verification link to{" "}
          {email ? (
            <span className="font-semibold text-foreground break-all">
              {email}
            </span>
          ) : (
            "your registered email address"
          )}
          .
        </p>
        <p className="text-xs text-muted-foreground">
          Please click the link in that email to activate your account and access your dashboard.
        </p>
      </div>

      {/* Status Messages */}
      {generalError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 text-left"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-success/10 text-success border border-success/20 text-left"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {email ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={secondsLeft > 0 || isResending}
            onClick={handleResend}
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Resending...
              </>
            ) : secondsLeft > 0 ? (
              `Resend link in ${secondsLeft}s`
            ) : (
              "Resend verification email"
            )}
          </Button>
        ) : null}

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
