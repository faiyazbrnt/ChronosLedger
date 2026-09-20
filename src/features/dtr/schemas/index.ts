import { z } from "zod";

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
      .max(1439, "Time out must be within 24 hours"),
    note: z.string().max(500, "Note cannot exceed 500 characters").optional().nullable(),
  })
  .refine((data) => data.timeOutMinutes > data.timeInMinutes, {
    message: "Time out must be later than time in",
    path: ["timeOutMinutes"],
  });

export const deleteDtrEntrySchema = z.object({
  id: z.string().uuid("Invalid entry ID"),
});

export type DtrEntryInput = z.infer<typeof dtrEntrySchema>;
export type DeleteDtrEntryInput = z.infer<typeof deleteDtrEntrySchema>;
