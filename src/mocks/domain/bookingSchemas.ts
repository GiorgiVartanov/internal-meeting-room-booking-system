import { z } from "zod"

const timestamp = z.string().datetime({
  offset: true,
  message: "A valid ISO 8601 timestamp with a timezone offset is required.",
})

export const createBookingSchema = z
  .object({
    roomId: z.string().min(1),
    title: z.string().trim().min(1),
    startAt: timestamp,
    endAt: timestamp,
    attendeeIds: z.array(z.string().min(1)),
    notes: z.string().optional(),
  })
  .strict()

export const updateBookingSchema = z
  .object({
    roomId: z.string().min(1).optional(),
    title: z.string().trim().min(1).optional(),
    startAt: timestamp.optional(),
    endAt: timestamp.optional(),
    attendeeIds: z.array(z.string().min(1)).optional(),
    notes: z.string().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, { message: "No changes were provided." })
