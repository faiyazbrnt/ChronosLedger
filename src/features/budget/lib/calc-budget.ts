/**
 * Pure calculation functions for budget calculations.
 * No I/O or external side-effects.
 */

export function calculateRemaining(
  allowanceMinor: number,
  totalSpentMinor: number
): number {
  return allowanceMinor - totalSpentMinor;
}

/**
 * "Safe to spend per day" = remaining ÷ days left in the cycle (minimum 1 day, never negative).
 */
export function calculateSafeToSpendPerDay(
  remainingMinor: number,
  daysLeft: number
): number {
  if (remainingMinor <= 0) return 0;
  const safeDays = Math.max(1, daysLeft);
  return Math.floor(remainingMinor / safeDays);
}

/**
 * Aggregates expense minor amounts by category.
 */
export function calculateCategoryTotals(
  expenses: { category: string; amountMinor: number }[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const exp of expenses) {
    totals[exp.category] = (totals[exp.category] ?? 0) + exp.amountMinor;
  }
  return totals;
}

export { getCyclePeriod } from "@/lib/cycle";
