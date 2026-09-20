import { describe, expect, it } from "bun:test";
import {
  expenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
  allowanceSchema,
} from "../schemas";

describe("Budget Schemas & Validation", () => {
  describe("expenseSchema", () => {
    it("validates a standard expense", () => {
      const result = expenseSchema.safeParse({
        spentOn: "2026-09-21",
        category: "FOOD",
        amountMinor: 25000, // ₱250.00
        note: "Team lunch",
      });
      expect(result.success).toBe(true);
    });

    it("rejects zero or negative amount", () => {
      const zero = expenseSchema.safeParse({
        spentOn: "2026-09-21",
        category: "TRANSPORT",
        amountMinor: 0,
      });
      expect(zero.success).toBe(false);

      const negative = expenseSchema.safeParse({
        spentOn: "2026-09-21",
        category: "TRANSPORT",
        amountMinor: -100,
      });
      expect(negative.success).toBe(false);
    });

    it("rejects invalid expense category", () => {
      const result = expenseSchema.safeParse({
        spentOn: "2026-09-21",
        category: "VACATION", // not in the 7 fixed categories
        amountMinor: 50000,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid date format", () => {
      const result = expenseSchema.safeParse({
        spentOn: "09/21/2026",
        category: "BILLS",
        amountMinor: 100000,
      });
      expect(result.success).toBe(false);
    });

    it("rejects note exceeding 255 characters", () => {
      const result = expenseSchema.safeParse({
        spentOn: "2026-09-21",
        category: "SHOPPING",
        amountMinor: 15000,
        note: "x".repeat(256),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateExpenseSchema", () => {
    it("validates update with valid UUID", () => {
      const result = updateExpenseSchema.safeParse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        spentOn: "2026-09-21",
        category: "HEALTH",
        amountMinor: 12000,
        note: "Vitamins",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID in update", () => {
      const result = updateExpenseSchema.safeParse({
        id: "invalid-id",
        spentOn: "2026-09-21",
        category: "HEALTH",
        amountMinor: 12000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("deleteExpenseSchema", () => {
    it("validates valid UUID for deletion", () => {
      const result = deleteExpenseSchema.safeParse({
        id: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID", () => {
      const result = deleteExpenseSchema.safeParse({
        id: "bad-id",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("allowanceSchema", () => {
    it("validates valid allowance amount and week start", () => {
      const result = allowanceSchema.safeParse({
        weekStart: "2026-09-21",
        amountMinor: 500000, // ₱5,000.00
      });
      expect(result.success).toBe(true);
    });

    it("accepts zero allowance", () => {
      const result = allowanceSchema.safeParse({
        weekStart: "2026-09-21",
        amountMinor: 0,
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative allowance", () => {
      const result = allowanceSchema.safeParse({
        weekStart: "2026-09-21",
        amountMinor: -5000,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid date format in allowance", () => {
      const result = allowanceSchema.safeParse({
        weekStart: "2026-9-21",
        amountMinor: 100000,
      });
      expect(result.success).toBe(false);
    });
  });
});
