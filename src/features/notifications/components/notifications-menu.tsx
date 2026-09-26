"use client";

import * as React from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Bell, Check, Trash2, X, AlertCircle } from "lucide-react";
import { useConfirm, useNotify } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import {
  clearNotificationsAction,
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "../actions/notification-actions";
import {
  filterNotifications,
  formatUnreadCount,
  groupNotificationDate,
  sortAndDeduplicateNotifications,
  NotificationItem,
} from "../lib/notification-utils";

interface NotificationsMenuProps {
  userId?: string;
}

export function NotificationsMenu({ userId: initialUserId }: NotificationsMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLElement>(null);
  const confirm = useConfirm();
  const notify = useNotify();

  const unreadCount = items.filter((item) => !item.isRead).length;
  const unreadBadge = formatUnreadCount(unreadCount);

  const load = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const response = await getNotificationsAction();
      if (response.ok) {
        setItems(sortAndDeduplicateNotifications(response.data));
      } else {
        setError(response.error);
      }
    } catch {
      setError("Failed to load notifications.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const close = React.useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  // Initial fetch on component mount + Supabase Realtime channel subscription
  React.useEffect(() => {
    let isMounted = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // 1. Initial fetch
    void load();

    // 2. Set up realtime subscription with authenticated JWT
    const setupRealtime = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }

      let activeUserId = initialUserId ?? session?.user?.id;
      if (!activeUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        activeUserId = user?.id;
      }

      if (!activeUserId || !isMounted) return;

      const channelName = `notifications:${activeUserId}:${Math.random().toString(36).slice(2, 9)}`;
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `userId=eq.${activeUserId}`,
          },
          (payload) => {
            if (!isMounted) return;

            if (payload.eventType === "INSERT") {
              const newRow = payload.new as NotificationItem;
              setItems((current) =>
                sortAndDeduplicateNotifications([
                  {
                    id: newRow.id,
                    userId: newRow.userId,
                    message: newRow.message,
                    type: newRow.type,
                    isRead: newRow.isRead ?? false,
                    createdAt:
                      typeof newRow.createdAt === "string"
                        ? newRow.createdAt
                        : new Date().toISOString(),
                  },
                  ...current,
                ])
              );
            } else if (payload.eventType === "UPDATE") {
              const updatedRow = payload.new as NotificationItem;
              setItems((current) =>
                current.map((item) =>
                  item.id === updatedRow.id
                    ? {
                        ...item,
                        ...updatedRow,
                        createdAt:
                          typeof updatedRow.createdAt === "string"
                            ? updatedRow.createdAt
                            : item.createdAt,
                      }
                    : item
                )
              );
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id?: string };
              if (oldRow?.id) {
                setItems((current) => current.filter((item) => item.id !== oldRow.id));
              } else {
                void load(true);
              }
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            void load(true);
          }
        });
    };

    void setupRealtime();

    // 3. Listen for immediate client activity events (dispatched on shifts/expenses)
    const handleActivity = () => {
      void load(true);
    };

    window.addEventListener("chronos:activity-changed", handleActivity);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("chronos:notifications");
        bc.onmessage = () => {
          void load(true);
        };
      }
    } catch {
      // Ignore
    }

    // 4. Refetch on window focus / tab visibility
    const handleFocus = () => {
      void load(true);
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // 5. Background fallback heartbeat polling (Realtime + event dispatch provide instant updates)
    const pollInterval = window.setInterval(() => {
      void load(true);
    }, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("chronos:activity-changed", handleActivity);
      if (bc) {
        bc.close();
      }
      window.clearInterval(pollInterval);
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [initialUserId, load]);

  // Keyboard navigation: Escape to close & focus trapping
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const markRead = async (id: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    const response = await markNotificationReadAction(id);
    if (!response.ok) {
      notify.error("Couldn't update the notification.");
      void load(true);
    }
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    const response = await markAllNotificationsReadAction();
    if (!response.ok) {
      notify.error("Couldn't update notifications.");
      void load(true);
    }
  };

  const clearAll = async () => {
    if (
      !(await confirm({
        title: "Clear all notifications?",
        description: "This permanently removes your notification history.",
        confirmLabel: "Clear all",
        variant: "destructive",
      }))
    )
      return;

    const response = await clearNotificationsAction();
    if (!response.ok) {
      notify.error("Couldn't clear notifications.");
      return;
    }
    setItems([]);
  };

  const visibleItems = filterNotifications(items, filter);

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        aria-label={
          unreadCount > 0
            ? `Open notifications, ${unreadCount} unread`
            : "Open notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggleOpen}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadBadge && (
          <span className="absolute right-1 top-1 min-w-4 rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-destructive-foreground">
            {unreadBadge}
          </span>
        )}
      </button>

      {/* Dropdown Overlay with Dimming and Anchored Popover */}
      {open && (
        <>
          {/* Dimming Backdrop Overlay */}
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[1px] animate-in fade-in duration-150"
            onClick={close}
            aria-hidden="true"
          />

          {/* Anchored Notification Panel Dropdown */}
          <section
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
            className="absolute right-0 top-full mt-2 z-50 flex max-h-[calc(100vh-5.5rem)] w-[calc(100vw-2rem)] max-w-[384px] sm:w-96 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h2 id="notifications-title" className="font-semibold text-foreground">
                  Notifications
                </h2>
                <p className="text-xs text-muted-foreground">Your recent activity</p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                aria-label="Close notifications"
                onClick={close}
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {/* Filter Tabs & Mark All Read */}
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 bg-muted/30">
              <div className="flex rounded-lg bg-muted p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    filter === "all"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unread")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    filter === "unread"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Unread{unreadCount > 0 && ` (${unreadBadge})`}
                </button>
              </div>
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                disabled={unreadCount === 0}
                onClick={() => void markAllRead()}
              >
                Mark all read
              </button>
            </div>

            {/* Content List */}
            <div
              className="min-h-32 flex-1 overflow-y-auto p-2"
              aria-busy={loading}
              tabIndex={0}
              role="region"
              aria-label="Notification list"
            >
              {loading && items.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Loading notifications…
                </div>
              ) : error && items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-destructive">
                  <AlertCircle className="mb-2 h-5 w-5" />
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => void load()}
                    className="mt-3 text-xs font-semibold text-primary hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : visibleItems.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  {filter === "unread" ? "You are all caught up." : "No notifications yet."}
                </p>
              ) : (
                visibleItems.map((item) => {
                  let date: Date;
                  try {
                    date = parseISO(item.createdAt);
                  } catch {
                    date = new Date();
                  }
                  const group = groupNotificationDate(date);

                  return (
                    <article
                      key={item.id}
                      className={`mb-1.5 rounded-xl p-3 transition-colors ${
                        item.isRead
                          ? "hover:bg-muted/50"
                          : "bg-primary/5 hover:bg-primary/10 border-l-2 border-primary"
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        {!item.isRead && (
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                            aria-hidden="true"
                          />
                        )}
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                          onClick={() => !item.isRead && void markRead(item.id)}
                        >
                          <p
                            className={`text-sm leading-snug break-words ${
                              item.isRead
                                ? "text-muted-foreground"
                                : "font-medium text-foreground"
                            }`}
                          >
                            {item.message}
                          </p>
                          <p
                            className="mt-1 text-xs text-muted-foreground"
                            title={format(date, "PPpp")}
                          >
                            {group} · {formatDistanceToNow(date, { addSuffix: true })}
                          </p>
                        </button>
                        {!item.isRead && (
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                            aria-label="Mark as read"
                            title="Mark as read"
                            onClick={() => void markRead(item.id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <footer className="border-t border-border p-3 flex items-center justify-between bg-muted/20">
              <span className="text-[11px] text-muted-foreground">
                {items.length} {items.length === 1 ? "notification" : "notifications"}
              </span>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                disabled={items.length === 0}
                onClick={() => void clearAll()}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </button>
            </footer>
          </section>
        </>
      )}
    </div>
  );
}
