import { prisma } from "@/lib/prisma";

export async function getUserSettings(userId: string) {
  return prisma.settings.findUnique({
    where: { userId },
  });
}

export async function updateUserSettings(params: {
  userId: string;
  currency: string;
  renderedHoursTarget?: number | null;
}) {
  return prisma.settings.upsert({
    where: { userId: params.userId },
    update: {
      currency: params.currency,
      ...(params.renderedHoursTarget !== undefined
        ? { renderedHoursTarget: params.renderedHoursTarget }
        : {}),
    },
    create: {
      userId: params.userId,
      currency: params.currency,
      renderedHoursTarget: params.renderedHoursTarget ?? null,
    },
  });
}

export async function updateRenderedHoursTarget(params: {
  userId: string;
  renderedHoursTarget: number;
}) {
  return prisma.settings.upsert({
    where: { userId: params.userId },
    update: {
      renderedHoursTarget: params.renderedHoursTarget,
    },
    create: {
      userId: params.userId,
      renderedHoursTarget: params.renderedHoursTarget,
      currency: "PHP",
    },
  });
}

export async function getUserProfile(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
    },
  });
}

export async function updateUserProfile(params: {
  userId: string;
  name?: string | null;
  avatar?: string | null;
}) {
  return prisma.profile.update({
    where: { id: params.userId },
    data: {
      ...(params.name !== undefined ? { name: params.name } : {}),
      ...(params.avatar !== undefined ? { avatar: params.avatar } : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
    },
  });
}
