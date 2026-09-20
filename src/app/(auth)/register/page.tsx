import Link from "next/link";
import { AuthCard } from "@/features/auth";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AuthCard title="Create Account" description="Sign up to start tracking your time and budget">
        <div className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Registration form will be active in Phase 3.
          </p>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
