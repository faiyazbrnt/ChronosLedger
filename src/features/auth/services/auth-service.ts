import "server-only";
import { prisma } from "@/lib/prisma";
import { ensureProfileAndSettings } from "@/lib/profile-bootstrap";

export async function findProfileById(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
  });
}

export async function upsertProfileAndSettings(params: {
  userId: string;
  email: string;
}) {
  return ensureProfileAndSettings(params);
}
