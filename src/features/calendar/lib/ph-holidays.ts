export type HolidayType = "regular" | "special-non-working" | "special-working";
export type PhilippineHoliday = { date: string; name: string; type: HolidayType; verify?: true };

// Update this list each year from the Malacañang/Official Gazette holiday proclamation.
// Dates marked verify are proclamation- or moon-sighting-dependent and intentionally
// excluded until they are confirmed; do not substitute estimated dates.
const fixed = (year: number): PhilippineHoliday[] => [
  { date: `${year}-01-01`, name: "New Year's Day", type: "regular" },
  { date: `${year}-02-25`, name: "EDSA People Power Revolution Anniversary", type: "special-non-working" },
  { date: `${year}-04-09`, name: "Araw ng Kagitingan", type: "regular" },
  { date: `${year}-05-01`, name: "Labor Day", type: "regular" },
  { date: `${year}-06-12`, name: "Independence Day", type: "regular" },
  { date: `${year}-08-21`, name: "Ninoy Aquino Day", type: "special-non-working" },
  { date: `${year}-11-01`, name: "All Saints' Day", type: "special-non-working" },
  { date: `${year}-11-02`, name: "All Souls' Day", type: "special-non-working" },
  { date: `${year}-11-30`, name: "Bonifacio Day", type: "regular" },
  { date: `${year}-12-24`, name: "Christmas Eve", type: "special-non-working" },
  { date: `${year}-12-25`, name: "Christmas Day", type: "regular" },
  { date: `${year}-12-30`, name: "Rizal Day", type: "regular" },
  { date: `${year}-12-31`, name: "Last Day of the Year", type: "special-non-working" },
  { date: `${year}-00-00`, name: "Holy Week and Eid holidays", type: "regular", verify: true },
];

export const PHILIPPINE_HOLIDAYS: PhilippineHoliday[] = [
  ...fixed(2026),
  { date: "2026-08-31", name: "National Heroes Day", type: "regular" as HolidayType },
  ...fixed(2027),
  { date: "2027-08-30", name: "National Heroes Day", type: "regular" as HolidayType },
].filter((holiday) => holiday.date !== "2026-00-00" && holiday.date !== "2027-00-00");
