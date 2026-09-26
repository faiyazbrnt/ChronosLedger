import { z } from "zod";

export const dtrBreakItemSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.string().trim().min(1, "Category is required"),
  durationMinutes: z.number().int().min(0, "Duration cannot be negative"),
});

export const dtrEntrySchema = z
  .object({
    workDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    timeInMinutes: z
      .number()
      .int()
      .min(0, "Time in cannot be negative")
      .max(1439, "Time in must be within 24 hours"),
    timeOutMinutes: z
      .number()
      .int()
      .min(0, "Time out cannot be negative")
      .max(1439, "Time out must be within 24 hours")
      .nullable()
      .optional(),
    breaks: z.array(dtrBreakItemSchema).optional().default([]),
    note: z.string().max(500, "Note cannot exceed 500 characters").optional().nullable(),
    activity: z.string().optional().nullable(),
    activityDescription: z.string().optional().nullable(),
    remarks: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.timeOutMinutes === null || data.timeOutMinutes === undefined) {
        return true;
      }
      return data.timeOutMinutes > data.timeInMinutes;
    },
    {
      message: "Time out must be later than time in",
      path: ["timeOutMinutes"],
    }
  );

export const clockInSchema = z.object({
  workDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  timeInMinutes: z
    .number()
    .int()
    .min(0, "Time in cannot be negative")
    .max(1439, "Time in must be within 24 hours"),
  note: z.string().max(500, "Note cannot exceed 500 characters").optional().nullable(),
});

export const activityReportSchema = z.object({
  id: z.string().uuid("Invalid entry ID"),
  activity: z.string().optional().nullable(),
  activityDescription: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const deleteDtrEntrySchema = z.object({
  id: z.string().uuid("Invalid entry ID"),
});

export type DtrBreakItemInput = z.infer<typeof dtrBreakItemSchema>;
export type DtrEntryInput = z.infer<typeof dtrEntrySchema>;
export type ClockInInput = z.infer<typeof clockInSchema>;
export type ActivityReportInput = z.infer<typeof activityReportSchema>;
export type DeleteDtrEntryInput = z.infer<typeof deleteDtrEntrySchema>;
