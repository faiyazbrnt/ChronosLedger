import "server-only";
import { prisma } from "@/lib/prisma";

export async function getUserSettings(userId: string) {
  return prisma.settings.findUnique({
    where: { userId },
  });
}

export async function updateUserSettings(params: {
  userId: string;
  lunchDeductionEnabled: boolean;
  lunchBreakMinutes: number;
  currency: string;
}) {
  return prisma.settings.upsert({
    where: { userId: params.userId },
    update: {
      lunchDeductionEnabled: params.lunchDeductionEnabled,
      lunchBreakMinutes: params.lunchBreakMinutes,
      currency: params.currency,
    },
    create: {
      userId: params.userId,
      lunchDeductionEnabled: params.lunchDeductionEnabled,
      lunchBreakMinutes: params.lunchBreakMinutes,
      currency: params.currency,
    },
  });
}
