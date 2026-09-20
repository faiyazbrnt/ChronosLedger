import { describe, expect, it } from "bun:test";
import {
  calculateWorkedMinutes,
  calculateTotalWorkedMinutes,
  formatWorkedHoursAndMinutes,
  formatWorkedDecimalHours,
} from "./calc-hours";

describe("DTR calc-hours pure calculations", () => {
  it("calculates 8:30 AM to 6:30 PM with 60-min lunch as 9 hours (540 mins)", () => {
    // 8:30 AM = 8 * 60 + 30 = 510
    // 6:30 PM = 18 * 60 + 30 = 1110
    // Net: (1110 - 510) - 60 = 600 - 60 = 540 minutes = 9h
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

  it("calculates Monday plus Tuesday as 18 hours (1080 mins)", () => {
    const monday = {
      timeInMinutes: 510,
      timeOutMinutes: 1110,
      lunchMinutesApplied: 60,
    };
    const tuesday = {
      timeInMinutes: 510,
      timeOutMinutes: 1110,
      lunchMinutesApplied: 60,
    };

    const totalMinutes = calculateTotalWorkedMinutes([monday, tuesday]);
    expect(totalMinutes).toBe(1080);
    expect(formatWorkedHoursAndMinutes(totalMinutes)).toBe("18h 00m");
    expect(formatWorkedDecimalHours(totalMinutes)).toBe("18.00");
  });

  it("applies 0 lunch minutes if lunch deduction is turned off", () => {
    const shift = {
      timeInMinutes: 480, // 8:00 AM
      timeOutMinutes: 1020, // 5:00 PM (9 hours raw)
      lunchMinutesApplied: 0,
    };

    const worked = calculateWorkedMinutes(shift);
    expect(worked).toBe(540);
  });

  it("returns 0 if timeOut is not after timeIn", () => {
    const invalid = {
      timeInMinutes: 600,
      timeOutMinutes: 500,
      lunchMinutesApplied: 60,
    };
    expect(calculateWorkedMinutes(invalid)).toBe(0);
  });

  it("returns 0 and never negative if lunch deduction exceeds shift length", () => {
    const shortShift = {
      timeInMinutes: 540, // 9:00 AM
      timeOutMinutes: 570, // 9:30 AM (30 mins raw)
      lunchMinutesApplied: 60, // 60 mins lunch
    };
    expect(calculateWorkedMinutes(shortShift)).toBe(0);
  });

  it("formats fractional hours accurately", () => {
    // 8h 30m = 510 minutes
    expect(formatWorkedHoursAndMinutes(510)).toBe("8h 30m");
    expect(formatWorkedDecimalHours(510)).toBe("8.50");

    // 7h 45m = 465 minutes
    expect(formatWorkedHoursAndMinutes(465)).toBe("7h 45m");
    expect(formatWorkedDecimalHours(465)).toBe("7.75");
  });

  it("returns 0 for empty entries list", () => {
    expect(calculateTotalWorkedMinutes([])).toBe(0);
  });
});
