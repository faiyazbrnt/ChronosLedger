type PrismaLikeError = Error & { code?: string };

const ACCOUNT_DATA_ERROR =
  "We couldn't verify your account data. Please sign out, sign back in, and try again.";

export function getSafeServerActionError(
  error: unknown,
  operation: string,
  fallback: string
): string {
  console.error(`Failed to ${operation}.`, error);

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as PrismaLikeError).code === "P2003"
  ) {
    return ACCOUNT_DATA_ERROR;
  }

  return fallback;
}
