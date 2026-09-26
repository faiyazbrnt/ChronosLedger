import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getOptimizedDatabaseUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;

  let url = rawUrl;

  // If connection_limit is set to 1 or 2 (common misconception from older serverless guides),
  // upgrade to 10. A limit of 1 serializes all queries, causing P2024 connection pool timeouts
  // when concurrent operations (e.g. Promise.all, layout queries, and server actions) execute.
  url = url.replace(/([?&])connection_limit=[12](\b|$)/, "$1connection_limit=10$2");

  // Ensure pool_timeout is at least 30s to withstand serverless cold starts & query bursts
  if (!url.includes("pool_timeout=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}pool_timeout=30`;
  }

  return url;
}

const databaseUrl = getOptimizedDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: databaseUrl
      ? {
          db: {
            url: databaseUrl,
          },
        }
      : undefined,
    log: process.env.PRISMA_LOG_QUERIES === "true" ? ["query", "error", "warn"] : ["error", "warn"],
  });

globalForPrisma.prisma = prisma;

