import { z } from "zod"

import { TIME_VALUE_PATTERN } from "@/constants"
import { matchesCapacityBuckets } from "@/lib/roomCapacity"
import type { TCapacityBucket } from "@/types"

export { clamp, isValidDateValue, timeMinutes, timeValue, toBookingSlot } from "./bookingValidation"

import { bookingTimeRangeError, isValidDateValue } from "./bookingValidation"

export const editBookingFormSchema = z
  .object({
    title: z.string().trim().min(1),
    notes: z.string(),
    date: z.string().refine(isValidDateValue, { message: "dateUnavailable" }),
    start: z.string().regex(TIME_VALUE_PATTERN),
    end: z.string().regex(TIME_VALUE_PATTERN),
    roomId: z.string().min(1),
    attendeeIds: z.array(z.string()),
  })
  .superRefine((values, context) => {
    const error = bookingTimeRangeError(values.start, values.end)
    if (error) context.addIssue({ code: "custom", path: ["end"], message: error })
  })

export type TEditBookingForm = z.infer<typeof editBookingFormSchema>

/** Checks whether a room capacity matches one of the selected filter buckets. */
export const capacityMatches = (capacity: number, buckets?: TCapacityBucket[]): boolean =>
  matchesCapacityBuckets(capacity, buckets)
