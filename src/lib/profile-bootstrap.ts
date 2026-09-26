import { prisma } from "@/lib/prisma";

export interface ProfileBootstrapInput {
  userId: string;
  email: string;
}

/** Creates application records for a confirmed Supabase user; safe to retry. */
export async function ensureProfileAndSettings({
  userId,
  email,
}: ProfileBootstrapInput) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.profile.upsert({
      where: { id: userId },
      update: { email, verifiedAt: new Date() },
      create: { id: userId, email, verifiedAt: new Date() },
    });

    await tx.settings.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        currency: "PHP",
      },
    });

    return profile;
  });
}
