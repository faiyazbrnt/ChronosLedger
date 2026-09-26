import { describe, expect, it } from "bun:test";
import {
  calculateRemaining,
  calculateSafeToSpendPerDay,
  calculateCategoryTotals,
  getCyclePeriod,
} from "./calc-budget";

describe("Budget pure calculations", () => {
  it("calculates remaining allowance correctly", () => {
    // 5,000 PHP allowance (500000 minor), 1,500 PHP spent (150000 minor)
    expect(calculateRemaining(500000, 150000)).toBe(350000);
  });

  it("calculates negative remaining when over budget", () => {
    // 5,000 PHP allowance, 6,200 PHP spent = -1,200 PHP
    expect(calculateRemaining(500000, 620000)).toBe(-120000);
  });

  it("calculates safe to spend per day with min 1 day and never negative", () => {
    // 3500 PHP remaining across 5 days = 700 PHP/day
    expect(calculateSafeToSpendPerDay(350000, 5)).toBe(70000);

    // Over-budget state: negative remaining returns 0
    expect(calculateSafeToSpendPerDay(-50000, 3)).toBe(0);

    // Zero remaining returns 0
    expect(calculateSafeToSpendPerDay(0, 4)).toBe(0);

    // Days left <= 0 clamped to 1
    expect(calculateSafeToSpendPerDay(100000, 0)).toBe(100000);
    expect(calculateSafeToSpendPerDay(100000, -2)).toBe(100000);
  });

  it("aggregates expenses by category correctly", () => {
    const expenses = [
      { category: "FOOD", amountMinor: 25000 },
      { category: "FOOD", amountMinor: 15000 },
      { category: "TRANSPORT", amountMinor: 10000 },
      { category: "BILLS", amountMinor: 50000 },
    ];
    const totals = calculateCategoryTotals(expenses);
    expect(totals["FOOD"]).toBe(40000);
    expect(totals["TRANSPORT"]).toBe(10000);
    expect(totals["BILLS"]).toBe(50000);
    expect(totals["SHOPPING"]).toBeUndefined();
  });

  it("handles empty expenses array for category totals", () => {
    expect(calculateCategoryTotals([])).toEqual({});
  });

  describe("getCyclePeriod", () => {
    it("computes WEEKLY cycle starting on Monday and ending on Sunday", () => {
      // 2026-03-25 is a Wednesday. Monday is 2026-03-23, Sunday is 2026-03-29
      const period = getCyclePeriod({
        targetDate: "2026-03-25",
        cycleType: "WEEKLY",
      });
      expect(period.startDate).toBe("2026-03-23");
      expect(period.endDate).toBe("2026-03-29");
      expect(period.totalDays).toBe(7);
      expect(period.displayLabel).toContain("2026-03-23");
    });

    it("computes MONTHLY cycle from 1st to last day of month", () => {
      // 2026-02-14: February 2026 has 28 days
      const period = getCyclePeriod({
        targetDate: "2026-02-14",
        cycleType: "MONTHLY",
      });
      expect(period.startDate).toBe("2026-02-01");
      expect(period.endDate).toBe("2026-02-28");
      expect(period.totalDays).toBe(28);
      expect(period.displayLabel).toBe("February 2026");
    });

    it("computes SEMI_MONTHLY 15-day cycle forward from anchor date", () => {
      // Anchor: 2026-03-01. Reference: 2026-03-10 (falls in first 15 days: 2026-03-01 to 2026-03-15)
      const period1 = getCyclePeriod({
        targetDate: "2026-03-10",
        cycleType: "SEMI_MONTHLY",
        anchorDate: "2026-03-01",
      });
      expect(period1.startDate).toBe("2026-03-01");
      expect(period1.endDate).toBe("2026-03-15");
      expect(period1.totalDays).toBe(15);

      // Reference: 2026-03-18 (falls in next 15 days: 2026-03-16 to 2026-03-30)
      const period2 = getCyclePeriod({
        targetDate: "2026-03-18",
        cycleType: "SEMI_MONTHLY",
        anchorDate: "2026-03-01",
      });
      expect(period2.startDate).toBe("2026-03-16");
      expect(period2.endDate).toBe("2026-03-30");
    });

    it("computes SEMI_MONTHLY 15-day cycle backward when reference is before anchor", () => {
      // Anchor: 2026-04-01. Reference: 2026-03-20 (falls in previous 15-day window ending before anchor)
      const period = getCyclePeriod({
        targetDate: "2026-03-20",
        cycleType: "SEMI_MONTHLY",
        anchorDate: "2026-04-01",
      });
      expect(period.startDate <= "2026-03-20").toBe(true);
      expect(period.endDate >= "2026-03-20").toBe(true);
      expect(period.totalDays).toBe(15);
    });
  });
});
