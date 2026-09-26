"use server";

import { createClient } from "@/lib/supabase/server";
import {
  clearNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification-service";

type NotificationResponse = { ok: true } | { ok: false; error: string };

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getNotificationsAction() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { ok: false as const, error: "You must be signed in." };

    const notifications = await getNotifications(userId);
    return {
      ok: true as const,
      data: notifications.map((notification) => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[getNotificationsAction] Failed to fetch notifications:", error);
    return {
      ok: false as const,
      error: "Unable to load notifications at this time.",
    };
  }
}

export async function markNotificationReadAction(id: string): Promise<NotificationResponse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { ok: false, error: "You must be signed in." };
    await markNotificationRead(userId, id);
    return { ok: true };
  } catch (error) {
    console.error("[markNotificationReadAction] Failed:", error);
    return { ok: false, error: "Failed to mark notification as read." };
  }
}

export async function markAllNotificationsReadAction(): Promise<NotificationResponse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { ok: false, error: "You must be signed in." };
    await markAllNotificationsRead(userId);
    return { ok: true };
  } catch (error) {
    console.error("[markAllNotificationsReadAction] Failed:", error);
    return { ok: false, error: "Failed to mark all notifications as read." };
  }
}

export async function clearNotificationsAction(): Promise<NotificationResponse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { ok: false, error: "You must be signed in." };
    await clearNotifications(userId);
    return { ok: true };
  } catch (error) {
    console.error("[clearNotificationsAction] Failed:", error);
    return { ok: false, error: "Failed to clear notifications." };
  }
}

