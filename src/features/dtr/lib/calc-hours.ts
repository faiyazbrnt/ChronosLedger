/**
 * Pure calculation functions for DTR hours.
 * No I/O or external side-effects.
 */

export interface WorkTimeCalculationInput {
  timeInMinutes: number;
  timeOutMinutes: number;
  lunchMinutesApplied: number;
}

/**
 * Calculates net worked minutes for a single day entry.
 * Returns 0 if timeOut is not greater than timeIn or if lunch exceeds shift.
 */
export function calculateWorkedMinutes(input: WorkTimeCalculationInput): number {
  const { timeInMinutes, timeOutMinutes, lunchMinutesApplied } = input;
  if (timeOutMinutes <= timeInMinutes) return 0;
  const rawMinutes = timeOutMinutes - timeInMinutes;
  const netMinutes = rawMinutes - Math.max(0, lunchMinutesApplied);
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
