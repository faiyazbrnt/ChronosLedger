import { Suspense } from "react";
import { AuthCard, LoginForm } from "@/features/auth";
import { Skeleton } from "@/components/ui";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AuthCard
        title="Sign In"
        description="Enter your email and password to access your account"
      >
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </AuthCard>
    </div>
  );
}
