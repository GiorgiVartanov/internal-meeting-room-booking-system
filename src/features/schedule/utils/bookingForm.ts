import { z } from "zod"

import { TIME_VALUE_PATTERN } from "@/constants"

import { bookingTimeRangeError } from "./bookingValidation"

export const bookingFormSchema = z
  .object({
    title: z.string().trim().min(1),
    start: z.string().regex(TIME_VALUE_PATTERN),
    end: z.string().regex(TIME_VALUE_PATTERN),
    notes: z.string(),
  })
  .superRefine((values, context) => {
    const error = bookingTimeRangeError(values.start, values.end)
    if (error) context.addIssue({ code: "custom", path: ["end"], message: error })
  })

export type TBookingForm = z.infer<typeof bookingFormSchema>
