import { describe, expect, it } from "bun:test";
import {
  calculateWorkedMinutes,
  calculateTotalWorkedMinutes,
  formatWorkedHoursAndMinutes,
  formatWorkedDecimalHours,
} from "./calc-hours";

describe("DTR calc-hours pure calculations", () => {
  it("calculates 8:30 AM to 6:30 PM with 60-min lunch as 9 hours (540 mins) via historical snapshot", () => {
    const monday = {
      timeInMinutes: 510,
      timeOutMinutes: 1110,
      lunchMinutesApplied: 60,
    };

    const worked = calculateWorkedMinutes(monday);
    expect(worked).toBe(540);
    expect(formatWorkedHoursAndMinutes(worked)).toBe("9h 00m");
    expect(formatWorkedDecimalHours(worked)).toBe("9.00");
  });

  it("calculates shift with manual categorized break entries", () => {
    // 8:30 AM (510) to 6:30 PM (1110) = 600 mins raw
    // Breaks: Lunch (45m) + Coffee break (15m) = 60m total deduction
    // Net: 540m = 9h
    const shift = {
      timeInMinutes: 510,
      timeOutMinutes: 1110,
      breaks: [
        { durationMinutes: 45 },
        { durationMinutes: 15 },
      ],
    };

    const worked = calculateWorkedMinutes(shift);
    expect(worked).toBe(540);
  });

  it("applies zero deduction when no break entries are added", () => {
    // 8:00 AM (480) to 5:00 PM (1020) = 540 mins raw
    // No breaks added: 0 deduction
    const shift = {
      timeInMinutes: 480,
      timeOutMinutes: 1020,
      breaks: [],
    };

    const worked = calculateWorkedMinutes(shift);
    expect(worked).toBe(540);
  });

  it("returns 0 if shift is in progress (timeOutMinutes is null)", () => {
    const inProgress = {
      timeInMinutes: 510,
      timeOutMinutes: null,
      breaks: [],
    };

    expect(calculateWorkedMinutes(inProgress)).toBe(0);
  });

  it("returns 0 if timeOut is not after timeIn", () => {
    const invalid = {
      timeInMinutes: 600,
      timeOutMinutes: 500,
      breaks: [],
    };
    expect(calculateWorkedMinutes(invalid)).toBe(0);
  });

  it("returns 0 and never negative if break deductions exceed shift length", () => {
    const shortShift = {
      timeInMinutes: 540,
      timeOutMinutes: 570, // 30m shift
      breaks: [{ durationMinutes: 60 }],
    };
    expect(calculateWorkedMinutes(shortShift)).toBe(0);
  });

  it("formats fractional hours accurately", () => {
    expect(formatWorkedHoursAndMinutes(510)).toBe("8h 30m");
    expect(formatWorkedDecimalHours(510)).toBe("8.50");
    expect(formatWorkedHoursAndMinutes(465)).toBe("7h 45m");
    expect(formatWorkedDecimalHours(465)).toBe("7.75");
  });

  it("returns 0 for empty entries list", () => {
    expect(calculateTotalWorkedMinutes([])).toBe(0);
  });
});
