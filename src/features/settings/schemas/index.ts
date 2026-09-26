import { z } from "zod";

export const settingsSchema = z.object({
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter ISO code")
    .toUpperCase(),
  renderedHoursTarget: z
    .number()
    .int()
    .positive("Target hours must be greater than 0")
    .nullable()
    .optional(),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Name cannot exceed 100 characters")
    .optional()
    .nullable(),
  avatar: z
    .string()
    .max(4_000_000, "Avatar payload exceeds maximum size")
    .optional()
    .nullable(),
});

export const targetHoursSchema = z.object({
  renderedHoursTarget: z
    .number()
    .int()
    .positive("Target hours must be greater than 0"),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type TargetHoursInput = z.infer<typeof targetHoursSchema>;
