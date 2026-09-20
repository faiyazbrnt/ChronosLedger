"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { requestPasswordResetAction } from "../actions/auth-actions";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  return <div className="space-y-4">
    {sent ? <p role="status" className="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">If an account exists for that email, we&apos;ve sent reset instructions.</p> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); startTransition(async () => { await requestPasswordResetAction({ email }); setSent(true); }); }}>
      <div className="space-y-1.5"><label htmlFor="email" className="text-xs font-semibold">Email address</label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} placeholder="you@example.com" /></div>
      <Button className="w-full" type="submit" disabled={pending}>{pending ? "Sending…" : "Send reset instructions"}</Button>
    </form>}
    <p className="text-center text-xs text-muted-foreground"><Link className="font-semibold text-link hover:underline" href="/login">Back to Sign In</Link></p>
  </div>;
}
