import { describe, expect, it } from "vitest"

import holidayRules from "@/mocks/data/holidays.json"
import { expandGeorgianHolidayRules } from "@/mocks/domain/georgianHolidays"

describe("Georgian public holidays", () => {
  it("repeats fixed holidays for every requested year", () => {
    const holidays = expandGeorgianHolidayRules(holidayRules, 2026, 2027)

    expect(holidays.some((holiday) => holiday.date === "2026-01-19")).toBe(true)
    expect(holidays.some((holiday) => holiday.date === "2027-01-19")).toBe(true)
    expect(holidays.some((holiday) => holiday.date === "2027-05-17")).toBe(true)
  })

  it("calculates the four movable Orthodox Easter holidays", () => {
    const holidays = expandGeorgianHolidayRules(holidayRules, 2026, 2026)
    const dates = holidays.map((holiday) => holiday.date)

    expect(dates).toEqual(
      expect.arrayContaining(["2026-04-10", "2026-04-11", "2026-04-12", "2026-04-13"])
    )
  })
})
