import { z } from "zod"

import {
  BOOKING_SLOT_MINUTES,
  MAX_BOOKING_DURATION_MINUTES,
  MIN_BOOKING_DURATION_MINUTES,
  TIME_VALUE_PATTERN,
  WORKING_HOURS,
} from "@/constants"
import { matchesCapacityBuckets } from "@/lib/roomCapacity"
import type { TCapacityBucket } from "@/types"

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
  Math.round(minutes / BOOKING_SLOT_MINUTES) * BOOKING_SLOT_MINUTES

export const editBookingFormSchema = z
  .object({
    title: z.string().trim().min(1),
    notes: z.string(),
    date: z.string().min(1),
    start: z.string().regex(TIME_VALUE_PATTERN),
    end: z.string().regex(TIME_VALUE_PATTERN),
    roomId: z.string().min(1),
    attendeeIds: z.array(z.string()),
  })
  .superRefine((values, context) => {
    const start = timeMinutes(values.start)
    const end = timeMinutes(values.end)
    const duration = end - start
    if (
      duration < MIN_BOOKING_DURATION_MINUTES ||
      duration > MAX_BOOKING_DURATION_MINUTES ||
      duration % BOOKING_SLOT_MINUTES !== 0
    )
      context.addIssue({ code: "custom", path: ["end"], message: "invalidDuration" })
    if (start < WORKING_HOURS.start * 60)
      context.addIssue({ code: "custom", path: ["start"], message: "outsideWorkingHours" })
    if (end > WORKING_HOURS.end * 60)
      context.addIssue({ code: "custom", path: ["end"], message: "outsideWorkingHours" })
  })

export type TEditBookingForm = z.infer<typeof editBookingFormSchema>

/** Checks whether a room capacity matches one of the selected filter buckets. */
export const capacityMatches = (capacity: number, buckets?: TCapacityBucket[]): boolean =>
  matchesCapacityBuckets(capacity, buckets)
