/**
 * Pure calculation functions for DTR hours.
 * No I/O or external side-effects.
 */

export interface BreakDurationItem {
  durationMinutes: number;
}

export interface WorkTimeCalculationInput {
  timeInMinutes: number;
  timeOutMinutes: number | null;
  breaks?: BreakDurationItem[] | null;
  lunchMinutesApplied?: number;
}

/**
 * Calculates net worked minutes for a single day entry.
 * Deducts sum of manual breaks. If no breaks exist, falls back to historical lunchMinutesApplied.
 * Returns 0 if timeOut is null, not greater than timeIn, or if deductions exceed shift.
 */
export function calculateWorkedMinutes(input: WorkTimeCalculationInput): number {
  const { timeInMinutes, timeOutMinutes, breaks, lunchMinutesApplied = 0 } = input;
  if (timeOutMinutes === null || timeOutMinutes <= timeInMinutes) return 0;

  const rawMinutes = timeOutMinutes - timeInMinutes;

  // Determine total break deduction:
  // If breaks are explicitly defined (even empty []), use sum of breaks (default 0).
  // If breaks is null/undefined and lunchMinutesApplied > 0, fallback to historical lunch snapshot.
  let totalDeductionMinutes = 0;
  if (breaks !== undefined && breaks !== null) {
    totalDeductionMinutes = breaks.reduce(
      (sum, b) => sum + Math.max(0, b.durationMinutes),
      0
    );
  } else {
    totalDeductionMinutes = Math.max(0, lunchMinutesApplied);
  }

  const netMinutes = rawMinutes - totalDeductionMinutes;
  return Math.max(0, netMinutes);
}

/**
 * Sums worked minutes across multiple entries.
 */
export function calculateTotalWorkedMinutes(
  entries: WorkTimeCalculationInput[]
): number {
  return entries.reduce(
    (total, entry) => total + calculateWorkedMinutes(entry),
    0
  );
}

/**
 * Formats worked minutes to "9h 00m" display string.
 */
export function formatWorkedHoursAndMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  const paddedMins = remainingMins.toString().padStart(2, "0");
  return `${hours}h ${paddedMins}m`;
}

/**
 * Converts worked minutes to decimal hours rounded to two decimals (e.g. 9.00).
 */
export function formatWorkedDecimalHours(minutes: number): string {
  const hours = minutes / 60;
  return hours.toFixed(2);
}
