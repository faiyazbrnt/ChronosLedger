import Link from "next/link";
import { AuthCard } from "@/features/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AuthCard title="Sign In" description="Enter your email and password to access your account">
        <div className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Sign-in form will be active in Phase 3.
          </p>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
