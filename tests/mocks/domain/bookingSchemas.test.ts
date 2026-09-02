import { describe, expect, it } from "vitest"

import { createBookingSchema, updateBookingSchema } from "@/mocks/domain/bookingSchemas"

const validCreate = {
  roomId: "room-sommen",
  title: "Planning",
  startAt: "2026-09-01T05:00:00.000Z",
  endAt: "2026-09-01T06:00:00.000Z",
  attendeeIds: [],
}

describe("booking request schemas", () => {
  it("rejects client-owned organizer and server-owned fields during creation", () => {
    expect(
      createBookingSchema.safeParse({ ...validCreate, organizerId: "spoofed-employee" }).success
    ).toBe(false)
  })

  it("rejects server-owned fields during editing", () => {
    expect(updateBookingSchema.safeParse({ status: "cancelled" }).success).toBe(false)
    expect(updateBookingSchema.safeParse({ id: "replacement-id" }).success).toBe(false)
  })

  it("accepts a whitelisted booking update", () => {
    expect(updateBookingSchema.safeParse({ title: "Updated planning" }).success).toBe(true)
  })

  it("requires ISO timestamps with an explicit timezone", () => {
    expect(
      createBookingSchema.safeParse({ ...validCreate, startAt: "2026-09-01 05:00:00" }).success
    ).toBe(false)
    expect(
      createBookingSchema.safeParse({ ...validCreate, startAt: "2026-09-01T05:00:00" }).success
    ).toBe(false)
  })
})
