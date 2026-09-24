import { describe, expect, it } from "bun:test";
import {
  formatUnreadCount,
  groupNotificationDate,
  filterNotifications,
  sortAndDeduplicateNotifications,
  NotificationItem,
} from "./notification-utils";

describe("Notifications Utilities", () => {
  describe("formatUnreadCount", () => {
    it("returns null when count is 0 or negative", () => {
      expect(formatUnreadCount(0)).toBeNull();
      expect(formatUnreadCount(-5)).toBeNull();
    });

    it("returns exact string count for values 1 through 9", () => {
      expect(formatUnreadCount(1)).toBe("1");
      expect(formatUnreadCount(5)).toBe("5");
      expect(formatUnreadCount(9)).toBe("9");
    });

    it("returns '10+' when count is 10 or greater", () => {
      expect(formatUnreadCount(10)).toBe("10+");
      expect(formatUnreadCount(15)).toBe("10+");
      expect(formatUnreadCount(999)).toBe("10+");
    });
  });

  describe("filterNotifications", () => {
    const mockItems: NotificationItem[] = [
      { id: "1", message: "A", type: "shift", isRead: false, createdAt: new Date().toISOString() },
      { id: "2", message: "B", type: "expense", isRead: true, createdAt: new Date().toISOString() },
      { id: "3", message: "C", type: "security", isRead: false, createdAt: new Date().toISOString() },
    ];

    it("returns all items when filter is 'all'", () => {
      const result = filterNotifications(mockItems, "all");
      expect(result.length).toBe(3);
    });

    it("returns only unread items when filter is 'unread'", () => {
      const result = filterNotifications(mockItems, "unread");
      expect(result.length).toBe(2);
      expect(result.every((item) => !item.isRead)).toBe(true);
    });
  });

  describe("sortAndDeduplicateNotifications", () => {
    it("deduplicates notifications by id keeping newest reference", () => {
      const items: NotificationItem[] = [
        { id: "1", message: "Shift 1", type: "shift", isRead: false, createdAt: "2026-09-24T01:00:00.000Z" },
        { id: "1", message: "Shift 1 Updated", type: "shift", isRead: true, createdAt: "2026-09-24T01:00:00.000Z" },
        { id: "2", message: "Expense", type: "expense", isRead: false, createdAt: "2026-09-24T02:00:00.000Z" },
      ];

      const result = sortAndDeduplicateNotifications(items);
      expect(result.length).toBe(2);
      expect(result[0]?.id).toBe("2"); // 02:00 is newer than 01:00
      expect(result[1]?.id).toBe("1");
      expect(result[1]?.message).toBe("Shift 1 Updated");
    });

    it("sorts notifications in descending chronological order", () => {
      const items: NotificationItem[] = [
        { id: "1", message: "Oldest", type: "shift", isRead: true, createdAt: "2026-09-20T00:00:00.000Z" },
        { id: "2", message: "Newest", type: "shift", isRead: false, createdAt: "2026-09-24T00:00:00.000Z" },
        { id: "3", message: "Middle", type: "shift", isRead: true, createdAt: "2026-09-22T00:00:00.000Z" },
      ];

      const result = sortAndDeduplicateNotifications(items);
      expect(result[0]?.id).toBe("2");
      expect(result[1]?.id).toBe("3");
      expect(result[2]?.id).toBe("1");
    });
  });

  describe("groupNotificationDate", () => {
    it("groups today's timestamps as 'Today'", () => {
      const now = new Date();
      expect(groupNotificationDate(now.toISOString())).toBe("Today");
    });

    it("handles invalid date strings gracefully", () => {
      expect(groupNotificationDate("invalid-date")).toBe("Earlier");
    });
  });
});
