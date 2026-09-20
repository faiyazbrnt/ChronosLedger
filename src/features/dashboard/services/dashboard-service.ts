import "server-only";
import { prisma } from "@/lib/prisma";

export async function getDashboardSummary(userId: string) {
  const [profile, settings] = await Promise.all([
    prisma.profile.findUnique({ where: { id: userId } }),
    prisma.settings.findUnique({ where: { userId } }),
  ]);

  return { profile, settings };
}
