import { describe, expect, it } from "bun:test";
import { settingsSchema } from "../schemas";

describe("Settings Schemas & Validation", () => {
  it("validates standard settings with PHP currency", () => {
    const result = settingsSchema.safeParse({
      lunchDeductionEnabled: true,
      lunchBreakMinutes: 60,
      currency: "PHP",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("PHP");
      expect(result.data.lunchBreakMinutes).toBe(60);
      expect(result.data.lunchDeductionEnabled).toBe(true);
    }
  });

  it("validates disabled lunch deduction with 0 minutes", () => {
    const result = settingsSchema.safeParse({
      lunchDeductionEnabled: false,
      lunchBreakMinutes: 0,
      currency: "USD",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative lunch minutes", () => {
    const result = settingsSchema.safeParse({
      lunchDeductionEnabled: true,
      lunchBreakMinutes: -15,
      currency: "PHP",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.lunchBreakMinutes).toBeDefined();
    }
  });

  it("rejects lunch minutes exceeding 240", () => {
    const result = settingsSchema.safeParse({
      lunchDeductionEnabled: true,
      lunchBreakMinutes: 241,
      currency: "PHP",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.lunchBreakMinutes).toBeDefined();
    }
  });

  it("accepts maximum allowed lunch minutes (240)", () => {
    const result = settingsSchema.safeParse({
      lunchDeductionEnabled: true,
      lunchBreakMinutes: 240,
      currency: "EUR",
    });
    expect(result.success).toBe(true);
  });

  it("transforms lowercase currency code to uppercase", () => {
    const result = settingsSchema.safeParse({
      lunchDeductionEnabled: true,
      lunchBreakMinutes: 45,
      currency: "sgd",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("SGD");
    }
  });

  it("rejects currency codes with invalid length", () => {
    const tooShort = settingsSchema.safeParse({
      lunchDeductionEnabled: true,
      lunchBreakMinutes: 60,
      currency: "US",
    });
    expect(tooShort.success).toBe(false);

    const tooLong = settingsSchema.safeParse({
      lunchDeductionEnabled: true,
      lunchBreakMinutes: 60,
      currency: "USDT",
    });
    expect(tooLong.success).toBe(false);
  });
});
