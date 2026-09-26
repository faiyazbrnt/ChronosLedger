import "server-only";
import { prisma } from "@/lib/prisma";

export function createNotification(userId: string, message: string, type: string) {
  return prisma.notification.create({ data: { userId, message, type } });
}

export function getNotifications(userId: string, limit = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function markNotificationRead(userId: string, id: string) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
}

export function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

export function clearNotifications(userId: string) {
  return prisma.notification.deleteMany({ where: { userId } });
}
