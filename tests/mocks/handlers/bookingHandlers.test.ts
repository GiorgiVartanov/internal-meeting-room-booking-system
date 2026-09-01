import { beforeEach, describe, expect, it, vi } from "vitest"

import type { IBooking, ICreateBookingInput } from "@/types"

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

const API_URL = "http://localhost/api/bookings"
const NOW = new Date("2026-08-31T08:00:00.000Z")

const withBookingApi = async (run: () => Promise<void>) => {
  const { setupServer } = await import("msw/node")
  const { bookingHandlers } = await import("@/mocks/handlers/bookingHandlers")
  const server = setupServer(...bookingHandlers)
  server.listen({ onUnhandledRequest: "error" })
  try {
    await run()
  } finally {
    server.close()
  }
}

const findValidOpenSlot = async (): Promise<ICreateBookingInput> => {
  const { employeeRepository, roomRepository } = await import("@/mocks/db/repositories")
  const { validateBooking } = await import("@/mocks/handlers/bookingHandlers")
  const organizer = employeeRepository.list()[0]
  const rooms = roomRepository.list()
  expect(organizer).toBeDefined()

  for (let dayOffset = 1; dayOffset <= 45; dayOffset += 1) {
    const date = new Date(Date.UTC(2026, 7, 31 + dayOffset)).toISOString().slice(0, 10)
    for (const room of rooms) {
      const input: ICreateBookingInput = {
        roomId: room.id,
        title: "API boundary test",
        startAt: `${date}T07:00:00+04:00`,
        endAt: `${date}T07:15:00+04:00`,
        attendeeIds: [],
        notes: "Created by the booking handler test",
      }
      if (!validateBooking({ ...input, organizerId: organizer?.id ?? "" })) return input
    }
  }

  throw new Error("The seed data did not contain an open test slot.")
}

const postBooking = (input: ICreateBookingInput, employeeId: string) =>
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Employee-Id": employeeId },
    body: JSON.stringify(input),
  })

describe("booking HTTP handlers", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    vi.stubGlobal("localStorage", new MemoryStorage())
    vi.stubGlobal("location", new URL("http://localhost"))
  })

  it("creates an authenticated booking and persists server-owned fields", async () => {
    await withBookingApi(async () => {
      const { bookingRepository, employeeRepository } = await import("@/mocks/db/repositories")
      const employee = employeeRepository.list()[0]
      const input = await findValidOpenSlot()
      const countBefore = bookingRepository.list().length
      expect(employee).toBeDefined()
      if (!employee) return

      const response = await postBooking(input, employee.id)
      const created = (await response.json()) as IBooking

      expect(response.status).toBe(201)
      expect(created).toMatchObject({ ...input, organizerId: employee.id, status: "confirmed" })
      expect(created.id).toEqual(expect.any(String))
      expect(created.createdAt).toBe(NOW.toISOString())
      expect(bookingRepository.list()).toHaveLength(countBefore + 1)
      expect(bookingRepository.get(created.id)).toEqual(created)
    })
  })

  it("rejects a room overlap without writing a second booking", async () => {
    await withBookingApi(async () => {
      const { bookingRepository, employeeRepository } = await import("@/mocks/db/repositories")
      const employee = employeeRepository.list()[0]
      const input = await findValidOpenSlot()
      expect(employee).toBeDefined()
      if (!employee) return

      const firstResponse = await postBooking(input, employee.id)
      expect(firstResponse.status).toBe(201)
      const countAfterFirst = bookingRepository.list().length
      const conflictingResponse = await postBooking(
        { ...input, title: "Conflicting meeting" },
        employee.id
      )

      expect(conflictingResponse.status).toBe(422)
      await expect(conflictingResponse.json()).resolves.toMatchObject({
        code: "INVALID_BOOKING",
        message: "This room is already booked during the selected time.",
      })
      expect(bookingRepository.list()).toHaveLength(countAfterFirst)
    })
  })

  it("updates an owned booking while preserving identity and creation metadata", async () => {
    await withBookingApi(async () => {
      const { bookingRepository, employeeRepository } = await import("@/mocks/db/repositories")
      const employee = employeeRepository.list()[0]
      expect(employee).toBeDefined()
      if (!employee) return
      const createdResponse = await postBooking(await findValidOpenSlot(), employee.id)
      const created = (await createdResponse.json()) as IBooking

      const response = await fetch(`${API_URL}/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Employee-Id": employee.id },
        body: JSON.stringify({ title: "Updated through HTTP", notes: "Updated notes" }),
      })
      const updated = (await response.json()) as IBooking

      expect(response.status).toBe(200)
      expect(updated).toMatchObject({
        id: created.id,
        organizerId: created.organizerId,
        createdAt: created.createdAt,
        title: "Updated through HTTP",
        notes: "Updated notes",
      })
      expect(bookingRepository.get(created.id)).toEqual(updated)
    })
  })

  it("does not let another employee edit or cancel a booking", async () => {
    await withBookingApi(async () => {
      const { bookingRepository, employeeRepository } = await import("@/mocks/db/repositories")
      const [organizer, otherEmployee] = employeeRepository.list()
      expect(organizer).toBeDefined()
      expect(otherEmployee).toBeDefined()
      if (!organizer || !otherEmployee) return
      const createdResponse = await postBooking(await findValidOpenSlot(), organizer.id)
      const created = (await createdResponse.json()) as IBooking

      const updateResponse = await fetch(`${API_URL}/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Employee-Id": otherEmployee.id },
        body: JSON.stringify({ title: "Unauthorized change" }),
      })
      const cancelResponse = await fetch(`${API_URL}/${created.id}`, {
        method: "DELETE",
        headers: { "X-Employee-Id": otherEmployee.id },
      })

      expect(updateResponse.status).toBe(403)
      expect(cancelResponse.status).toBe(403)
      expect(bookingRepository.get(created.id)).toEqual(created)
    })
  })
})
