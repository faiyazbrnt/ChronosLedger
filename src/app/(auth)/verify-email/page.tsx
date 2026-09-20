import Link from "next/link";
import { AuthCard } from "@/features/auth";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AuthCard
        title="Verify your email"
        description="We've sent a verification link to your email address."
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Please click the link in your email to activate your account and proceed to the dashboard.
          </p>
          <div className="pt-2">
            <Link href="/login" className="text-sm font-semibold text-primary underline underline-offset-4">
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
