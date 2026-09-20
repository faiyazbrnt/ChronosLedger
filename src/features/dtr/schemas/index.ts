import { z } from "zod";

export const dtrEntrySchema = z
  .object({
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    timeInMinutes: z.number().int().min(0).max(1439),
    timeOutMinutes: z.number().int().min(0).max(1439),
    note: z.string().max(500).optional(),
  })
  .refine((data) => data.timeOutMinutes > data.timeInMinutes, {
    message: "Time out must be later than time in",
    path: ["timeOutMinutes"],
  });

export type DtrEntryInput = z.infer<typeof dtrEntrySchema>;
