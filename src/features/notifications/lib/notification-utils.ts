import { isToday, isYesterday, parseISO } from "date-fns";

export interface NotificationItem {
  id: string;
  userId?: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Formats the unread badge number.
 * Returns null if count <= 0.
 * Caps at "10+" for counts of 10 or more.
 */
export function formatUnreadCount(count: number): string | null {
  if (count <= 0) return null;
  if (count >= 10) return "10+";
  return String(count);
}

/**
 * Groups notification timestamp into Today, Yesterday, or Earlier.
 */
export function groupNotificationDate(
  dateInput: Date | string
): "Today" | "Yesterday" | "Earlier" {
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Earlier";

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return "Earlier";
}

/**
 * Filters items by "all" or "unread".
 */
export function filterNotifications<T extends { isRead: boolean }>(
  items: T[],
  filter: "all" | "unread"
): T[] {
  if (filter === "unread") {
    return items.filter((item) => !item.isRead);
  }
  return items;
}

/**
 * Deduplicates and sorts notifications by createdAt descending.
 */
export function sortAndDeduplicateNotifications<T extends { id: string; createdAt: string }>(
  items: T[]
): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
