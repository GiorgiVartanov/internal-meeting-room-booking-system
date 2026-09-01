import { BOOKING_SLOT_MINUTES, WORKING_HOURS } from "@/constants"

export const TIMELINE_PIXELS_PER_MINUTE = 1.15
export const TIMELINE_FIRST_MINUTE = WORKING_HOURS.start * 60
export const TIMELINE_DAY_MINUTES = (WORKING_HOURS.end - WORKING_HOURS.start) * 60
export const TIMELINE_SLOTS = Array.from(
  { length: TIMELINE_DAY_MINUTES / BOOKING_SLOT_MINUTES },
  (_, index) => TIMELINE_FIRST_MINUTE + index * BOOKING_SLOT_MINUTES
)
/** Formats a minute offset from midnight as a zero-padded 24-hour time. */
export const timelineTimeText = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
