import { describe, expect, it } from "vitest"

import {
  bookingTimeRangeError,
  isValidDateValue,
  toBookingSlot,
} from "@/features/schedule/utils/bookingValidation"

describe("booking form validation", () => {
  it("rounds typed times down to the preceding slot", () => {
    expect(toBookingSlot(9 * 60 + 8)).toBe(9 * 60)
    expect(toBookingSlot(9 * 60 + 22)).toBe(9 * 60 + 15)
  })

  it("rejects impossible date values", () => {
    expect(isValidDateValue("2026-02-29")).toBe(false)
    expect(isValidDateValue("2028-02-29")).toBe(true)
  })

  it("uses the same working-hour validation in every booking form", () => {
    expect(bookingTimeRangeError("06:45", "07:15")).toBe("outsideWorkingHours")
    expect(bookingTimeRangeError("07:00", "07:15")).toBeUndefined()
  })
})
