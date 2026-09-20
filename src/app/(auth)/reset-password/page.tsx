import { AuthCard, ResetPasswordForm } from "@/features/auth";

export default function ResetPasswordPage() {
  return <div className="flex min-h-screen items-center justify-center bg-background p-4"><AuthCard title="Reset password" description="Choose a secure new password."><ResetPasswordForm /></AuthCard></div>;
}
