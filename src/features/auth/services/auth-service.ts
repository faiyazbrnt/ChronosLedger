import "server-only";
import { prisma } from "@/lib/prisma";

export async function findProfileById(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
  });
}

export async function upsertProfileAndSettings(params: {
  userId: string;
  email: string;
}) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.profile.upsert({
      where: { id: params.userId },
      update: {
        email: params.email,
        verifiedAt: new Date(),
      },
      create: {
        id: params.userId,
        email: params.email,
        verifiedAt: new Date(),
      },
    });

    await tx.settings.upsert({
      where: { userId: params.userId },
      update: {},
      create: {
        userId: params.userId,
        lunchDeductionEnabled: true,
        lunchBreakMinutes: 60,
        currency: "PHP",
      },
    });

    return profile;
  });
}
