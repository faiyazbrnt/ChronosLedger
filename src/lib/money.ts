/**
 * Money utility functions.
 * All monetary amounts are handled strictly as integer minor units (e.g. cents/centavos).
 */

export function formatMinorUnits(
  amountMinor: number,
  currency: string = "PHP",
  locale: string = "en-PH"
): string {
  const major = amountMinor / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major);
}

export function parseMajorToMinor(amountMajorStr: string): number | null {
  const sanitized = amountMajorStr.trim().replace(/,/g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(sanitized)) return null;
  const num = Number(sanitized);
  if (isNaN(num)) return null;
  return Math.round(num * 100);
}
