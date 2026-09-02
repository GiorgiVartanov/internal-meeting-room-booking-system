import { isValid, parseISO } from "date-fns"

import {
  BOOKING_SLOT_MINUTES,
  MAX_BOOKING_DURATION_MINUTES,
  MIN_BOOKING_DURATION_MINUTES,
  TIME_VALUE_PATTERN,
  WORKING_HOURS,
} from "@/constants"

/** Converts a 24-hour time field value into minutes from midnight. */
export const timeMinutes = (value: string): number => {
  const [hour = Number.NaN, minute = Number.NaN] = value.split(":").map(Number)

  return hour * 60 + minute
}

/** Formats minutes from midnight for a native time input. */
export const timeValue = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`

/** Constrains a booking value to an inclusive numeric interval. */
export const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value))

/** Rounds a minute value down to the nearest configured booking slot. */
export const toBookingSlot = (minutes: number): number =>
  Math.floor(minutes / BOOKING_SLOT_MINUTES) * BOOKING_SLOT_MINUTES

/** Checks that a date input contains a real calendar date in ISO date form. */
export const isValidDateValue = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value))

/** Returns the localized validation key for an invalid booking time range. */
export const bookingTimeRangeError = (startValue: string, endValue: string): string | undefined => {
  if (!TIME_VALUE_PATTERN.test(startValue) || !TIME_VALUE_PATTERN.test(endValue))
    return "invalidDuration"

  const start = timeMinutes(startValue)
  const end = timeMinutes(endValue)
  const duration = end - start
  if (
    duration < MIN_BOOKING_DURATION_MINUTES ||
    duration > MAX_BOOKING_DURATION_MINUTES ||
    duration % BOOKING_SLOT_MINUTES !== 0
  )
    return "invalidDuration"
  if (start < WORKING_HOURS.start * 60 || end > WORKING_HOURS.end * 60) return "outsideWorkingHours"

  return undefined
}
