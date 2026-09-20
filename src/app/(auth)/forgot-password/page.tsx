import { AuthCard, ForgotPasswordForm } from "@/features/auth";

export default function ForgotPasswordPage() {
  return <div className="flex min-h-screen items-center justify-center bg-background p-4"><AuthCard title="Forgot password?" description="Enter your email and we’ll send reset instructions."><ForgotPasswordForm /></AuthCard></div>;
}
