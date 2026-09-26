import { AppShell } from "@/components/layout";
import { ConfirmDialogProvider, ToastProvider } from "@/components/ui";
import { NotificationsMenu } from "@/features/notifications";
import { getUserProfile, getUserSettings } from "@/features/settings";
import { getAuthUser } from "@/lib/supabase/server";
import { AccountMenuClient } from "./account-menu-client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  const [profile, settings] = user
    ? await Promise.all([
        getUserProfile(user.id),
        getUserSettings(user.id),
      ])
    : [null, null];

  return (
    <ToastProvider>
      <ConfirmDialogProvider>
        <AppShell
          headerActions={<NotificationsMenu userId={user?.id} />}
          userSlot={
            <AccountMenuClient
              email={user?.email ?? "Account"}
              initialName={profile?.name}
              initialAvatar={profile?.avatar}
              initialCurrency={settings?.currency ?? "PHP"}
            />
          }
        >
          {children}
        </AppShell>
      </ConfirmDialogProvider>
    </ToastProvider>
  );
}
