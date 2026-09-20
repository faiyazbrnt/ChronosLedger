import "server-only";

import { prisma } from "@/lib/prisma";

export type ActivityType = "shift" | "expense" | "budget" | "security";

export async function recordActivity(
  userId: string,
  message: string,
  type: ActivityType
) {
  await prisma.notification.create({ data: { userId, message, type } });
}
