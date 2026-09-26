import { describe, expect, it } from "bun:test";
import {
  dtrEntrySchema,
  clockInSchema,
  activityReportSchema,
  deleteDtrEntrySchema,
} from "../schemas";

describe("DTR Schemas & Validation", () => {
  describe("dtrEntrySchema", () => {
    it("validates a standard 8:30 AM to 6:30 PM entry with breaks", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: 510,
        timeOutMinutes: 1110,
        breaks: [
          { category: "Lunch", durationMinutes: 45 },
          { category: "Coffee break", durationMinutes: 15 },
        ],
        note: "Normal shift",
      });
      expect(result.success).toBe(true);
    });

    it("validates a clock-in shift with null or omitted timeOutMinutes", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: 510,
        timeOutMinutes: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects timeOutMinutes that is equal to timeInMinutes when timeOut is specified", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: 540,
        timeOutMinutes: 540,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.timeOutMinutes).toBeDefined();
      }
    });

    it("rejects timeOutMinutes that is earlier than timeInMinutes", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: 600,
        timeOutMinutes: 500,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.timeOutMinutes).toBeDefined();
      }
    });

    it("rejects negative break duration", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: 480,
        timeOutMinutes: 1020,
        breaks: [{ category: "Lunch", durationMinutes: -15 }],
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty category for a break", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: 480,
        timeOutMinutes: 1020,
        breaks: [{ category: "", durationMinutes: 30 }],
      });
      expect(result.success).toBe(false);
    });

    it("rejects malformed workDate", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "21-09-2026",
        timeInMinutes: 480,
        timeOutMinutes: 1020,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative timeInMinutes", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: -1,
        timeOutMinutes: 600,
      });
      expect(result.success).toBe(false);
    });

    it("rejects timeInMinutes exceeding 1439", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: 1440,
        timeOutMinutes: 1500,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("clockInSchema", () => {
    it("validates clock-in with workDate and timeIn", () => {
      const result = clockInSchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: 510,
        note: "Starting morning shift",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("activityReportSchema", () => {
    it("validates full activity report input", () => {
      const result = activityReportSchema.safeParse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        activity: "Onboarding and training modules",
        activityDescription: "Completed modules 1 through 4 including practical labs.",
        remarks: "Smooth progress with mentor approval.",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("deleteDtrEntrySchema", () => {
    it("validates a standard UUID", () => {
      const result = deleteDtrEntrySchema.safeParse({
        id: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID string", () => {
      const result = deleteDtrEntrySchema.safeParse({
        id: "not-a-valid-uuid",
      });
      expect(result.success).toBe(false);
    });
  });
});
