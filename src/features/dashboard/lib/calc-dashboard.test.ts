import { describe, expect, it } from "bun:test";
import {
  calculateWeeklyDtrSummary,
  calculateWeeklyBudgetSummary,
  calculateRenderedHoursSummary,
} from "./calc-dashboard";

describe("Dashboard pure calculations", () => {
  describe("calculateWeeklyDtrSummary", () => {
    it("calculates 8:30 AM to 6:30 PM with 60m lunch as 9 hours (540m)", () => {
      const entries = [
        {
          timeInMinutes: 510, // 8:30 AM
          timeOutMinutes: 1110, // 6:30 PM
          lunchMinutesApplied: 60,
        },
      ];
      const summary = calculateWeeklyDtrSummary(entries);
      expect(summary.totalMinutesWorked).toBe(540);
      expect(summary.formattedHours).toBe("9h 00m");
      expect(summary.decimalHours).toBe("9.00");
      expect(summary.daysWorked).toBe(1);
      expect(summary.percentTarget).toBe(23); // (9 / 40) * 100 = 22.5 -> 23%
    });

    it("calculates 4 days of 10h shifts as 40 hours reaching 100% target", () => {
      const entries = [
        { timeInMinutes: 480, timeOutMinutes: 1140, lunchMinutesApplied: 60 }, // 10h
        { timeInMinutes: 480, timeOutMinutes: 1140, lunchMinutesApplied: 60 }, // 10h
        { timeInMinutes: 480, timeOutMinutes: 1140, lunchMinutesApplied: 60 }, // 10h
        { timeInMinutes: 480, timeOutMinutes: 1140, lunchMinutesApplied: 60 }, // 10h
      ];
      const summary = calculateWeeklyDtrSummary(entries);
      expect(summary.totalMinutesWorked).toBe(2400); // 40h
      expect(summary.formattedHours).toBe("40h 00m");
      expect(summary.decimalHours).toBe("40.00");
      expect(summary.daysWorked).toBe(4);
      expect(summary.percentTarget).toBe(100);
    });

    it("handles empty entries safely", () => {
      const summary = calculateWeeklyDtrSummary([]);
      expect(summary.totalMinutesWorked).toBe(0);
      expect(summary.formattedHours).toBe("0h 00m");
      expect(summary.decimalHours).toBe("0.00");
      expect(summary.daysWorked).toBe(0);
      expect(summary.percentTarget).toBe(0);
    });

    it("ignores invalid entries where timeOut <= timeIn", () => {
      const entries = [
        { timeInMinutes: 600, timeOutMinutes: 500, lunchMinutesApplied: 60 },
      ];
      const summary = calculateWeeklyDtrSummary(entries);
      expect(summary.totalMinutesWorked).toBe(0);
    });
  });

  describe("calculateWeeklyBudgetSummary", () => {
    it("calculates budget status as ON_TRACK when spent <= 74%", () => {
      const allowanceMinor = 100000; // ₱1,000.00
      const expenses = [
        { amountMinor: 50000 }, // ₱500.00 (50%)
      ];
      const summary = calculateWeeklyBudgetSummary(allowanceMinor, expenses, 5);
      expect(summary.totalSpentMinor).toBe(50000);
      expect(summary.remainingMinor).toBe(50000);
      expect(summary.safeToSpendPerDayMinor).toBe(10000); // 50000 / 5
      expect(summary.percentUsed).toBe(50);
      expect(summary.status).toBe("ON_TRACK");
    });

    it("calculates budget status as NEAR_LIMIT when spent >= 75% but <= 100%", () => {
      const allowanceMinor = 100000; // ₱1,000.00
      const expenses = [
        { amountMinor: 80000 }, // ₱800.00 (80%)
      ];
      const summary = calculateWeeklyBudgetSummary(allowanceMinor, expenses, 2);
      expect(summary.totalSpentMinor).toBe(80000);
      expect(summary.remainingMinor).toBe(20000);
      expect(summary.safeToSpendPerDayMinor).toBe(10000); // 20000 / 2
      expect(summary.percentUsed).toBe(80);
      expect(summary.status).toBe("NEAR_LIMIT");
    });

    it("calculates budget status as OVER_BUDGET when spent > 100%", () => {
      const allowanceMinor = 100000; // ₱1,000.00
      const expenses = [
        { amountMinor: 125000 }, // ₱1,250.00 (125%)
      ];
      const summary = calculateWeeklyBudgetSummary(allowanceMinor, expenses, 2);
      expect(summary.totalSpentMinor).toBe(125000);
      expect(summary.remainingMinor).toBe(-25000);
      expect(summary.safeToSpendPerDayMinor).toBe(0);
      expect(summary.percentUsed).toBe(125);
      expect(summary.status).toBe("OVER_BUDGET");
    });

    it("handles zero allowance with expenses gracefully", () => {
      const summary = calculateWeeklyBudgetSummary(0, [{ amountMinor: 2000 }]);
      expect(summary.totalSpentMinor).toBe(2000);
      expect(summary.remainingMinor).toBe(-2000);
      expect(summary.percentUsed).toBe(100);
      expect(summary.safeToSpendPerDayMinor).toBe(0);
    });
  });

  describe("calculateRenderedHoursSummary", () => {
    it("accumulates running total across multiple shifts with manual breaks", () => {
      const entries = [
        {
          timeInMinutes: 480, // 8:00 AM
          timeOutMinutes: 1020, // 5:00 PM (540m raw)
          lunchMinutesApplied: 0,
          breaks: [{ durationMinutes: 60 }], // 480m net = 8h
        },
        {
          timeInMinutes: 480, // 8:00 AM
          timeOutMinutes: 1020, // 5:00 PM (540m raw)
          lunchMinutesApplied: 0,
          breaks: [{ durationMinutes: 30 }, { durationMinutes: 30 }], // 480m net = 8h
        },
      ];

      const summary = calculateRenderedHoursSummary(entries, 300);
      expect(summary.totalWorkedMinutes).toBe(960); // 16h
      expect(summary.formattedTotalHours).toBe("16h 00m");
      expect(summary.decimalTotalHours).toBe("16.00");
      expect(summary.targetHours).toBe(300);
      expect(summary.hasTarget).toBe(true);
      expect(summary.percentTarget).toBe(5); // (16 / 300) * 100 = 5.33 -> 5%
    });

    it("respects historical shifts with lunchMinutesApplied snapshot", () => {
      const entries = [
        {
          timeInMinutes: 540, // 9:00 AM
          timeOutMinutes: 1080, // 6:00 PM (540m raw)
          lunchMinutesApplied: 60, // 480m net = 8h
        },
      ];

      const summary = calculateRenderedHoursSummary(entries, 300);
      expect(summary.totalWorkedMinutes).toBe(480);
      expect(summary.formattedTotalHours).toBe("8h 00m");
    });

    it("safely ignores in-progress shifts with timeOutMinutes null", () => {
      const entries = [
        {
          timeInMinutes: 480,
          timeOutMinutes: null,
          lunchMinutesApplied: 0,
        },
        {
          timeInMinutes: 480,
          timeOutMinutes: 960, // 8h
          lunchMinutesApplied: 0,
        },
      ];

      const summary = calculateRenderedHoursSummary(entries, 300);
      expect(summary.totalWorkedMinutes).toBe(480);
      expect(summary.formattedTotalHours).toBe("8h 00m");
    });

    it("handles unset target hours gracefully", () => {
      const entries = [
        {
          timeInMinutes: 480,
          timeOutMinutes: 960,
          lunchMinutesApplied: 0,
        },
      ];

      const summary = calculateRenderedHoursSummary(entries, null);
      expect(summary.totalWorkedMinutes).toBe(480);
      expect(summary.hasTarget).toBe(false);
      expect(summary.percentTarget).toBe(0);
    });
  });
});
