import { AppShell } from "@/components/layout";
import { LogoutButton } from "@/features/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      userSlot={
        <LogoutButton
          variant="outline"
          size="sm"
          className="w-full text-xs justify-center border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        />
      }
    >
      {children}
    </AppShell>
  );
}
