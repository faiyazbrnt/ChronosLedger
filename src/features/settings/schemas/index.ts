import { z } from "zod";

export const settingsSchema = z.object({
  lunchDeductionEnabled: z.boolean(),
  lunchBreakMinutes: z
    .number()
    .int()
    .min(0, "Lunch minutes cannot be negative")
    .max(240, "Lunch break cannot exceed 240 minutes"),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter ISO code")
    .toUpperCase(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
