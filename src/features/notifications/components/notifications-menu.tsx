"use client";

import * as React from "react";
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useConfirm, useNotify } from "@/components/ui";
import {
  clearNotificationsAction,
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "../actions/notification-actions";

type Item = {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationsMenu() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Item[]>([]);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [loading, setLoading] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const confirm = useConfirm();
  const notify = useNotify();
  const unreadCount = items.filter((item) => !item.isRead).length;

  const load = React.useCallback(async () => {
    setLoading(true);
    const response = await getNotificationsAction();
    setLoading(false);
    if (response.ok) setItems(response.data);
  }, []);

  const close = () => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const openMenu = () => {
    setOpen(true);
    void load();
  };

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const markRead = async (id: string) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
    const response = await markNotificationReadAction(id);
    if (!response.ok) {
      notify.error("Couldn't update the notification.");
      void load();
    }
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    const response = await markAllNotificationsReadAction();
    if (!response.ok) {
      notify.error("Couldn't update notifications.");
      void load();
    }
  };

  const clearAll = async () => {
    if (!(await confirm({
      title: "Clear all notifications?",
      description: "This permanently removes your notification history.",
      confirmLabel: "Clear all",
      variant: "destructive",
    }))) return;
    const response = await clearNotificationsAction();
    if (!response.ok) {
      notify.error("Couldn't clear notifications.");
      return;
    }
    setItems([]);
  };

  const visibleItems = filter === "unread" ? items.filter((item) => !item.isRead) : items;

  return <>
    <button ref={triggerRef} type="button" className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Open notifications" aria-expanded={open} aria-haspopup="dialog" onClick={openMenu}>
      <Bell className="h-5 w-5" aria-hidden="true" />
      {unreadCount > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-destructive-foreground">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </button>
    {open && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/30 p-3 backdrop-blur-[1px] sm:items-center" onMouseDown={close}>
      <section role="dialog" aria-modal="true" aria-labelledby="notifications-title" className="flex max-h-[min(42rem,calc(100vh-1.5rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-border p-4">
          <div><h2 id="notifications-title" className="font-semibold">Notifications</h2><p className="text-xs text-muted-foreground">Your recent activity</p></div>
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Close notifications" onClick={close}><X className="h-5 w-5" /></button>
        </header>
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex rounded-lg bg-muted p-1 text-xs"><button type="button" onClick={() => setFilter("all")} className={`rounded-md px-3 py-1.5 ${filter === "all" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>All</button><button type="button" onClick={() => setFilter("unread")} className={`rounded-md px-3 py-1.5 ${filter === "unread" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Unread</button></div>
          <button type="button" className="text-xs font-medium text-link hover:underline disabled:opacity-50" disabled={unreadCount === 0} onClick={() => void markAllRead()}>Mark all read</button>
        </div>
        <div className="min-h-32 flex-1 overflow-y-auto p-2" aria-busy={loading}>
          {loading ? <p className="p-4 text-center text-sm text-muted-foreground">Loading…</p> : visibleItems.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">{filter === "unread" ? "You are all caught up." : "No notifications yet."}</p> : visibleItems.map((item) => {
            const date = parseISO(item.createdAt);
            const group = isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : "Earlier";
            return <article key={item.id} className={`mb-1 rounded-xl p-3 ${item.isRead ? "" : "bg-primary/10"}`}><div className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden="true" /><button type="button" className="min-w-0 flex-1 text-left" onClick={() => !item.isRead && void markRead(item.id)}><p className="text-sm font-medium">{item.message}</p><p className="mt-1 text-xs text-muted-foreground" title={format(date, "PPpp")}>{group} · {formatDistanceToNow(date, { addSuffix: true })}</p></button>{!item.isRead && <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted" aria-label="Mark as read" onClick={() => void markRead(item.id)}><Check className="h-4 w-4" /></button>}</div></article>;
          })}
        </div>
        <footer className="border-t border-border p-3 text-right"><button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50" disabled={items.length === 0} onClick={() => void clearAll()}><Trash2 className="h-4 w-4" />Clear all</button></footer>
      </section>
    </div>}
  </>;
}
