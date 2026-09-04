import { beforeEach, describe, expect, it, vi } from "vitest"

import { DATA_SCHEMA_VERSION } from "@/constants"

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe("booking repository cancellation", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal("localStorage", new MemoryStorage())
  })

  it("preserves the record and changes its status to cancelled", async () => {
    const { bookingRepository } = await import("@/mocks/db/repositories")
    const before = bookingRepository.list()
    const booking = before[0]
    expect(booking).toBeDefined()
    if (!booking) return

    const cancelled = bookingRepository.cancel(booking.id)
    const after = bookingRepository.list()

    expect(after).toHaveLength(before.length)
    expect(cancelled?.status).toBe("cancelled")
    expect(cancelled?.cancelledAt).toBeTruthy()
    expect(after.find((item) => item.id === booking.id)?.status).toBe("cancelled")
  })

  it("reseeds bookings when persisted data contains an invalid record", async () => {
    localStorage.setItem(
      `meeting-room-booking:v${DATA_SCHEMA_VERSION}:bookings`,
      '[{"title":"broken"}]'
    )
    const { bookingRepository } = await import("@/mocks/db/repositories")

    const bookings = bookingRepository.list()

    expect(bookings.length).toBeGreaterThan(0)
    expect(bookings.every((booking) => Boolean(booking.id))).toBe(true)
  })

  it("reseeds bookings when persisted timestamps cannot be displayed", async () => {
    localStorage.setItem(
      `meeting-room-booking:v${DATA_SCHEMA_VERSION}:bookings`,
      JSON.stringify([
        {
          id: "broken-booking",
          roomId: "room-sommen",
          organizerId: "employee-193846",
          title: "Broken booking",
          startAt: "not-a-date",
          endAt: "not-a-date",
          attendeeIds: [],
          status: "confirmed",
          createdAt: "not-a-date",
          updatedAt: "not-a-date",
        },
      ])
    )
    const { bookingRepository } = await import("@/mocks/db/repositories")

    expect(bookingRepository.list().some((booking) => booking.id === "broken-booking")).toBe(false)
  })
})
