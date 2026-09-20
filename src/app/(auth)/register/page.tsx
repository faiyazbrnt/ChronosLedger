import { AuthCard, RegisterForm } from "@/features/auth";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AuthCard
        title="Create Account"
        description="Sign up to start tracking your time and budget"
      >
        <RegisterForm />
      </AuthCard>
    </div>
  );
}
