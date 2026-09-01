import { differenceInMinutes } from "date-fns"
import { z } from "zod"

import {
  BOOKING_SLOT_MINUTES,
  MAX_BOOKING_DURATION_MINUTES,
  MIN_BOOKING_DURATION_MINUTES,
} from "@/constants"

export const bookingFormSchema = z
  .object({
    title: z.string().trim().min(1),
    start: z.string(),
    end: z.string(),
    notes: z.string(),
  })
  .refine(
    (value) => {
      const duration = differenceInMinutes(
        new Date(`2000-01-01T${value.end}`),
        new Date(`2000-01-01T${value.start}`)
      )

      return (
        duration >= MIN_BOOKING_DURATION_MINUTES &&
        duration <= MAX_BOOKING_DURATION_MINUTES &&
        duration % BOOKING_SLOT_MINUTES === 0
      )
    },
    { path: ["end"], message: "invalidDuration" }
  )

export type TBookingForm = z.infer<typeof bookingFormSchema>
