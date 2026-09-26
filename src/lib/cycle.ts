export type BudgetCycleType = "WEEKLY" | "MONTHLY" | "SEMI_MONTHLY";

export interface CyclePeriod {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysRemaining: number;
  totalDays: number;
  displayLabel: string;
}

/**
 * Computes cycle boundary dates, total duration, and days remaining for a given reference date.
 */
export function getCyclePeriod(params: {
  targetDate: string; // YYYY-MM-DD
  cycleType: BudgetCycleType;
  anchorDate?: string | null; // YYYY-MM-DD for SEMI_MONTHLY
}): CyclePeriod {
  const { targetDate, cycleType, anchorDate } = params;
  const target = new Date(`${targetDate}T12:00:00Z`);

  if (cycleType === "MONTHLY") {
    const year = target.getUTCFullYear();
    const month = target.getUTCMonth(); // 0-indexed
    const startDateObj = new Date(Date.UTC(year, month, 1));
    const endDateObj = new Date(Date.UTC(year, month + 1, 0)); // last day of month

    const startStr = startDateObj.toISOString().split("T")[0]!;
    const endStr = endDateObj.toISOString().split("T")[0]!;
    const totalDays = endDateObj.getUTCDate();

    const diffMs = endDateObj.getTime() - target.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);

    const monthName = startDateObj.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

    return {
      startDate: startStr,
      endDate: endStr,
      daysRemaining: Math.min(totalDays, daysRemaining),
      totalDays,
      displayLabel: monthName,
    };
  }

  if (cycleType === "SEMI_MONTHLY") {
    // 15-day cycle anchored to anchorDate (or 1st of month if absent)
    const baseAnchorStr =
      anchorDate && /^\d{4}-\d{2}-\d{2}$/.test(anchorDate)
        ? anchorDate
        : `${targetDate.slice(0, 7)}-01`;
    const baseAnchor = new Date(`${baseAnchorStr}T12:00:00Z`);

    const diffDays = Math.floor(
      (target.getTime() - baseAnchor.getTime()) / (1000 * 60 * 60 * 24)
    );
    const cycleIndex = Math.floor(diffDays / 15);

    const startMs = baseAnchor.getTime() + cycleIndex * 15 * 24 * 60 * 60 * 1000;
    const endMs = startMs + 14 * 24 * 60 * 60 * 1000;

    const startDateObj = new Date(startMs);
    const endDateObj = new Date(endMs);

    const startStr = startDateObj.toISOString().split("T")[0]!;
    const endStr = endDateObj.toISOString().split("T")[0]!;

    const diffToEndMs = endDateObj.getTime() - target.getTime();
    const daysRemaining = Math.max(
      1,
      Math.min(15, Math.ceil(diffToEndMs / (1000 * 60 * 60 * 24)) + 1)
    );

    return {
      startDate: startStr,
      endDate: endStr,
      daysRemaining,
      totalDays: 15,
      displayLabel: `${startStr} – ${endStr} (15 Days)`,
    };
  }

  // Default: WEEKLY (Monday to Sunday)
  const day = target.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const mondayMs = target.getTime() + diffToMonday * 24 * 60 * 60 * 1000;
  const sundayMs = mondayMs + 6 * 24 * 60 * 60 * 1000;

  const startObj = new Date(mondayMs);
  const endObj = new Date(sundayMs);

  const startStr = startObj.toISOString().split("T")[0]!;
  const endStr = endObj.toISOString().split("T")[0]!;

  const diffToEndMs = endObj.getTime() - target.getTime();
  const daysRemaining = Math.max(
    1,
    Math.min(7, Math.ceil(diffToEndMs / (1000 * 60 * 60 * 24)) + 1)
  );

  return {
    startDate: startStr,
    endDate: endStr,
    daysRemaining,
    totalDays: 7,
    displayLabel: `${startStr} – ${endStr}`,
  };
}
