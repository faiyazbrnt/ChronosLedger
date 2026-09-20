import { AppShell } from "@/components/layout";
import { ConfirmDialogProvider, ToastProvider } from "@/components/ui";
import { AccountMenu } from "@/features/auth";
import { NotificationsMenu } from "@/features/notifications";
import { getAuthUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  return (
    <ToastProvider><ConfirmDialogProvider><AppShell
      headerActions={<NotificationsMenu />}
      userSlot={
        <AccountMenu email={user?.email ?? "Account"} />
      }
    >
      {children}
    </AppShell></ConfirmDialogProvider></ToastProvider>
  );
}
