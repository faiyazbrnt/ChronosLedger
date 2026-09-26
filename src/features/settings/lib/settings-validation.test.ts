import { describe, expect, it } from "bun:test";
import { settingsSchema, profileSchema, targetHoursSchema } from "../schemas";

describe("Settings Schemas & Validation", () => {
  it("validates standard settings with PHP currency", () => {
    const result = settingsSchema.safeParse({
      currency: "PHP",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("PHP");
    }
  });

  it("transforms lowercase currency code to uppercase", () => {
    const result = settingsSchema.safeParse({
      currency: "sgd",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("SGD");
    }
  });

  it("rejects currency codes with invalid length", () => {
    const tooShort = settingsSchema.safeParse({
      currency: "US",
    });
    expect(tooShort.success).toBe(false);

    const tooLong = settingsSchema.safeParse({
      currency: "USDT",
    });
    expect(tooLong.success).toBe(false);
  });

  it("validates profile schema with name and avatar", () => {
    const valid = profileSchema.safeParse({
      name: "Alex Doe",
      avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    });
    expect(valid.success).toBe(true);
  });

  it("validates profile schema with null or optional fields", () => {
    const valid = profileSchema.safeParse({});
    expect(valid.success).toBe(true);
  });

  it("rejects excessively long profile names", () => {
    const invalid = profileSchema.safeParse({
      name: "A".repeat(101),
    });
    expect(invalid.success).toBe(false);
  });

  it("validates targetHoursSchema with positive integer", () => {
    const valid = targetHoursSchema.safeParse({
      renderedHoursTarget: 300,
    });
    expect(valid.success).toBe(true);
  });

  it("rejects zero or negative target hours", () => {
    const zero = targetHoursSchema.safeParse({
      renderedHoursTarget: 0,
    });
    expect(zero.success).toBe(false);

    const negative = targetHoursSchema.safeParse({
      renderedHoursTarget: -10,
    });
    expect(negative.success).toBe(false);
  });
});
