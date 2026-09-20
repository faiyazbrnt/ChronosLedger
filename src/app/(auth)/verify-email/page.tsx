import { Suspense } from "react";
import { AuthCard, VerifyEmailContent } from "@/features/auth";
import { Skeleton } from "@/components/ui";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AuthCard
        title="Verify your email"
        description="We've sent a verification link to your email address."
      >
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-14 w-14 rounded-2xl mx-auto" />
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-10 w-full" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </AuthCard>
    </div>
  );
}
