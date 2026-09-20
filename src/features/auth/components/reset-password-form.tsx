"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, PasswordInput } from "@/components/ui";
import { resetPasswordAction } from "../actions/auth-actions";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setError(null); startTransition(async () => { const response = await resetPasswordAction({ password, confirmPassword }); if (!response.ok) { setError(response.error); return; } router.replace("/login?reset=success"); router.refresh(); }); }}>
    {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error} <Link className="underline" href="/forgot-password">Request a new link</Link></p>}
    <div className="space-y-1.5"><label htmlFor="new-password" className="text-xs font-semibold">New password</label><PasswordInput id="new-password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} /></div>
    <div className="space-y-1.5"><label htmlFor="confirm-password" className="text-xs font-semibold">Confirm new password</label><PasswordInput id="confirm-password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={pending} /></div>
    <Button className="w-full" type="submit" disabled={pending}>{pending ? "Changing password…" : "Change password"}</Button>
  </form>;
}
