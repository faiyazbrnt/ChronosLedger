import { describe, expect, it } from "bun:test";
import { dtrEntrySchema, deleteDtrEntrySchema } from "../schemas";

describe("DTR Schemas & Validation", () => {
  describe("dtrEntrySchema", () => {
    it("validates a standard 8:30 AM to 6:30 PM entry", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: 510,
        timeOutMinutes: 1110,
        note: "Normal shift",
      });
      expect(result.success).toBe(true);
    });

    it("rejects timeOutMinutes that is equal to timeInMinutes", () => {
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

    it("rejects malformed workDate", () => {
      const result = dtrEntrySchema.safeParse({
        workDate: "21-09-2026",
        timeInMinutes: 480,
        timeOutMinutes: 1020,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.workDate).toBeDefined();
      }
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

    it("rejects note longer than 500 characters", () => {
      const longNote = "a".repeat(501);
      const result = dtrEntrySchema.safeParse({
        workDate: "2026-09-21",
        timeInMinutes: 510,
        timeOutMinutes: 1020,
        note: longNote,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.note).toBeDefined();
      }
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
