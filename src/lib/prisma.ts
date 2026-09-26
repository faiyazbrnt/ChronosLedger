import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG_QUERIES === "true" ? ["query", "error", "warn"] : ["error", "warn"],
  });

globalForPrisma.prisma = prisma;
