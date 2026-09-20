import { describe, expect, it } from "bun:test";
import {
  calculateRemaining,
  calculateSafeToSpendPerDay,
  calculateCategoryTotals,
} from "./calc-budget";

describe("Budget pure calculations", () => {
  it("calculates remaining allowance correctly", () => {
    // 5,000 PHP allowance (500000 minor), 1,500 PHP spent (150000 minor)
    expect(calculateRemaining(500000, 150000)).toBe(350000);
  });

  it("calculates safe to spend per day with min 1 day and never negative", () => {
    // 3500 PHP remaining across 5 days = 700 PHP/day
    expect(calculateSafeToSpendPerDay(350000, 5)).toBe(70000);

    // Over-budget state: negative remaining returns 0
    expect(calculateSafeToSpendPerDay(-50000, 3)).toBe(0);

    // Days left <= 0 clamped to 1
    expect(calculateSafeToSpendPerDay(100000, 0)).toBe(100000);
  });

  it("aggregates expenses by category correctly", () => {
    const expenses = [
      { category: "FOOD", amountMinor: 25000 },
      { category: "FOOD", amountMinor: 15000 },
      { category: "TRANSPORT", amountMinor: 10000 },
    ];
    const totals = calculateCategoryTotals(expenses);
    expect(totals["FOOD"]).toBe(40000);
    expect(totals["TRANSPORT"]).toBe(10000);
  });
});
